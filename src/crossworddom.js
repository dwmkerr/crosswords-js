//  Lightweight helper functions.
function removeClass(element, className) {
  var expression = new RegExp("(?:^|\\s)" + className + "(?!\\S)", "g");
  element.className = element.className.replace(expression, '');
}
function addClass(element, className) {
  element.className += " " + className;
}

//  Internally used map of Crossword model data to DOM elements.
function CellMap() {
  this.map = [];
}

//  Adds a Cell <-> Cell Element mapping.
CellMap.prototype.add = function(cell, cellElement) {
  this.map.push({
    cell: cell,
    cellElement: cellElement
  });
};

//  Gets the DOM element for a cell.
CellMap.prototype.getCellElement = function(cell) {
  for(var i=0; i<this.map.length; i++) {
    if(this.map[i].cell === cell) { 
      return this.map[i].cellElement;
    }
  }
  return null;
};

//  Gets the cell for a DOM element.
CellMap.prototype.getCell = function(cellElement) {
  for(var i=0; i<this.map.length; i++) {
    if(this.map[i].cellElement === cellElement) { 
      return this.map[i].cell;
    }
  }
  return null;
};


//  Removes entries for a crossword.
CellMap.prototype.removeCrosswordCells = function removeCrosswordCells(crossword) {
  for(var i=0; i<this.map.length; i++) {
    if(this.map[i].cell.crossword === crossword) { 
      this.map.splice(i, 1);
    }
  }
};

var getCellElementData = function getCellElementData(cellElement) {
  for(var i = 0; i < cellMap.length; i++) {
    if(cellMap[i].cellElement === cellElement) {
      return cellMap[i];
    }
  }
  return null;
};

//  Creates the DOM representation of a Crossword.
function CrosswordDOM(crossword, parentElement) {

  this.crossword = crossword;
  this.parentElement = parentElement;

  //  Now build the DOM for the crossword.
  var container = document.createElement('div');
  container.className = "crossword";

  //  Create each cell.
  for(var y = 0; y < crossword.height; y++) {

    var row = document.createElement('div');
    row.className = "cwrow";
    container.appendChild(row);

    for(var x = 0; x < crossword.width; x++) {

      var cell = crossword.cells[x][y];

      //  Build the cell element and add it to the row.
      var cellElement = this._createCellDOM(cell);
      row.appendChild(cellElement);

      //  Update the map of cells
      cellMap.add(cell, cellElement);

    }

  }

  parentElement.appendChild(container);
  this.crosswordElement = container;
}

//  Selects a clue.
CrosswordDOM.prototype.selectClue = function selectClue(clue) {
  this.currentClue = clue;
  this._updateDOM();
  cellMap.getCellElement(clue.cells[0]).focus();
  this._stateChange("clueSelected");
};

//  Completely cleans up the crossword.
CrosswordDOM.prototype.destroy = function destroy() {

  //  Clear the map, DOM and state change handler.
  cellMap.removeCrosswordCells(this.crossword);
  this.parentElement.removeChild(this.crosswordElement);
  this.onStateChanged = null;

};

//  Sends a state change message.
CrosswordDOM.prototype._stateChange = function _stateChange(message, data) {

  var eventHandler = this.onStateChanged;
  if(!eventHandler) {
    return;
  }

  //  Send the message.
  eventHandler({
    message: message,
    data: data
  });

};

//  Creates DOM for a cell.
CrosswordDOM.prototype._createCellDOM = function _createCellDOM(cell) {

  var self = this;
  var cellElement = document.createElement('div');
  cellElement.className = "cwcell";
  cell.cellElement = cellElement;

  //  Add a class.
  cellElement.className += cell.light ? " light" : " dark";

  //  If the cell is dark, we are done.
  if(!cell.light) {
    return cellElement;
  }

  //  Light cells also need an input.
  var inputElement = document.createElement('input');
  inputElement.maxLength = 1;
  if(cell.answer) inputElement.value = cell.answer;
  cellElement.appendChild(inputElement);

  //  We may need to add a clue label.
  if(cell.clueLabel) {
    var clueLabel = document.createElement('div');
    clueLabel.className = "cwcluelabel";
    clueLabel.innerHTML = cell.clueLabel;
    cellElement.appendChild(clueLabel);
  }

  //  Listen for focus events.
  inputElement.addEventListener("focus", function(event) {

    //  Get the cell data.
    var cellElement = event.target.parentNode;
    var cell = cellMap.getCell(cellElement);
    var crossword = cell.crossword;
    var across = cell.acrossClue;
    var down = cell.downClue;

    //  If we have clicked somewhere which is part of the current clue, we
    //  will not need to change it (we won't toggle either).
    if(self.currentClue && 
      (self.currentClue === across ||
        self.currentClue === down)) {
      return;
    }

    //  If we have an across clue XOR a down clue, pick the one we have.
    if( (across && !down) || (!across && down) ) {
      self.currentClue = across || down;
    } else {
      //  We've got across AND down. Prefer across, unless we've on the 
      //  first letter of a down clue only
      self.currentClue = cell.downClueLetterIndex === 0 && cell.acrossClueLetterIndex !== 0 ? down : across;     
    }

    //  Update the DOM, inform of state change.
    self._updateDOM();
    self._stateChange("clueSelected");

  });

  //  Listen for keydown events.
  cellElement.addEventListener("keydown", function(event) {

    if(event.keyCode === 8) { // backspace

      //  Blat the contents of the cell. No need to process the backspace.
      event.preventDefault();
      event.target.value = "";

      //  Try and move to the previous cell of the clue.
      var cellElement = event.target.parentNode;
      var cell = cellMap.getCell(cellElement);
      var currentIndex = cell.acrossClue === self.currentClue ? cell.acrossClueLetterIndex : cell.downClueLetterIndex;
      var previousIndex = currentIndex - 1;
      if(previousIndex >= 0) {
        self.currentClue.cells[previousIndex].cellElement.querySelector('input').focus();
      }

    } else if(event.keyCode === 9) { // tab

      //  We don't want default behaviour.
      event.preventDefault();

      //  Get the cell element and cell data.
      var cellElement = event.target.parentNode;
      var cell = cellMap.getCell(cellElement);
      var crossword = cell.crossword;
      var clue = self.currentClue;

      //  Get the next clue.
      var searchClues = clue.across ? crossword.acrossClues : crossword.downClues;
      for(var i=0; i<searchClues.length; i++) {
        if(clue === searchClues[i]) {
          var newClue = null;
          if(event.shiftKey) {
            if(i > 0) {
              newClue = searchClues[i-1];
            } else {
              newClue = clue.across ? crossword.downClues[crossword.downClues.length-1] : crossword.acrossClues[crossword.acrossClues.length-1];
            }
          } else {
            if(i < (searchClues.length - 1)) {
              newClue = searchClues[i+1];
            } else {
              newClue = clue.across ? crossword.downClues[0] : crossword.acrossClues[0];
            }
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

      //  Get the cell element and cell data.
      var cellElement = event.target.parentNode;
      var cell = cellMap.getCell(cellElement);
      var crossword = cell.crossword;

      //  If we are in a cell with an across clue AND down clue, swap the
      //  selected one.
      if(cell.acrossClue && cell.downClue) {
        self.currentClue = cell.acrossClue === self.currentClue ? cell.downClue : cell.acrossClue;
        self._updateDOM();
      }

    }

  });

  //  Listen for keypress events.
  cellElement.addEventListener("keypress", function(event) {

    //  We've just pressed a key that generates a char. In all
    //  cases, we're going to overwrite by blatting the current 
    //  content. If the key is space, we suppress so we don't get
    //  a space, then we always move to the next cell in the clue.

    //  No spaces in empty cells.
    if(event.keyCode === 32) {
      event.preventDefault();
    }

    //  Blat current content.
    event.target.value = "";

    //  Get cell data.
    var cellElement = event.target.parentNode;
    var cell = cellMap.getCell(cellElement);
    var crossword = cell.crossword;
    var clue = self.currentClue;

    //  Sets the letter of a string.
    function setLetter(source, index, newLetter) {
      var sourceNormalised = source === null || source === undefined ? "" : source;
      var result = "";
      while(sourceNormalised.length <= index) sourceNormalised = sourceNormalised + " ";
      var seek = Math.max(index, sourceNormalised.length);
      for(var i=0;i<seek;i++) {
        result += i == index ? newLetter : sourceNormalised[i];
      }
      return result;
    }

    //  We need to update the answer.
    var key = String.fromCharCode(event.keyCode);
    if(cell.acrossClue) cell.acrossClue.answer = setLetter(cell.acrossClue.answer, cell.acrossClueLetterIndex, key);
    if(cell.downClue) cell.downClue.answer = setLetter(cell.downClue.answer, cell.downClueLetterIndex, key);

    //  Move to the next cell in the clue.
    var currentIndex = cell.acrossClue === clue ? cell.acrossClueLetterIndex : cell.downClueLetterIndex;
    var nextIndex = currentIndex + 1;
    if(nextIndex < clue.cells.length) {
      clue.cells[nextIndex].cellElement.querySelector('input').focus();
    }

  });

  //  Listen for keyup events.
  cellElement.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
      case 37: // left

        var cellElement = event.target.parentNode;
        var cell = cellMap.getCell(cellElement);
        var x = cell.x, y = cell.y;

        //  If we can go left, go left.
        if(cell.x > 0 && cell.crossword.cells[x-1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(cell.crossword.cells[x-1][y]).querySelector('input').focus();
        }
        break;
      case 38: // up
        var cellElement = event.target.parentNode;
        var cell = cellMap.getCell(cellElement);
        var x = cell.x, y = cell.y;

        //  If we can go up, go up.
        if(cell.y > 0 && cell.crossword.cells[x][y-1].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(cell.crossword.cells[x][y-1]).querySelector('input').focus();
        }
        break;
      case 39: // right
        var cellElement = event.target.parentNode;
        var cell = cellMap.getCell(cellElement);
        var width = cell.crossword.width;
        var x = cell.x, y = cell.y;

        //  If we can go right, go right.
        if(cell.x + 1 < width && cell.crossword.cells[x+1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(cell.crossword.cells[x+1][y]).querySelector('input').focus();
        }
        break;
      case 40: // down
        var cellElement = event.target.parentNode;
        var cell = cellMap.getCell(cellElement);
        var height = cell.crossword.height;
        var x = cell.x, y = cell.y;

        //  If we can go down, go down.
        if(cell.y + 1 < height && cell.crossword.cells[x][y+1].light === true) {
          //  TODO: optimise with children[0]?
          cellMap.getCellElement(cell.crossword.cells[x][y+1]).querySelector('input').focus();
        }
        break;
      case 9: // tab
        //  todo
        break;

      default: // anything else...
        //  todo
        break;
    }
  });

  return cellElement;
};

//  Updates the DOM based on the model, ensuring that the CSS
//  is correct for the state (i.e. the selected clue).
CrosswordDOM.prototype._updateDOM = function _updateDOM() {

  //  TODO: pick a name - active, current or selected.
  var activeClue = this.currentClue;
  var crossword = this.crossword;

  //  Deactivate all cells, except those which match the clue.
  for(var x = 0; x < crossword.cells.length; x++) {
    for(var y = 0; y < crossword.cells[x].length; y++) {
      var cell = crossword.cells[x][y];
      if(cell.light === true) { 
        if((cell.acrossClue === activeClue) || (cell.downClue === activeClue)) {
          addClass(cellMap.getCellElement(cell).querySelector('input'), "active");
        } else {
          removeClass(cellMap.getCellElement(cell).querySelector('input'), "active");
        }
      }
    }
  }
};

//  Create a single global instance of a cell map.
var cellMap = new CellMap();

module.exports = CrosswordDOM;
