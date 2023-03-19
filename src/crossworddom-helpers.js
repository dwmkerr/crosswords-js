const { memoize, setLetter, trace } = require("./helpers");

//  For a given crossword object, this function sets the appropriate font
//  size based on the current crossword size.
const updateCrosswordFontSize = (crosswordGridElement) => {
  trace("updateCrosswordFontSize");
  //  Get the width of a cell (first child of first row).
  const cellWidth = crosswordGridElement.children[0].children[0].clientWidth;
  //  eslint-disable-next-line no-param-reassign
  crosswordGridElement.style.fontSize = `${cellWidth * 0.6}px`;
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

function revealCell(crosswordDom, cell) {
  assert(crosswordDom, "revealLetter: <crosswordDom> is null or undefined");
  assert(cell, "revealLetter: <cell> is null or undefined");

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
  crosswordDom.inputElement(cell).value = solutionLetter;
  // set visual flag in cell that letter has been revealed
  showElement(crosswordDom.revealedElement(cell));
}

function revealClue(crosswordDom, clue) {
  assert(crosswordDom, "revealClue: <crosswordDom> is null or undefined");
  assert(clue, "revealClue: <clue> is null or undefined");
  trace(`revealClue: '${clue.code}'`);
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      revealCell(crosswordDom, cell);
    });
  });
}

function testCell(crosswordDom, cell) {
  assert(crosswordDom, "testCell: <crosswordDom> is null or undefined");
  assert(cell, "testCell: <cell> is null or undefined");

  // get index of cell-letter in clue
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;

  const answerLetter = clue.answer[letterIndex];
  const solutionLetter = clue.solution[letterIndex];
  if (answerLetter !== solutionLetter) {
    // set visual flag in cell that answer letter is incorrect
    showElement(crosswordDom.incorrectElement(cell));
  }
}

function testClue(crosswordDom, clue) {
  assert(crosswordDom, "testClue: <crosswordDom> is null or undefined");
  assert(clue, "testClue: <clue> is null or undefined");
  trace(`testClue: '${clue.code}'`);
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      testCell(crosswordDom, cell);
    });
  });
}

function resetCell(crosswordDom, cell) {
  assert(crosswordDom, "resetCell: <crosswordDom> is null or undefined");
  assert(cell, "resetCell: <cell> is null or undefined");

  // get index of cell-letter in clue
  const clue = cell.acrossClue ? cell.acrossClue : cell.downClue;
  const letterIndex = cell.acrossClue
    ? cell.acrossClueLetterIndex
    : cell.downClueLetterIndex;

  // clear stored value
  clue.answer[letterIndex] = "";
  // clear grid cell
  // eslint-disable-next-line no-param-reassign
  crosswordDom.inputElement(cell).value = "";
  // remove visual flags in cell
  crosswordDom.incorrectElement(cell).classList.add("hidden");
  crosswordDom.revealedElement(cell).classList.add("hidden");
}

function resetClue(crosswordDom, clue) {
  assert(crosswordDom, "resetClue: <crosswordDom> is null or undefined");
  assert(clue, "resetClue: <clue> is null or undefined");
  trace(`resetClue: '${clue.code}'`);
  const clues = clue.parentClue
    ? [clue.parentClue].concat(clue.parentClue.connectedClues)
    : [clue];
  clues.forEach((c) => {
    c.cells.forEach((cell) => {
      resetCell(crosswordDom, cell);
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
