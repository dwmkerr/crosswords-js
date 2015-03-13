var CrosswordsJS = (function(CrosswordsJS, window, document) {

  'use strict';

  function buildCellArray2D(crossword) {
    var x = crossword.width;
    var y = crossword.height;
    var array = new Array(x);
    for(var i=0; i<y; i++) {
      array[i] = new Array(y);
      for(var j=0; j<y; j++) {
        array[i][j] = {
          crossword: crossword,
          x: i,
          y: j
        };
      }
    }
    return array;
  }

  //  The crossword class. When a crossword is built from a definition
  //  and options, this is the object which is returned.
  function Crossword(crosswordDefinition) {

    if(!crosswordDefinition) {
      throw new Error("The Crossword must be initialised with a crossword definition.");
    }
  
    //  Set up some data we'll store in the class.
    this.width = crosswordDefinition.width;
    this.height = crosswordDefinition.height;
    this.acrossClues = [];
    this.downClues = [];
    this.cells = buildCellArray2D(this);

    //  Validate the bounds.
    if(this.width === undefined || this.width === null || this.width < 0 ||
      this.height === undefined || this.height === null || this.height < 0) {
      throw new Error("The crossword bounds are invalid.");
    }

    //  We're going to go through the across clues, then the down clues.
    var clueDefinitions = crosswordDefinition.acrossClues.concat(crosswordDefinition.downClues);
    for(var c = 0; c < clueDefinitions.length; c++) {
    
      //  Grab the clue and build a flag letting us know if we're across or down.
      var clueDefinition = clueDefinitions[c];
      var across = c < crosswordDefinition.acrossClues.length;
    
      //  Create a model for the clue.
      var clueModel = {
        number: clueDefinition.number,
        code: clueDefinition.number + (across ? "a" : "d"),
        answer: clueDefinition.answer,
        x: clueDefinition.x - 1,    //  Definitions are 1 based, models are more useful 0 based.
        y: clueDefinition.y - 1,
        across: across,
        length: [],
        totalLength: 0,
        clue: clueDefinition.clue,
        cells: []
      };
      this[across ? 'acrossClues' : 'downClues'].push(clueModel);

      //  The clue position must be in the bounds.
      if(clueModel.x < 0 || clueModel.x >= this.width || clueModel.y < 0 || clueModel.y >= this.height) {
        throw new Error("Clue " + clueModel.code + " doesn't start in the bounds.");
      }

      //  Copy over the clue definition length into the model,
      //  also keeping track of the total length.
      for(var i = 0; i < clueDefinition.length.length; i++) {
        clueModel.length.push(clueDefinition.length[i]);
        clueModel.totalLength += clueDefinition.length[i];
      }

      //  Make sure the clue is not too long.
      if(across) {
        if((clueModel.x + clueModel.totalLength) > this.width) {
          throw new Error("Clue " + clueModel.code + " exceeds horizontal bounds.");
        }
      } else {
        if((clueModel.y + clueModel.totalLength) > this.height) {
          throw new Error("Clue " + clueModel.code + " exceeds vertical bounds.");
        }
      }

      //  We can now mark the cells as light. If the clue has 
      //  an answer (which is optional), we can validate it 
      //  is coherent.
      var x = clueModel.x;
      var y = clueModel.y;
      for(var letter = 0; letter < clueModel.totalLength; letter++) {
        var cell = this.cells[x][y];
        cell.light = true;
        cell[across ? 'acrossClue' : 'downClue'] = clueModel;
        cell[across ? 'acrossClueLetterIndex' : 'downClueLetterIndex'] = letter;
        clueModel.cells.push(cell);

        //  If the clue has an answer we set it in the cell...
        if(clueModel.answer) {

          //  ...but only if it is not different to an existing answer.
          if(cell.answer !== undefined && cell.answer !== clueModel.answer[letter]) {
            throw new Error("Clue " + clueModel.code + " answer at (" + (x + 1) + ", " + (y + 1) + ") is not coherent with previous clue (" + cell.acrossClue.code + ") answer.");
          }
          cell.answer = clueModel.answer[letter];
        }

        if(letter === 0) {
          if(cell.clueLabel && cell.clueLabel !== clueModel.number) {
            throw new Error("Clue " + clueModel.code + " has a label which is inconsistent with another clue (" + cell.acrossClue.code + ").");
          }
          cell.clueLabel = clueModel.number;
        }

        if(across) {
          x++;
        } else {
          y++;
        }
      }
    }
  }

  //  Define our public API.
  CrosswordsJS.Crossword = Crossword;
  return CrosswordsJS;

})(CrosswordsJS || {}, window, document);
var CrosswordsJS = (function(CrosswordsJS, window, document) {

  'use strict';

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

  //  Define our public API.
  CrosswordsJS.CrosswordDOM = CrosswordDOM;
  return CrosswordsJS;

})(CrosswordsJS || {}, window, document);