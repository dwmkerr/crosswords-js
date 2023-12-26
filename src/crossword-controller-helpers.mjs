import { assert, trace, setLetter } from './helpers.mjs';
import { hideElement, showElement } from './crossword-gridview.mjs';

function revealCell(controller, cell) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;
  const solutionLetter =
    letterIndex < clue.solution?.length ? clue.solution[letterIndex] : ' ';
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
  trace(`revealClue: '${clue}'`);
  clue.headSegment.flatCells.forEach((cell) => {
    revealCell(controller, cell);
  });
}

function revealCrossword(controller) {
  assert(controller, '<controller> is null or undefined');
  controller.model.lightCells.forEach((cell) => {
    revealCell(controller, cell);
  });
}

const Outcome = Object.freeze({
  correct: 0, // 0 elements empty, N elements correct
  incorrect: 1, // 1+ elements incorrect
  incomplete: 2, // 1+ elements empty, 0 elements incorrect
});

function getOutcome(incorrect, incomplete) {
  if (incorrect) {
    return Outcome.incorrect;
  } else if (incomplete) {
    return Outcome.incomplete;
  } else {
    return Outcome.correct;
  }
}

function testCell(controller, cell, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');

  // Get index of cell-letter in clue
  // Cell can be in across and/or down clue
  const [clue, letterIndex] = cell.acrossClue
    ? [cell.acrossClue, cell.acrossClueLetterIndex]
    : [cell.downClue, cell.downClueLetterIndex];
  const answerLetter = clue.answer[letterIndex];
  const solutionLetter = clue.solution ? clue.solution[letterIndex] : undefined;
  const outcome = getOutcome(
    !(answerLetter === solutionLetter || answerLetter === ' '),
    answerLetter === ' ' || answerLetter === undefined,
  );

  if (outcome === Outcome.incorrect && showIncorrect) {
    // set visual flag in cell that answer letter is incorrect
    showElement(controller.incorrectElement(cell));
  }
  return outcome;
}

function testClue(controller, clue, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`testClue: '${clue}'`);

  let incorrect = 0,
    incomplete = 0;

  clue.headSegment.flatCells.forEach((cell) => {
    const outcome = testCell(controller, cell, showIncorrect);
    if (outcome === Outcome.incorrect) {
      incorrect += 1;
    } else if (outcome === Outcome.incomplete) {
      incomplete += 1;
    }
  });

  return getOutcome(incorrect > 0, incomplete > 0);
}

function testCrossword(controller, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  let incorrect = 0,
    incomplete = 0;

  controller.model.lightCells.forEach((cell) => {
    const outcome = testCell(controller, cell, showIncorrect);
    if (outcome === Outcome.incorrect) {
      incorrect += 1;
    } else if (outcome === Outcome.incomplete) {
      incomplete += 1;
    }
  });

  return getOutcome(incorrect > 0, incomplete > 0);
}

function checkSolved(controller) {
  assert(controller, '<controller> is null or undefined');
  let incorrect = 0,
    incomplete = 0;
  const showIncorrect = false;
  // short-circuit a non-correct result - use find()
  controller.model.lightCells.find((cell) => {
    const outcome = testCell(controller, cell, showIncorrect);
    if (outcome === Outcome.incorrect) {
      incorrect += 1;
      return true;
    } else if (outcome === Outcome.incomplete) {
      incomplete += 1;
      return true;
    }
  });

  return getOutcome(incorrect > 0, incomplete > 0);
}

function setCellText(controller, cell, newText, clearRevealed = true) {
  assert(controller, '<controller> is null or undefined');
  assert(
    cell?.acrossClue || cell?.downClue,
    'cell is null or not part of a clue',
  );
  assert(newText?.length === 1, 'newText must be a single character');

  function adjustClue(clue, letterIndex) {
    let result = clue;
    result.answer = setLetter(result.answer, letterIndex, newText);
    if (clearRevealed) {
      result.revealed = setLetter(result.revealed, letterIndex, newText);
    }
  }
  // Cell can be part of BOTH across and down clues

  // Outcome for across clue
  if (cell.acrossClue) {
    let clue = cell.acrossClue;
    // get index of cell-letter in clue
    const letterIndex = cell.acrossClueLetterIndex;
    // set stored values
    adjustClue(clue, letterIndex);
  }

  // Outcome for down clue
  if (cell.downClue) {
    let clue = cell.downClue;
    // get index of cell-letter in clue
    const letterIndex = cell.downClueLetterIndex;
    // set stored values
    adjustClue(clue, letterIndex);
  }
  // eslint-disable-next-line no-param-reassign
  controller.setCellElementText(cell, newText);
}

function resetCell(controller, cell, clearRevealed = false) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');

  // put a space in the cell
  setCellText(controller, cell, ' ');
  // remove visual flags in cell
  hideElement(controller.incorrectElement(cell));
  if (clearRevealed) {
    hideElement(controller.revealedElement(cell));
  }
}

function resetClue(controller, clue) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`resetClue: '${clue}'`);

  clue.headSegment.flatCells.forEach((cell) => {
    resetCell(controller, cell);
  });
}

function resetCrossword(controller) {
  assert(controller, '<controller> is null or undefined');
  controller.model.lightCells.forEach((cell) => {
    const clearRevealed = true;
    resetCell(controller, cell, clearRevealed);
  });
}

function cleanCell(controller, cell) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');

  const wrongLetter = testCell(controller, cell) === Outcome.incorrect;
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
  trace(`cleanClue: '${clue}'`);
  clue.headSegment.flatCells.forEach((cell) => {
    cleanCell(controller, cell);
  });
}

function cleanCrossword(controller) {
  trace('cleanCrossword');
  assert(controller, '<controller> is null or undefined');
  controller.model.lightCells.forEach((cell) => {
    cleanCell(controller, cell);
  });
}

export {
  checkSolved,
  cleanClue,
  cleanCrossword,
  Outcome,
  resetClue,
  resetCrossword,
  revealCell,
  revealClue,
  revealCrossword,
  setCellText,
  testClue,
  testCrossword,
};
