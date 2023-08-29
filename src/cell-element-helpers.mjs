import { setLetter, trace } from './helpers.mjs';

/**
 * **toggleClueDirection** - toggle  the _clue_ direction (across/down).
 * @param {*} crosswordController the DOM associated with thw
 * @param {*} eventCell
 * @returns
 */
function toggleClueDirection(crosswordController, eventCell) {
  //  If we are in a eventCell with an across clue AND down clue, swap the
  //  current clue.
  const swappable = eventCell.acrossClue && eventCell.downClue;
  if (swappable) {
    // swap clue direction
    trace('toggleClueDirection');
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentClue =
      eventCell.acrossClue === crosswordController.currentClue
        ? eventCell.downClue
        : eventCell.acrossClue;
  }
  return swappable;
}

function jumpToNextSegment(crosswordController, eventCell) {
  const clue = crosswordController.currentClue;
  const currentIndex =
    eventCell.acrossClue === clue
      ? eventCell.acrossClueLetterIndex
      : eventCell.downClueLetterIndex;
  trace(`jumpToNextSegment: current cell index: ${currentIndex}`);
  const nextIndex = currentIndex + 1;
  //  If we are at the end of the clue and we have a next segment, select it.
  const jumpable = nextIndex === clue.cells.length && clue.nextClueSegment;
  if (jumpable) {
    trace('Focussing next answer segment cell index 0');
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentClue = clue.nextClueSegment;
  }
  return jumpable;
}

function jumpToPreviousSegment(crosswordController, eventCell) {
  const clue = crosswordController.currentClue;
  const currentIndex =
    eventCell.acrossClue === clue
      ? eventCell.acrossClueLetterIndex
      : eventCell.downClueLetterIndex;
  trace(`moveUp: current cell index: ${currentIndex}`);
  const previousIndex = currentIndex - 1;
  //  If we are at the start of the clue and we have a previous segment, select it.
  const jumpable = previousIndex === -1 && clue.previousClueSegment;
  if (jumpable) {
    trace('moveUp: Focussing prev answer segment last cell');
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = last(clue.previousClueSegment.cells);
  }
  return jumpable;
}

function moveDown(crosswordController, eventCell) {
  const { x, y } = eventCell;
  const { height } = eventCell.model;

  let moved = false;

  if (
    eventCell.y + 1 < height &&
    eventCell.model.cells[x][y + 1].light === true
  ) {
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = eventCell.model.cells[x][y + 1];
    moved = true;
  } else {
    // Can we go to next segment in clue?
    moved = jumpToNextSegment(crosswordController, eventCell);
  }

  return moved;
}

function moveRight(crosswordController, eventCell) {
  const { x, y } = eventCell;
  const { width } = eventCell.model;

  let moved = false;

  if (
    eventCell.x + 1 < width &&
    eventCell.model.cells[x + 1][y].light === true
  ) {
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = eventCell.model.cells[x + 1][y];
    moved = true;
  } else {
    // Can we go to next segment in clue?
    moved = jumpToNextSegment(crosswordController, eventCell);
  }

  return moved;
}

function moveUp(crosswordController, eventCell) {
  const { x, y } = eventCell;

  let moved = false;

  if (eventCell.y > 0 && eventCell.model.cells[x][y - 1].light === true) {
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = eventCell.model.cells[x][y - 1];
    moved = true;
  } else {
    // Can we go to previous segment in clue?
    moved = jumpToPreviousSegment(crosswordController, eventCell);
  }

  return moved;
}

function moveLeft(crosswordController, eventCell) {
  const { x, y } = eventCell;
  let moved = false;

  if (eventCell.x > 0 && eventCell.model.cells[x - 1][y].light === true) {
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = eventCell.model.cells[x - 1][y];
    moved = true;
  } else {
    // Can we go to previous segment in clue?
    moved = jumpToPreviousSegment(crosswordController, eventCell);
  }

  return moved;
}

function setCellContent(crosswordController, event, character) {
  const eventCell = crosswordController.cell(event.target.parentNode);
  //  eslint-disable-next-line no-param-reassign
  event.target.value = character;

  //  We need to update the answers
  if (eventCell.acrossClue) {
    eventCell.acrossClue.answer = setLetter(
      eventCell.acrossClue.answer,
      eventCell.acrossClueLetterIndex,
      character,
    );
  }
  // across and/or down are possible
  if (eventCell.downClue) {
    eventCell.downClue.answer = setLetter(
      eventCell.downClue.answer,
      eventCell.downClueLetterIndex,
      character,
    );
  }
}

export {
  toggleClueDirection,
  moveDown,
  moveRight,
  moveUp,
  moveLeft,
  setCellContent,
};
