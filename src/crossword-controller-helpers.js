const { assert, memoize, setLetter, trace } = require("./helpers");

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

  // get index of cell-letter in clue
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;

  // get solution letter
  const solutionLetter = clue.solution[letterIndex];
  //  update the revealed letters of the clue.
  clue.revealed = setLetter(clue.revealed, letterIndex, solutionLetter);
  // reveal letter in grid
  //  eslint-disable-next-line no-param-reassign
  controller.inputElement(cell).value = solutionLetter;
  // set visual flag in cell that letter has been revealed
  showElement(controller.revealedElement(cell));
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
  if (answerLetter !== solutionLetter) {
    // set visual flag in cell that answer letter is incorrect
    showElement(controller.incorrectElement(cell));
  }
}

function testClue(controller, clue) {
  assert(controller, "<controller> is null or undefined");
  assert(clue, "<clue> is null or undefined");
  trace(`testClue: '${clue.code}'`);
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      testCell(controller, cell);
    });
  });
}

function resetCell(controller, cell) {
  assert(controller, "<controller> is null or undefined");
  assert(cell, "<cell> is null or undefined");

  // get index of cell-letter in clue
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;

  // clear stored value
  clue.answer[letterIndex] = "";
  // clear grid cell
  // eslint-disable-next-line no-param-reassign
  controller.inputElement(cell).value = "";
  // remove visual flags in cell
  controller.incorrectElement(cell).classList.add("hidden");
  controller.revealedElement(cell).classList.add("hidden");
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

module.exports = {
  anchorSegmentClues,
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
