const { assert, memoize, trace, replaceStrAt } = require("./helpers");

//  For a given crossword object, this function sets the appropriate font
//  size based on the current crossword size.
const updateCrosswordFontSize = (crosswordView) => {
  trace("updateCrosswordFontSize");
  assert(crosswordView, "crosswordView is null or undefined");
  assert(crosswordView.children[0], "crossword row[0] is null or undefined");
  assert(
    crosswordView.children[0].children[0],
    "crossword cell[0,0] is null or undefined",
  );
  //  Get the width of a cell (first child of first row).
  const cellWidth = crosswordView.children[0].children[0].clientWidth;
  //  eslint-disable-next-line no-param-reassign
  crosswordView.style.fontSize = `${cellWidth * 0.6}px`;
};

const hideElement = (element) => {
  element && element.classList.add("hidden");
};
const showElement = (element) => {
  element && element.classList.remove("hidden");
};

// Helper function to filter single-segment and anchor-segment clues
// from clue array
const anchorSegmentClues = memoize((clues) => {
  return clues.filter((x) => !x.previousClueSegment);
});

function revealCell(controller, cell) {
  assert(controller, "<controller> is null or undefined");
  assert(cell, "<cell> is null or undefined");

  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;
  const solutionLetter = clue.solution[letterIndex];
  const clearRevealed = false;
  setCellText(controller, cell, solutionLetter, clearRevealed);
  // set visual flag in cell that letter has been revealed
  showElement(controller.revealedElement(cell));
  // clear visual flag in cell if letter was incorrect
  hideElement(controller.incorrectElement(cell));
}

function revealClue(controller, clue) {
  assert(controller, "<controller> is null or undefined");
  assert(clue, "<clue> is null or undefined");
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

function testCell(controller, cell) {
  assert(controller, "<controller> is null or undefined");
  assert(cell, "<cell> is null or undefined");

  // get index of cell-letter in clue
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;

  const answerLetter = clue.answer[letterIndex];
  const solutionLetter = clue.solution[letterIndex];
  const success = answerLetter === solutionLetter;
  if (!success) {
    // set visual flag in cell that answer letter is incorrect
    showElement(controller.incorrectElement(cell));
  }
  return success;
}

function testClue(controller, clue) {
  assert(controller, "<controller> is null or undefined");
  assert(clue, "<clue> is null or undefined");
  trace(`testClue: '${clue.code}'`);
  let result = true;
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      result &&= testCell(controller, cell);
    });
  });
  return result;
}

function setCellText(controller, cell, newText, clearRevealed) {
  // Cell can be part of both across and down clues
  if (cell.acrossClue) {
    const clue = cell.acrossClue;
    // get index of cell-letter in clue
    const letterIndex = cell.acrossClueLetterIndex;
    // set stored values
    clue.answer = replaceStrAt(clue.answer, letterIndex, newText);
    if (clearRevealed) {
      clue.revealed = replaceStrAt(clue.revealed, letterIndex, newText);
    }
  }
  if (cell.downClue) {
    const clue = cell.downClueClue;
    // get index of cell-letter in clue
    const letterIndex = cell.downClueLetterIndex;
    // clear stored values
    clue.answer = replaceStrAt(clue.answer, letterIndex, newText);
    if (clearRevealed) {
      clue.revealed = replaceStrAt(clue.revealed, letterIndex, newText);
      hideElement(controller.revealedElement(cell));
    }
  }
  // eslint-disable-next-line no-param-reassign
  controller.inputElement(cell).value = newText;
}

function resetCell(controller, cell) {
  assert(controller, "<controller> is null or undefined");
  assert(cell, "<cell> is null or undefined");

  const clearRevealed = true;
  // put a space in the cell
  setCellText(controller, cell, " ", clearRevealed);
  // remove visual flags in cell
  hideElement(controller.incorrectElement(cell));
}

function resetClue(controller, clue) {
  assert(controller, "<controller> is null or undefined");
  assert(clue, "<clue> is null or undefined");
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
  assert(controller, "<controller> is null or undefined");
  assert(cell, "<cell> is null or undefined");

  const wrongLetter = !testCell(controller, cell);
  const clearRevealed = wrongLetter;
  // is the current cell letter incorrect?
  if (wrongLetter) {
    setCellText(controller, cell, " ", clearRevealed);
    // remove visual flags in cell
    hideElement(controller.incorrectElement(cell));
  }
}

function cleanClue(controller, clue) {
  assert(controller, "<controller> is null or undefined");
  assert(clue, "<clue> is null or undefined");
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

module.exports = {
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
  updateCrosswordFontSize,
};
