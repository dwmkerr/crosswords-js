import { assert, memoize, trace, setLetter } from './helpers.mjs';

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

function testCell(controller, cell, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');

  // Get index of cell-letter in clue
  // Cell can be in across and/or down clue
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;
  // trace(`testCell(${cell.x},${cell.y}): answer: <${clue.answer}>`);
  const answerLetter = clue.answer[letterIndex];
  const solutionLetter = clue.solution[letterIndex];
  const success = answerLetter === solutionLetter;
  // trace(`testCell(${cell.x},${cell.y}): ${success}`);

  if (!(success || answerLetter === ' ') && showIncorrect) {
    // set visual flag in cell that answer letter is incorrect
    showElement(controller.incorrectElement(cell));
  }
  return success;
}

function testClue(controller, clue, showIncorrect = true) {
  assert(controller, '<controller> is null or undefined');
  assert(clue, '<clue> is null or undefined');
  trace(`testClue: '${clue.code}'`);

  let success = true;
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      success = testCell(controller, cell, showIncorrect) && success;
    });
  });
  return success;
}

function setCellText(controller, cell, newText, clearRevealed) {
  assert(
    cell && (cell.acrossClue || cell.downClue),
    'setCellText: cell is null or not part of a clue'
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

  // Test for across clue
  if (cell.acrossClue) {
    let clue = cell.acrossClue;
    // get index of cell-letter in clue
    const letterIndex = cell.acrossClueLetterIndex;
    // set stored values
    clue = adjustClue(clue, letterIndex);
  }

  // Test for down clue
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

function cleanCell(controller, cell) {
  assert(controller, '<controller> is null or undefined');
  assert(cell, '<cell> is null or undefined');
  // trace(`cleanCell:(${cell.x},${cell.y})`);

  const wrongLetter = !testCell(controller, cell);
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

export {
  anchorSegmentClues,
  cleanCell,
  cleanClue,
  hideElement,
  resetCell,
  resetClue,
  revealCell,
  revealClue,
  showElement,
  testCell,
  testClue,
};
