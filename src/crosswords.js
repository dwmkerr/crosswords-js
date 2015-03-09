var CrosswordsJS = (function(window, document) {

  'use strict';

  //  Lightweight helper functions.
  function removeClass(element, className) {
    var expression = new RegExp("(?:^|\\s)" + className + "(?!\\S)", "g");
    element.className = element.className.replace(expression, '');
  }
  function addClass(element, className) {
    element.className += " " + className;
  }
  function buildObjectArray2D(x, y) {
    var array = new Array(x);
    for(var i=0; i<y; i++) {
      array[i] = new Array(y);
      for(var j=0; j<y; j++) {
        array[i][j] = {};
      }
    }
    return array;
  }

  //  The cellmap ties cell elements to the crossword that owns them.
  var cellMap = [];
  var getCellElementData = function getCellElementData(cellElement) {
    for(var i = 0; i < cellMap.length; i++) {
      if(cellMap[i].cellElement === cellElement) {
        return cellMap[i];
      }
    }
    return null;
  };

  //  The crossword class. When a crossword is built from a definition
  //  and options, this is the object which is returned.
  function Crossword(parentElement, crosswordDefinition) {
  
    //  Set up some data we'll store in the class.
    this.width = crosswordDefinition.width;
    this.height = crosswordDefinition.height;
    this.acrossClues = [];
    this.downClues = [];
    this.cells = buildObjectArray2D(this.width, this.height);

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

    this.crosswordElement = this._createDOM(parentElement);
  }

  //  Selects a clue.
  Crossword.prototype.selectClue = function selectClue(clue) {
    this.currentClue = clue;
    this._updateDOM();
    this.currentClue.cells[0].cellElement.focus();
    this._stateChange("clueSelected");
  };

  //  Sends a state change message.
  Crossword.prototype._stateChange = function _stateChange(message, data) {

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

  //  Creates the DOM for a crossword. Return the newly created crossword div.
  Crossword.prototype._createDOM = function _createDOM(parentElement) {

    //  Now build the DOM for the crossword.
    var container = document.createElement('div');
    container.className = "crossword";

    //  Create each cell.
    for(var y = 0; y < this.height; y++) {

      var row = document.createElement('div');
      row.className = "cwrow";
      container.appendChild(row);

      for(var x = 0; x < this.width; x++) {

        var cell = this.cells[x][y];

        //  Build the cell element and add it to the row.
        var cellElement = this._createCellDOM(cell);
        row.appendChild(cellElement);

        //  Update the map of cells
        cellMap.push({
          cellElement: cellElement,
          crossword: this,
          cell: cell
        });

      }

    }

    parentElement.appendChild(container);
  };
  
  //  Creates DOM for a cell.
  Crossword.prototype._createCellDOM = function _createCellDOM(cell) {

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
      var cellData = getCellElementData(cellElement);
      var crossword = cellData.crossword;
      var across = cellData.cell.acrossClue;
      var down = cellData.cell.downClue;

      //  If we have clicked somewhere which is part of the current clue, we
      //  will not need to change it (we won't toggle either).
      if(crossword.currentClue && 
         (crossword.currentClue === across ||
          crossword.currentClue === down)) {
        return;
      }

      //  If we have an across clue XOR a down clue, pick the one we have.
      if( (across && !down) || (!across && down) ) {
        crossword.currentClue = across || down;
      } else {
        //  We've got across AND down. Prefer across, unless we've on the 
        //  first letter of a down clue only
        crossword.currentClue = cellData.cell.downClueLetterIndex === 0 && cellData.cell.acrossClueLetterIndex !== 0 ? down : across;     
      }

      //  Update the DOM, inform of state change.
      crossword._updateDOM();
      crossword._stateChange("clueSelected");
      
    });

    //  Listen for keydown events.
    cellElement.addEventListener("keydown", function(event) {

      if(event.keyCode === 8) { // backspace
          
        //  Blat the contents of the cell. No need to process the backspace.
        event.preventDefault();
        event.target.value = "";

        //  Try and move to the previous cell of the clue.
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell;
        var clue = cellData.crossword.currentClue;
        var currentIndex = cell.acrossClue === clue ? cell.acrossClueLetterIndex : cell.downClueLetterIndex;
        var previousIndex = currentIndex - 1;
        if(previousIndex >= 0) {
          clue.cells[previousIndex].cellElement.querySelector('input').focus();
        }

      } else if(event.keyCode === 9) { // tab

        //  We don't want default behaviour.
        event.preventDefault();

        //  Get the cell element and cell data.
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var clue = cellData.crossword.currentClue;
        var model = cellData.crossword;

        //  Get the next clue.
        var searchClues = clue.across ? model.acrossClues : model.downClues;
        for(var i=0; i<searchClues.length; i++) {
          if(clue === searchClues[i]) {
            var newClue = null;
            if(event.shiftKey) {
              if(i > 0) {
                newClue = searchClues[i-1];
              } else {
                newClue = clue.across ? model.downClues[model.downClues.length-1] : model.acrossClues[model.acrossClues.length-1];
              }
            } else {
              if(i < (searchClues.length - 1)) {
                newClue = searchClues[i+1];
              } else {
                newClue = clue.across ? model.downClues[0] : model.acrossClues[0];
              }
            }
            //  Select the new clue.
            model.currentClue = newClue;
            model._updateDOM();
            newClue.cells[0].cellElement.querySelector('input').focus({internal: true});
            break;
          }
        }

      } else if (event.keyCode === 13) { // enter

        //  We don't want default behaviour.
        event.preventDefault();

        //  Get the cell element and cell data.
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell;
        var model = cellData.crossword;

        //  If we are in a cell with an across clue AND down clue, swap the
        //  selected one.
        if(cell.acrossClue && cell.downClue) {
          model.currentClue = cell.acrossClue === model.currentClue ? cell.downClue : cell.acrossClue;
          model._updateDOM();
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

      //  Move to the next cell in the clue.
      var cellElement = event.target.parentNode;
      var cellData = getCellElementData(cellElement);
      var cell = cellData.cell;
      var clue = cellData.crossword.currentClue;
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
          var cellData = getCellElementData(cellElement);
          var cell = cellData.cell;
          var x = cell.x, y = cell.y;

          //  If we can go left, go left.
          if(cell.x > 0 && cellData.crossword.cells[x-1][y].light === true) {
            //  TODO: optimise with children[0]?
            cellData.crossword.cells[x-1][y].cellElement.querySelector('input').focus();
          }
          break;
        case 38: // up
          var cellElement = event.target.parentNode;
          var cellData = getCellElementData(cellElement);
          var cell = cellData.cell;
          var x = cell.x, y = cell.y;

          //  If we can go up, go up.
          if(cell.y > 0 && cellData.crossword.cells[x][y-1].light === true) {
            //  TODO: optimise with children[0]?
            cellData.crossword.cells[x][y-1].cellElement.querySelector('input').focus();
          }
          break;
        case 39: // right
          var cellElement = event.target.parentNode;
          var cellData = getCellElementData(cellElement);
          var cell = cellData.cell, width = cellData.crossword.width;
          var x = cell.x, y = cell.y;

          //  If we can go right, go right.
          if(cell.x + 1 < width && cellData.crossword.cells[x+1][y].light === true) {
            //  TODO: optimise with children[0]?
            cellData.crossword.cells[x+1][y].cellElement.querySelector('input').focus();
          }
          break;
        case 40: // down
          var cellElement = event.target.parentNode;
          var cellData = getCellElementData(cellElement);
          var cell = cellData.cell, height = cellData.crossword.height;
          var x = cell.x, y = cell.y;

          //  If we can go down, go down.
          if(cell.y + 1 < height && cellData.crossword.cells[x][y+1].light === true) {
            //  TODO: optimise with children[0]?
            cellData.crossword.cells[x][y+1].cellElement.querySelector('input').focus();
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
  Crossword.prototype._updateDOM = function _updateDOM(crosswordModel) {

    //  TODO: pick a name - active, current or selected.
    var activeClue = this.currentClue;

    //  Deactivate all cells, except those which match the clue.
    for(var x = 0; x < this.cells.length; x++) {
      for(var y = 0; y < this.cells[x].length; y++) {
        var cell = this.cells[x][y];
        if(cell.light === true) { 
          if((cell.acrossClue === activeClue) || (cell.downClue === activeClue)) {
            addClass(cell.cellElement.querySelector('input'), "active");
          } else {
            removeClass(cell.cellElement.querySelector('input'), "active");
          }
        }
      }
    }
  };

  //  Builds a crossword from options.
  function buildCrossword(options) {

    //  Validate the options.
    if(options === null || options === undefined) {
      throw new Error("An options parameter must be passed to 'crossword'.");
    }
    if(options.element === null || options.element === undefined) {
      throw new Error("The crossword must be initialised with a valid DOM element.");
    }
    if(options.crosswordDefinition === null || options.crosswordDefinition === undefined) {
      throw new Error("The crossword must be initialised with a crossword definition.");
    }

    //  Create the crossword object. Throws an exception if there are any issues.
    return new Crossword(options.element, options.crosswordDefinition);
  }

  //  Define our public API.
  return {
    buildCrossword: function(options) {
      return buildCrossword(options);
    }
  };

})(window, document);