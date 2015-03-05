"use strict";

//  Every cell created is in the map, which lists the cell, associated
//  crossword model and DOM element.
var cellMap = [];
var getCellElementData = function getCellElementData(cellElement) {
  for(var i = 0; i < cellMap.length; i++) {
    if(cellMap[i].cellElement === cellElement) {
      return cellMap[i];
    }
  }
  return null;
};
var getCellData = function getCellData(cell) {
  for(var i = 0; i < cellMap.length; i++) {
    if(cellMap[i].cell === cell) {
      return cellMap[i];
    }
  }
  return null;  
};

//  Remove a class
var removeClass = function removeClass(element, className) {
  var expression = new RegExp("(?:^|\\s)" + className + "(?!\\S)", "g");
  element.className = element.className.replace(expression, '');
};
var addClass = function addClass(element, className) {
  element.className += " " + className;
};

//  Validate options. Throws if there are issues.
var validateOptions = function validateOptions(options) {

  if(options === null || options === undefined) {
    throw new Error("An options parameter must be passed to 'crossword'.");
  }

  if(options.element === null || options.element === undefined) {
    throw new Error("The crossword must be initialised with a valid DOM element.");
  }

  if(options.crosswordDefinition === null || options.crosswordDefinition === undefined) {
    throw new Error("The crossword must be initialised with a crossword definition.");
  }

};

//  Sends a state change message.
var stateChange = function stateChange(crosswordModel, message, data) {

  var eventHandler = crosswordModel.onStateChanged;
  if(!eventHandler) {
    return;
  }

  //  Send the message.
  eventHandler({
    message: message,
    data: data
  });

};

//  Builds a crosswordModel from a crosswordDefinition.
var buildCrosswordModel = function buildCrosswordModel(crosswordDefinition) {

  //  We'll use the width and height a lot.
  var width = crosswordDefinition.width;
  var height = crosswordDefinition.height;

  //  Validate the bounds.
  if(width === undefined || width === null || width < 0 ||
    height === undefined || height === null || height < 0) {
    throw new Error("The crossword bounds are invalid.");
  }

  //  We need to create an array of cell models.
  var cells = [];
  for(var x = 0; x < width; x++) {
    cells[x] = [];
    for(var y = 0; y < height; y++) {
      cells[x][y] = {
        x: x,
        y: y,
        light: false,
        clueLabel: null,
        acrossClue: null,
        acrossClueLetterIndex: null,
        downClue: null,
        downClueLetterIndex: null
      };
    }
  }

  //  Create the structure of the model.
  var crosswordModel = {
    width: width,
    height: height,
    cells: cells,
    acrossClues: [],
    downClues: [],
    onStateChanged: null
  };

  //  We're going to go through the across clues, then the down clues.
  var clueDefinitions = crosswordDefinition.acrossClues.concat(crosswordDefinition.downClues);
  
  //  We can now go through the clues and decorate the cells.
  for(var c = 0; c < clueDefinitions.length; c++) {
  
    var across = c < crosswordDefinition.acrossClues.length;
  
    //  Create the clue model, with space for pointers to its cell.
    var clueDefinition = clueDefinitions[c];
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
    crosswordModel[across ? 'acrossClues' : 'downClues'].push(clueModel);

    //  The clue position must be in the bounds.
    if(clueModel.x < 0 || clueModel.x >= width || clueModel.y < 0 || clueModel.y >= height) {
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
      if((clueModel.x + clueModel.totalLength) > width) {
        throw new Error("Clue " + clueModel.code + " exceeds horizontal bounds.");
      }
    } else {
      if((clueModel.y + clueModel.totalLength) > height) {
        throw new Error("Clue " + clueModel.code + " exceeds vertical bounds.");
      }
    }

    //  We can now mark the cells as light. If the clue has 
    //  an answer (which is optional), we can validate it 
    //  is coherent.
    var x = clueModel.x;
    var y = clueModel.y;
    for(var letter = 0; letter < clueModel.totalLength; letter++) {
      var cell = cells[x][y];
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
        if(cell.clueLabel !== null && cell.clueLabel !== clueModel.number) {
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

  return crosswordModel;

};

//  Updates the DOM based on the model, ensuring that the CSS
//  is correct for the state (i.e. the selected clue).
function updateDOM(crosswordModel) {

  var activeClue = crosswordModel.currentClue;

  //  Deactivate all cells, except those which match the clue.
  for(var x = 0; x < crosswordModel.cells.length; x++) {
    for(var y = 0; y < crosswordModel.cells[x].length; y++) {
      var cell = crosswordModel.cells[x][y];
      if(cell.light === true) { 
        if((cell.acrossClue === activeClue) || (cell.downClue === activeClue)) {
          addClass(cell.cellElement.querySelector('input'), "active");
        } else {
          removeClass(cell.cellElement.querySelector('input'), "active");
        }
      }
    }
  }

}

function createCellElement(cell) {

  var cellElement = document.createElement('div');
  cellElement.className = "cwcell";
  cell.cellElement = cellElement;

  //  If the cell is dark, we are done.
  if(!cell.light) {
    return cellElement;
  }

  //  Light cells need another style.
  cellElement.className += " light";

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
    var crosswordModel = cellData.crosswordModel;

    //  Find the clue we are focusing.
    //  TODO: If we have both down and across, we must toggle between them.

    //  Get the clue in the cell we're going to focus. Prefer the current orientation.
    var focusedClue = (crosswordModel.currentClue && crosswordModel.currentClue === cellData.cell.downClue) 
                        ? cellData.cell.downClue || cellData.cell.acrossClue
                        : cellData.cell.acrossClue || cellData.cell.downClue;


    //  If the focused clue is not the current clue, select it and notify.
    if(crosswordModel.currentClue !== focusedClue) {
      crosswordModel.currentClue = focusedClue;
      updateDOM(crosswordModel);
      stateChange(crosswordModel, "clueSelected");
    }

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
      var clue = cellData.crosswordModel.currentClue;
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
      var clue = cellData.crosswordModel.currentClue;
      var model = cellData.crosswordModel;

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
          updateDOM(model);
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
      var model = cellData.crosswordModel;

      //  If we are in a cell with an across clue AND down clue, swap the
      //  selected one.
      if(cell.acrossClue && cell.downClue) {
        model.currentClue = cell.acrossClue === model.currentClue ? cell.downClue : cell.acrossClue;
        updateDOM(model);
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
    var clue = cellData.crosswordModel.currentClue;
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
        if(cell.x > 0 && cellData.crosswordModel.cells[x-1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordModel.cells[x-1][y].cellElement.querySelector('input').focus();
        }
        break;
      case 38: // up
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell;
        var x = cell.x, y = cell.y;

        //  If we can go up, go up.
        if(cell.y > 0 && cellData.crosswordModel.cells[x][y-1].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordModel.cells[x][y-1].cellElement.querySelector('input').focus();
        }
        break;
      case 39: // right
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell, width = cellData.crosswordModel.width;
        var x = cell.x, y = cell.y;

        //  If we can go right, go right.
        if(cell.x + 1 < width && cellData.crosswordModel.cells[x+1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordModel.cells[x+1][y].cellElement.querySelector('input').focus();
        }
        break;
      case 40: // down
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell, height = cellData.crosswordModel.height;
        var x = cell.x, y = cell.y;

        //  If we can go down, go down.
        if(cell.y + 1 < height && cellData.crosswordModel.cells[x][y+1].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordModel.cells[x][y+1].cellElement.querySelector('input').focus();
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
}

function crossword(options) {

  //  Validate the options.
  validateOptions(options);

  //  Now create the crossword model, which also validates
  //  the crossword definition.
  var crosswordModel = buildCrosswordModel(options.crosswordDefinition);

  //  Add state to the model.
  crosswordModel.currentClue = null;

  var width = crosswordModel.width;
  var height = crosswordModel.height;

  //  Create the main crossword element. This has the 
  var container = document.createElement('div');
  container.className = "crossword";

  for(var y = 0; y < height; y++) {

    var row = document.createElement('div');
    row.className = "cwrow";
    container.appendChild(row);

    for(var x = 0; x < width; x++) {

      var cell = crosswordModel.cells[x][y];

      //  Build the cell element and add it to the row.
      var cellElement = createCellElement(cell);
      row.appendChild(cellElement);

      //  Update the map of cells
      cellMap.push({
        cellElement: cellElement,
        crosswordModel: crosswordModel,
        cell: cell
      });

    }

  }

  options.element.appendChild(container);

  return crosswordModel;
}

//  TODO the crossword should be a class, functions like this should be
//  exposed on the class.

function selectClue(crosswordModel, clue) {
  crosswordModel.currentClue = clue;
  updateDOM(crosswordModel);
  crosswordModel.currentClue.cells[0].cellElement.focus();
  stateChange(crosswordModel, "clueSelected");
}
