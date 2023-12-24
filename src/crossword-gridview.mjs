import {
  addClass,
  addClasses,
  assert,
  removeClass,
  setLetter,
  trace,
} from './helpers.mjs';

/**
 * Build a crossword grid DOM element
 * with separate blocks for across and down clues.
 * @param {*} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
 * @param {*} model the crossword model object
 * @returns the grid DOM element
 */

function newCrosswordGridView(document, model, cellMap) {
  trace('newCrosswordGridView');
  assert(
    document,
    'DOM root element [document] argument is null or undefined.',
  );
  assert(model, 'CrosswordModel [model] argument is null or undefined.');
  assert(
    cellMap,
    'CrosswordController [cellMap] argument is null or undefined.',
  );

  let gridView = document.createElement('div');
  addClasses(gridView, ['crosswords-js', 'crossword-grid']);

  // Set the grid size variables, refer to style/crosswords.less
  // This lets us adjust the CSS grid size to match 'model' dimensions.
  gridView.style.setProperty('--row-count', model.height);
  gridView.style.setProperty('--column-count', model.width);

  //  Create each cell.
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const modelCell = model.cells[x][y];

      //  Build the cell element.
      const cellElement = newCellElement(document, modelCell);
      //  Update the map of cells to enable element lookups
      cellMap.add(modelCell, cellElement);
      // Place cell in grid element
      gridView.appendChild(cellElement);
    }
  }

  return gridView;
}

/**
 * Build a crossword grid _cell_ DOM element with child elements.
 * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
 * @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
 * @returns {HTMLDivElement} the DOM element for the _cell_
 */
function newCellElement(document, modelCell) {
  let cellElement = document.createElement('div');
  // Identify cellElement with id of associated modelCell.
  // This simplifies implementation of CellMap
  cellElement.dataset.xy = modelCell;
  addClass(cellElement, 'cwcell');
  //  eslint-disable-next-line no-param-reassign
  modelCell.cellElement = cellElement;
  //  Add a class.
  addClass(cellElement, modelCell.light ? 'light' : 'dark');

  //  If the cell is dark, we are done.
  if (!modelCell.light) {
    return cellElement;
  }

  // light cellElement needs to be tabbable - divs are tabbable in HTML5
  // Settgin the index to 0 will not interrupt the tab order of the rest
  // of the elements in the DOM.
  cellElement.tabIndex = 0;
  //  Make the cell text content unselectable
  addClass(cellElement, 'noselect');
  // Setting .innerHTML, .textContent or .innerText               on a div element will
  // remove all the child elements created below. We can safely change
  // only the text content of the div by explicitly creating a Text node,
  // as the first child node of the cellElement div.
  // The initial content is set to modelCell.answer or the default of the
  // space character.
  cellElement.appendChild(new Text(modelCell.answer ?? ' '));

  //  We may need to add a clue label.
  if (modelCell.labelText) {
    const labelText = document.createElement('div');
    addClass(labelText, 'cwclue-label');
    labelText.innerHTML = modelCell.labelText;
    cellElement.appendChild(labelText);
  }

  const revealedIndicator = document.createElement('div');
  // Remove 'hidden' div class to reveal
  addClasses(revealedIndicator, ['cwcell-revealed', 'hidden']);
  cellElement.appendChild(revealedIndicator);

  const incorrectIndicator = document.createElement('div');
  // Toggle 'hidden' div class to reveal/hide
  addClasses(incorrectIndicator, ['cwcell-incorrect', 'hidden']);
  cellElement.appendChild(incorrectIndicator);

  //  Check for clue answer segment terminators (across and/or down)
  if (modelCell.acrossTerminator) {
    addClass(cellElement, 'cw-across-word-separator');
  }
  if (modelCell.downTerminator) {
    addClass(cellElement, 'cw-down-word-separator');
  }

  return cellElement;
}

function toggleClueDirection(crosswordController, eventCell) {
  //  If we are in a eventCell with an across clue AND down clue, swap the
  //  current clue.
  const [ec, cc, swappable] = [
    eventCell,
    crosswordController,
    eventCell.acrossClue && eventCell.downClue,
  ];

  if (swappable) {
    // swap clue direction
    trace('toggleClueDirection');
    // eslint-disable-next-line no-param-reassign
    cc.currentClue =
      ec.acrossClue === cc.currentClue ? ec.downClue : ec.acrossClue;
  }

  return swappable;
}

function moveToSegmentAhead(crosswordController, eventCell) {
  const [ec, , clue] = [
    eventCell,
    crosswordController,
    crosswordController.currentClue,
  ];
  const currentIndex =
    ec.acrossClue === clue ? ec.acrossClueLetterIndex : ec.downClueLetterIndex;
  const nextIndex = currentIndex + 1;
  //  If we are at the end of the clue and we have a next segment, select it.
  const jumpable = nextIndex === clue.cells.length && clue.nextClueSegment;

  if (jumpable) {
    // eslint-disable-next-line no-param-reassign
    cc.currentClue = clue.nextClueSegment;
  }

  return jumpable;
}

function moveToSegmentBehind(crosswordController, eventCell) {
  const [ec, cc] = [eventCell, crosswordController];
  const clue = cc.currentClue;
  const currentIndex =
    ec.acrossClue === clue ? ec.acrossClueLetterIndex : ec.downClueLetterIndex;
  const previousIndex = currentIndex - 1;
  //  If we are at the start of the clue and we have a previous segment, select it.
  const jumpable = previousIndex === -1 && clue.previousClueSegment;

  if (jumpable) {
    // eslint-disable-next-line no-param-reassign
    cc.currentCell = clue.previousClueSegment.cells.slice(-1)[0];
    // eslint-disable-next-line no-param-reassign
    cc.currentClue = clue.previousClueSegment;
  }

  return jumpable;
}

function moveToCellDown(crosswordController, eventCell) {
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
    moved = moveToSegmentAhead(crosswordController, eventCell);
  }

  return moved;
}

function moveToCellRight(crosswordController, eventCell) {
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
    moved = moveToSegmentAhead(crosswordController, eventCell);
  }

  return moved;
}

function moveToCellUp(crosswordController, eventCell) {
  const { x, y } = eventCell;
  let moved = false;

  if (eventCell.y > 0 && eventCell.model.cells[x][y - 1].light === true) {
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = eventCell.model.cells[x][y - 1];
    moved = true;
  } else {
    // Can we go to previous segment in clue?
    moved = moveToSegmentBehind(crosswordController, eventCell);
  }

  return moved;
}

function moveToCellLeft(crosswordController, eventCell) {
  const { x, y } = eventCell;
  let moved = false;

  if (eventCell.x > 0 && eventCell.model.cells[x - 1][y].light === true) {
    // eslint-disable-next-line no-param-reassign
    crosswordController.currentCell = eventCell.model.cells[x - 1][y];
    moved = true;
  } else {
    // Can we go to previous segment in clue?
    moved = moveToSegmentBehind(crosswordController, eventCell);
  }

  return moved;
}

function moveToCellAhead(crosswordController, eventCell) {
  // move to previous cell in current clue
  if (crosswordController.currentClue === eventCell.acrossClue) {
    return moveToCellRight(crosswordController, eventCell);
  } else if (crosswordController.currentClue === eventCell.downClue) {
    return moveToCellDown(crosswordController, eventCell);
  }
}

function moveToCellBehind(crosswordController, eventCell) {
  // move to previous cell in current clue
  if (crosswordController.currentClue === eventCell.acrossClue) {
    return moveToCellLeft(crosswordController, eventCell);
  } else if (crosswordController.currentClue === eventCell.downClue) {
    return moveToCellUp(crosswordController, eventCell);
  }
}

const getHeadClues = (crosswordModel, clue) => {
  return clue.isAcross
    ? [
        crosswordModel.acrossClues.headSegments,
        crosswordModel.downClues.headSegments,
      ]
    : [
        crosswordModel.downClues.headSegments,
        crosswordModel.acrossClues.headSegments,
      ];
};

function moveToClueAhead(controller, eventCell) {
  const clue = controller.currentClue.headSegment;
  const [headClues, orthogonalHeadClues] = getHeadClues(eventCell.model, clue);
  const hci = headClues.indexOf(clue);
  assert(hci !== -1, `clue '${clue.clueId}' not found in headClues`);

  // eslint-disable-next-line no-param-reassign
  controller.currentClue =
    hci === headClues.length - 1
      ? // current head is last - flip direction, get first head clue
        orthogonalHeadClues[0]
      : // get next head
        headClues[hci + 1];
}

function moveToClueBehind(controller, eventCell) {
  const clue = controller.currentClue.headSegment;
  const [headClues, orthogonalHeadClues] = getHeadClues(eventCell.model, clue);
  const hci = headClues.indexOf(clue);
  assert(hci !== -1, `clue '${clue.clueId}' not found in headClues`);

  // eslint-disable-next-line no-param-reassign
  controller.currentClue =
    hci === 0
      ? // current head is first - flip direction, get last head clue
        orthogonalHeadClues.slice(-1)[0]
      : // get previous head
        headClues[hci - 1];
}

function deleteCellContent(crosswordController, event, eventCell) {
  // Fill cell with SPACE
  setCellContent(crosswordController, event, ' ');
  // remove any visual flag in cell that letter is incorrect
  hideElement(crosswordController.incorrectElement(eventCell));
}

function setCellContent(crosswordController, event, character) {
  const ec = crosswordController.cell(event.target);

  //  eslint-disable-next-line no-param-reassign
  event.target.firstChild.nodeValue = character;

  //  We need to update the answers
  if (ec.acrossClue) {
    ec.acrossClue.answer = setLetter(
      ec.acrossClue.answer,
      ec.acrossClueLetterIndex,
      character,
    );
  }
  // across and/or down are possible
  if (ec.downClue) {
    ec.downClue.answer = setLetter(
      ec.downClue.answer,
      ec.downClueLetterIndex,
      character,
    );
  }
}

const hideElement = (element) => {
  element?.classList.add('hidden');
};

const showElement = (element) => {
  element?.classList.remove('hidden');
};

//  Style the currentClue.
function styleCurrentClue(controller, newClue, oldClue) {
  assert(newClue, 'newClue is undefined');
  // Remove styles from the oldClue
  oldClue?.headSegment.flatCells.forEach((cell) => {
    removeClass(controller.cellElement(cell), 'active');
  });
  newClue.headSegment.flatCells.forEach((cell) => {
    addClass(controller.cellElement(cell), 'active');
  });
}

//  Style the currentCell.
function styleCurrentCell(controller, newCell, oldCell) {
  assert(newCell, 'newCell is undefined');
  // Remove styles from the oldCell
  if (oldCell) {
    removeClass(controller.cellElement(oldCell), 'highlighted');
  }
  addClass(controller.cellElement(newCell), 'highlighted');
}

const EventKey = Object.freeze({
  backspace: 'Backspace',
  delete: 'Delete',
  down: 'ArrowDown',
  enter: 'Enter',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  space: ' ',
  tab: 'Tab',
  up: 'ArrowUp',
  shift: 'Shift',
  alt: 'Alt',
  ctrl: 'Control',
  name: (eventKey) => {
    // entry is an array [key, value]
    const entry = Object.entries(EventKey).find(
      (entry) => entry[1] === eventKey,
    );
    return entry ? entry[0] : null;
  },
});

export {
  deleteCellContent,
  EventKey,
  hideElement,
  moveToCellAhead,
  moveToCellBehind,
  moveToCellDown,
  moveToCellLeft,
  moveToCellRight,
  moveToCellUp,
  moveToClueAhead,
  moveToClueBehind,
  newCrosswordGridView,
  setCellContent,
  showElement,
  styleCurrentCell,
  styleCurrentClue,
  toggleClueDirection,
};
