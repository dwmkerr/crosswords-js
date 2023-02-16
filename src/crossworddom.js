const CellMap = require('./cell-map');
const { removeClass, addClass } = require('./helpers');

//  Last element of an array.
function last(arr) {
  return arr.length === 0 ? arr[0] : arr[arr.length - 1];
}

//  Create a single global instance of a cell map.
const cellMap = new CellMap();

function CrosswordDOM(window, crossword, parentElement) {
  const { document } = window;
  this.crossword = crossword;
  this.parentElement = parentElement;

  //  Now build the DOM for the crossword.
  const container = document.createElement('div');
  container.className = 'crossword';

  //  Create each cell.
  for (let y = 0; y < crossword.height; y += 1) {
    const row = document.createElement('div');
    row.className = 'cwrow';
    container.appendChild(row);

    for (let x = 0; x < crossword.width; x += 1) {
      const cell = crossword.cells[x][y];

      //  Build the cell element and add it to the row.
      const cellElement = this._createCellDOM(document, cell);
      row.appendChild(cellElement);

      //  Update the map of cells
      cellMap.add(cell, cellElement);
    }
  }

  //  For a given crossword object, this function sets the appropriate font
  //  size based on the current crossword size.
  const updateCrosswordFontSize = (crosswordContainer) => {
    //  Get the width of a cell (first child of first row).
    const cellWidth = crosswordContainer.children[0].children[0].clientWidth;
    crosswordContainer.style.fontSize = `${cellWidth * 0.6}px`;
  };

  //  Update the fontsize when the window changes size, add the crossword, set
  //  the correct fontsize right away.
  window.addEventListener('resize', () => updateCrosswordFontSize(container));
  parentElement.appendChild(container);
  updateCrosswordFontSize(container);

  //  Add a helper function to allow the font to be resized programmatically,
  //  useful if something else changes the size of the crossword.
  this.updateFontSize = () => updateCrosswordFontSize(container);

  this.crosswordElement = container;
}

//  Selects a clue.
CrosswordDOM.prototype.selectClue = function selectClue(clue) {
  this.currentClue = clue;
  this._updateDOM();
  cellMap.getCellElement(clue.cells[0]).focus();
  this._stateChange('clueSelected');
};

//  Completely cleans up the crossword.
CrosswordDOM.prototype.destroy = function destroy() {
  //  TODO: we should also clean up the resize listener.
  //  Clear the map, DOM and state change handler.
  cellMap.removeCrosswordCells(this.crossword);
  this.parentElement.removeChild(this.crosswordElement);
  this.onStateChanged = null;
};

//  Sends a state change message.
CrosswordDOM.prototype._stateChange = function _stateChange(message, data) {
  //  TODO: we could probably inherit from EventEmitter as a more standard way
  //  to implement this functionality.
  const eventHandler = this.onStateChanged;
  if (!eventHandler) {
    return;
  }

  //  Send the message.
  eventHandler({
    message,
    data,
  });
};

//  Creates DOM for a cell.
CrosswordDOM.prototype._createCellDOM = function _createCellDOM(document, cell) {
  const self = this;
  const cellElement = document.createElement('div');
  cellElement.className = 'cwcell';
  cell.cellElement = cellElement;

  //  Add a class.
  cellElement.className += cell.light ? ' light' : ' dark';

  //  If the cell is dark, we are done.
  if (!cell.light) {
    return cellElement;
  }

  //  Light cells also need an input.
  const inputElement = document.createElement('input');
  inputElement.maxLength = 1;
  if (cell.answer) inputElement.value = cell.answer;
  cellElement.appendChild(inputElement);

  //  We may need to add a clue label.
  if (cell.clueLabel) {
    const clueLabel = document.createElement('div');
    clueLabel.className = 'cwcluelabel';
    clueLabel.innerHTML = cell.clueLabel;
    cellElement.appendChild(clueLabel);
  }

  //  Check to see whether we need to add an across clue answer segment terminator.
  if (cell.acrossTerminator === ',') {
    inputElement.className += ' cw-across-word-separator';
  } else if (cell.acrossTerminator === '-') {
    const acrossTerminator = document.createElement('div');
    acrossTerminator.className = 'cw-across-terminator';
    acrossTerminator.innerHTML = '|';
    cellElement.appendChild(acrossTerminator);
  } else if (cell.downTerminator === ',') {
    inputElement.className += ' cw-down-word-separator';
  } else if (cell.downTerminator === '-') {
    const acrossTerminator = document.createElement('div');
    acrossTerminator.className = 'cw-down-terminator';
    acrossTerminator.innerHTML = '|';
    cellElement.appendChild(acrossTerminator);
  }

  //  Listen for focus events.
  inputElement.addEventListener('focus', (event) => {
    //  Get the cell data.
    const eventCellElement = event.target.parentNode;
    const eventCell = cellMap.getCell(eventCellElement);
    const across = eventCell.acrossClue;
    const down = eventCell.downClue;

    //  If we have clicked somewhere which is part of the current clue, we
    //  will not need to change it (we won't toggle either).
    if (self.currentClue
      && (self.currentClue === across
        || self.currentClue === down)) {
      return;
    }

    //  If we have an across clue XOR a down clue, pick the one we have.
    if ((across && !down) || (!across && down)) {
      self.currentClue = across || down;
    } else if (across && self.currentClue
      && (across === self.currentClue.previousClueSegment || across === self.nextClueSegment)) {
      //  We've got across. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      self.currentClue = across;
    } else if (self.currentClue
      && (down === self.currentClue.previousClueSegment || down === self.nextClueSegment)) {
      //  We've got down. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      self.currentClue = down;
    } else {
      //  ...otherwise, Prefer across, unless we're on the first letter of a down clue only
      self.currentClue = (
        eventCell.downClueLetterIndex === 0 && eventCell.acrossClueLetterIndex !== 0
      ) ? down : across;
    }

    //  Update the DOM, inform of state change.
    self._updateDOM();
    self._stateChange('clueSelected');
  });

  //  Listen for keydown events.
  cellElement.addEventListener('keydown', (event) => {
    //  Get the cell element and cell data.
    const eventCellElement = event.target.parentNode;
    const eventCell = cellMap.getCell(eventCellElement);
    const { crossword } = eventCell;
    const clue = self.currentClue;

    if (event.keyCode === 8) { // backspace
      //  Blat the contents of the cell. No need to process the backspace.
      event.preventDefault();
      event.target.value = '';

      //  Try and move to the previous cell of the clue.
      const currentIndex = (eventCell.acrossClue === self.currentClue)
        ? eventCell.acrossClueLetterIndex : eventCell.downClueLetterIndex;
      const previousIndex = currentIndex - 1;
      if (previousIndex >= 0) {
        self.currentClue.cells[previousIndex].cellElement.querySelector('input').focus();
      }

      //  If the current index is zero, we might need to go to the previous clue
      //  segment (for a non-linear clue).
      if (currentIndex === 0 && self.currentClue.previousClueSegment) {
        last(self.currentClue.previousClueSegment.cells).cellElement.querySelector('input').focus();
      }
    } else if (event.keyCode === 9) { // tab
      //  We don't want default behaviour.
      event.preventDefault();

      //  Get the next clue.
      const searchClues = clue.across ? crossword.acrossClues : crossword.downClues;
      for (let i = 0; i < searchClues.length; i += 1) {
        if (clue === searchClues[i]) {
          let newClue = null;
          if (event.shiftKey) {
            if (i > 0) {
              newClue = searchClues[i - 1];
            } else {
              newClue = clue.across ? crossword.downClues[crossword.downClues.length - 1]
                : crossword.acrossClues[crossword.acrossClues.length - 1];
            }
          } else if (i < (searchClues.length - 1)) {
            newClue = searchClues[i + 1];
          } else {
            newClue = clue.across ? crossword.downClues[0] : crossword.acrossClues[0];
          }
          //  Select the new clue.
          self.currentClue = newClue;
          self._updateDOM();
          cellMap.getCellElement(newClue.cells[0]).querySelector('input').focus();
          break;
        }
      }
    } else if (event.keyCode === 13) { // enter
      //  We don't want default behaviour.
      event.preventDefault();

      //  If we are in a eventCell with an across clue AND down clue, swap the
      //  selected one.
      if (eventCell.acrossClue && eventCell.downClue) {
        self.currentClue = (eventCell.acrossClue === self.currentClue)
          ? eventCell.downClue : eventCell.acrossClue;
        self._updateDOM();
      }
    }
  });

  //  Listen for keypress events.
  cellElement.addEventListener('keypress', (event) => {
    //  We've just pressed a key that generates a char. In all
    //  cases, we're going to overwrite by blatting the current
    //  content. If the key is space, we suppress so we don't get
    //  a space, then we always move to the next cell in the clue.

    //  No spaces in empty cells.
    if (event.keyCode === 32) {
      event.preventDefault();
    }

    //  Blat current content.
    event.target.value = '';

    //  Get cell data.
    const eventCellElement = event.target.parentNode;
    const eventCell = cellMap.getCell(eventCellElement);
    const clue = self.currentClue;

    //  Sets the letter of a string.
    function setLetter(source, index, newLetter) {
      let sourceNormalised = source === null || source === undefined ? '' : source;
      let result = '';
      while (sourceNormalised.length <= index) sourceNormalised += ' ';
      const seek = Math.max(index, sourceNormalised.length);
      for (let i = 0; i < seek; i += 1) {
        result += (i === index) ? newLetter : sourceNormalised[i];
      }
      return result;
    }

    //  We need to update the answer.
    const key = String.fromCharCode(event.keyCode);
    if (eventCell.acrossClue) {
      eventCell.acrossClue.answer = setLetter(
        eventCell.acrossClue.answer,
        eventCell.acrossClueLetterIndex,
        key,
      );
    }
    if (eventCell.downClue) {
      eventCell.downClue.answer = setLetter(
        eventCell.downClue.answer,
        eventCell.downClueLetterIndex,
        key,
      );
    }

    //  Move to the next cell in the clue.
    const currentIndex = (eventCell.acrossClue === clue)
      ? eventCell.acrossClueLetterIndex : eventCell.downClueLetterIndex;
    const nextIndex = currentIndex + 1;
    if (nextIndex < clue.cells.length) {
      clue.cells[nextIndex].cellElement.querySelector('input').focus();
    }

    //  If we are at the end of the clue and we have a next segment, select it.
    if (nextIndex === clue.cells.length && clue.nextClueSegment) {
      clue.nextClueSegment.cells[0].cellElement.querySelector('input').focus();
    }
  });

  //  Listen for keyup events.
  cellElement.addEventListener('keyup', (event) => {
    const eventCellElement = event.target.parentNode;
    const eventCell = cellMap.getCell(eventCellElement);
    const { width, height } = eventCell.crossword;
    const { x, y } = eventCell;

    switch (event.keyCode) {
      case 37: // left
        //  If we can go left, go left.
        if (eventCell.x > 0 && eventCell.crossword.cells[x - 1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(eventCell.crossword.cells[x - 1][y]).querySelector('input').focus();
        }
        break;
      case 38: // up
        //  If we can go up, go up.
        if (eventCell.y > 0 && eventCell.crossword.cells[x][y - 1].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(eventCell.crossword.cells[x][y - 1]).querySelector('input').focus();
        }
        break;
      case 39: // right
        //  If we can go right, go right.
        if (eventCell.x + 1 < width && eventCell.crossword.cells[x + 1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(eventCell.crossword.cells[x + 1][y]).querySelector('input').focus();
        }
        break;
      case 40: // down
        //  If we can go down, go down.
        if (eventCell.y + 1 < height && eventCell.crossword.cells[x][y + 1].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(eventCell.crossword.cells[x][y + 1]).querySelector('input').focus();
        }
        break;
      case 9: // tab
        //  todo
        break;

      //  No action needed for any other keys.
      default:
        break;
    }
  });

  return cellElement;
};

//  Updates the DOM based on the model, ensuring that the CSS
//  is correct for the state (i.e. the selected clue).
CrosswordDOM.prototype._updateDOM = function _updateDOM() {
  //  TODO: pick a name - active, current or selected.
  const activeClue = this.currentClue;
  const { crossword } = this;

  //  Clear all clue cells.
  crossword.cells.forEach((row) => {
    row.forEach((cell) => {
      if (cell.light) removeClass(cellMap.getCellElement(cell).querySelector('input'), 'active');
    });
  });

  //  Highlight the clue cells. 'parentClue' is set if this is the later part of
  //  a non-linear clue.
  const clues = activeClue.parentClue
    ? [activeClue.parentClue].concat(activeClue.parentClue.connectedClues)
    : [activeClue];
  clues.forEach((clue) => {
    clue.cells.forEach((cell) => {
      addClass(cellMap.getCellElement(cell).querySelector('input'), 'active');
    });
  });
};

module.exports = CrosswordDOM;
