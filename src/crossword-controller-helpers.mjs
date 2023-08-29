import { assert, newEnum, memoize, trace, setLetter } from './helpers.mjs';

const hideElement = (element) => {
  element && element.classList.add('hidden');
};
const showElement = (element) => {
  element && element.classList.remove('hidden');
};

// Helper function to filter single-segment and anchor-segment clues
// from clue array
const anchorSegmentClues = memoize((clues) => {
  return clues.filter((x) => !x.previousClueSegment);
});

function revealCell(controller, cell) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');
  // trace(`revealCell:(${cell.x},${cell.y})`);
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;
  const solutionLetter = clue.solution[letterIndex];
  // trace(`revealCell: solution:${clue.solution},letterIndex:${letterIndex})`);
  const clearRevealed = false;
  setCellText(controller, cell, solutionLetter, clearRevealed);
  // set visual flag in cell that letter has been revealed
  showElement(controller.revealedElement(cell));
  // clear visual flag in cell if letter was incorrect
  hideElement(controller.incorrectElement(cell));
}

function revealClue(controller, clue) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`revealClue: '${clue.code}'`);
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      revealCell(controller, cell);
    });
  });
}

function revealCrossword(controller) {
  assert(controller, '<controller> is null or undefined');
  trace('revealCrossword');
  controller.crosswordModel.cells.forEach((row) => {
    row
      .filter((x) => x.light)
      .forEach((cell) => {
        revealCell(controller, cell);
      });
  });
}

const Outcome = newEnum([
  'Correct', // 0 elements empty, N elements correct
  'Incorrect', // 1+ elements incorrect
  'Incomplete', // 1+ elements empty, 0 elements incorrect
]);

function testCell(controller, cell, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');

  // Get index of cell-letter in clue
  // Cell can be in across and/or down clue
  const [clue, letterIndex] = cell.acrossClue
    ? [cell.acrossClue, cell.acrossClueLetterIndex]
    : [cell.downClue, cell.downClueLetterIndex];
  const answerLetter = clue.answer[letterIndex];
  const solutionLetter = clue.solution[letterIndex];
  const outcome =
    answerLetter === solutionLetter
      ? Outcome.Correct
      : answerLetter === ' ' || answerLetter === undefined
      ? Outcome.Incomplete
      : Outcome.Incorrect;
  // trace(
  //   `testCell(${cell.x},${cell.y}): [${answerLetter}] [${solutionLetter}] ${outcome}`
  // );

  if (outcome === Outcome.Incorrect && showIncorrect) {
    // set visual flag in cell that answer letter is incorrect
    showElement(controller.incorrectElement(cell));
  }
  return outcome;
}

function testClue(controller, clue, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`testClue: '${clue.code}'`);

  let incorrect = 0,
    incomplete = 0;
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    // short-circuit an incorrect result`- use find()
    c.cells.forEach((cell) => {
      const outcome = testCell(controller, cell, showIncorrect);
      if (outcome === Outcome.Incorrect) {
        incorrect += 1;
        // trace(`incorrect: ${incorrect}`);
      } else if (outcome === Outcome.Incomplete) {
        incomplete += 1;
        // trace(`incomplete: ${incomplete}`);
      }
    });
  });
  return incorrect > 0
    ? Outcome.Incorrect
    : incomplete > 0
    ? Outcome.Incomplete
    : Outcome.Correct;
}

function testCrossword(controller, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  // trace('testCrossword');
  let incorrect = 0,
    incomplete = 0;
  controller.crosswordModel.cells.forEach((row) => {
    row
      .filter((x) => x.light)
      .forEach((cell) => {
        const outcome = testCell(controller, cell, showIncorrect);
        if (outcome === Outcome.Incorrect) {
          incorrect += 1;
          // trace(`incorrect: ${incorrect}`);
        } else if (outcome === Outcome.Incomplete) {
          incomplete += 1;
          // trace(`incomplete: ${incomplete}`);
        }
      });
  });

  return incorrect > 0
    ? Outcome.Incorrect
    : incomplete > 0
    ? Outcome.Incomplete
    : Outcome.Correct;
}

function checkSolved(controller) {
  // trace('checkSolved');
  assert(controller, '<controller> is null or undefined');
  let incorrect = 0,
    incomplete = 0;
  const showIncorrect = false;
  // short-circuit a non-correct result - use find()
  controller.crosswordModel.cells.find((row) => {
    return row
      .filter((x) => x.light)
      .find((cell) => {
        const outcome = testCell(controller, cell, showIncorrect);
        if (outcome === Outcome.Incorrect) {
          incorrect = 1;
          // trace(`incorrect: ${incorrect}`);
          return true;
        } else if (outcome === Outcome.Incomplete) {
          incomplete = 1;
          // trace(`incomplete: ${incomplete}`);
          return true;
        }
      });
  });

  return incorrect > 0
    ? Outcome.Incorrect
    : incomplete > 0
    ? Outcome.Incomplete
    : Outcome.Correct;
}

function setCellText(controller, cell, newText, clearRevealed) {
  assert(
    cell && (cell.acrossClue || cell.downClue),
    'setCellText: cell is null or not part of a clue',
  );

  function adjustClue(clue, letterIndex) {
    let result = clue;
    result.answer = setLetter(result.answer, letterIndex, newText);
    if (clearRevealed) {
      result.revealed = setLetter(result.revealed, letterIndex, newText);
    }
    return result;
  }
  // Cell can be part of BOTH across and down clues

  // Outcome for across clue
  if (cell.acrossClue) {
    let clue = cell.acrossClue;
    // get index of cell-letter in clue
    const letterIndex = cell.acrossClueLetterIndex;
    // set stored values
    clue = adjustClue(clue, letterIndex);
  }

  // Outcome for down clue
  if (cell.downClue) {
    let clue = cell.downClue;
    // get index of cell-letter in clue
    const letterIndex = cell.downClueLetterIndex;
    // set stored values
    clue = adjustClue(clue, letterIndex);
  }
  // eslint-disable-next-line no-param-reassign
  controller.inputElement(cell).value = newText;
}

function resetCell(controller, cell) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');
  // trace(`resetCell:(${cell.x},${cell.y})`);

  const clearRevealed = true;
  // put a space in the cell
  setCellText(controller, cell, ' ', clearRevealed);
  // remove visual flags in cell
  hideElement(controller.incorrectElement(cell));
}

function resetClue(controller, clue) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`resetClue: '${clue.code}'`);

  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      resetCell(controller, cell);
    });
  });
}

function resetCrossword(controller) {
  trace('resetCrossword');
  assert(controller, '<controller> is null or undefined');
  controller.crosswordModel.cells.forEach((row) => {
    row
      .filter((x) => x.light)
      .forEach((cell) => {
        resetCell(controller, cell);
      });
  });
}

function cleanCell(controller, cell) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');
  // trace(`cleanCell:(${cell.x},${cell.y})`);

  const wrongLetter = testCell(controller, cell) === Outcome.Incorrect;
  const clearRevealed = wrongLetter;
  // is the current cell letter incorrect?
  if (wrongLetter) {
    setCellText(controller, cell, ' ', clearRevealed);
    // remove visual flags in cell
    hideElement(controller.incorrectElement(cell));
  }
}

function cleanClue(controller, clue) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`cleanClue: '${clue.code}'`);
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      cleanCell(controller, cell);
    });
  });
}

function cleanCrossword(controller) {
  trace('cleanCrossword');
  assert(controller, '<controller> is null or undefined');
  controller.crosswordModel.cells.forEach((row) => {
    row
      .filter((x) => x.light)
      .forEach((cell) => {
        cleanCell(controller, cell);
      });
  });
}

export {
  anchorSegmentClues,
  checkSolved,
  cleanClue,
  cleanCrossword,
  hideElement,
  Outcome,
  resetClue,
  resetCrossword,
  revealCell,
  revealClue,
  revealCrossword,
  showElement,
  testClue,
  testCrossword,
};
