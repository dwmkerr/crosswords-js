"use strict";

//  Every time we build a crossword, we create a crossword state.
var crosswordStates = [];

//  The cellElementData array contains the references between cell
//  elements and the state data.
var cellElementDataMap = [];
var getCellElementData = function getCellElementData(cellElement) {
  for(var i = 0; i < cellElementDataMap.length; i++) {
    if(cellElementDataMap[i].cellElement === cellElement) {
      return cellElementDataMap[i];
    }
  }
  return null;
};
var getCellData = function getCellData(cell) {
  for(var i = 0; i < cellElementDataMap.length; i++) {
    if(cellElementDataMap[i].cell === cell) {
      return cellElementDataMap[i];
    }
  }
  return null;  
};

//  Remove a class
var removeClass = function removeClass(element, className) {
  var expression = new RegExp("(?:^|\\s)" + className + "(?!\\S)");
  element.className = element.className.replace(expression, '');
}
var addClass = function addClass(element, className) {
  element.className += " " + className;
}

//  Validate options. Throws if there are issues.
var validateOptions = function validateOptions(options) {

  if(options === null || options === undefined) {
    throw new Error("An options parameter must be passed to 'crossword'.");
  }

  if(options.element === null || options.element === undefined) {
    throw new Error("The crossword must be initialised with a valid DOM element.");
  }

  if(options.crossword === null || options.crossword === undefined) {
    throw new Error("The crossword must be initialised with a crossword.");
  }

};

//  Builds a cell model from the crossword. Throws if there
//  are problems with the crossword provided.
//  TODO: Expose as a dedicated API for others. Useful for
//  others to load crossword data and validate it.
var buildCellModel = function buildCellModel(crossword) {

  var width = crossword.width;
  var height = crossword.height;

  if(width === undefined || width === null || width < 0 ||
    height === undefined || height === null || height < 0) {
    throw new Error("The crossword bounds are invalid.");
  }

  //  We need to create an array of cell objects.
  var cells = [];
  for(var x = 0; x < width; x++) {
    cells[x] = [];
    for(var y = 0; y < height; y++) {
      cells[x][y] = {
        x: x,
        y: y,
        light: false,
        clue: null
      };
    }
  }

  //  We can now go through the clues and decorate the cells.
  for(var c = 0; c < crossword.clues.length; c++) {
    var clue = crossword.clues[c];
    clue.cells = [];

    //  Total length of the clue is the sum of the length
    //  array, which looks like [3,2,3].
    var length = 0;
    for(var i = 0; i < clue.length.length; i++) {
      length += clue.length[i];
    }

    //  The clue must not exceed the bounds.
    if(clue.x < 1 || clue.x > width || clue.y < 1 || clue.y > height) {
      throw new Error("Clue " + clue.number + " doesn't start in the bounds.");
    }
    if(clue.direction === 'across') {
      if((clue.x + length - 1) > width) {
        throw new Error("Clue " + clue.number + " exceeds horizontal bounds.");
      }
    } else {
      if((clue.y + length - 1) > height) {
        throw new Error("Clue " + clue.number + " exceeds vertical bounds.");
      }
    }

    //  We can now mark the cells as light. If the clue has 
    //  an answer (which is optional), we can validate it 
    //  is coherent.
    var x = clue.x - 1;
    var y = clue.y - 1;
    for(var letter = 0; letter < length; letter++) {
      var cell = cells[x][y];
      cell.light = true;
      cell.clue = clue;
      clue.cells.push(clue);

      if(clue.answer && clue.answer[letter]) {
        if(cell.answer && clue.answer[letter] !== cell.answer) {
          throw new Error("Clue " + clue.number + " at (" + (x + 1) + ", " + (y + 1) + ") is not coherent with previous clues answers.");
        }
        cell.answer = clue.answer[letter];
      }

      //  todo validate the cell label.
      if(letter === 0) {
        cell.clueLabel = clue.number;
      }

      if(clue.direction === 'across') {
        x++;
      } else {
        y++;
      }
    }
    
  }

  return cells;

};

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
    var crosswordState = cellData.crosswordState;
    crosswordState.currentX = cellData.cell.x;
    crosswordState.currentY = cellData.cell.y;

    //  Deactivate all cells, except those which match the clue.
    for(var x = 0; x < crosswordState.cells.length; x++) {
      for(var y = 0; y < crosswordState.cells[x].length; y++) {
        var cell = crosswordState.cells[x][y];
        if(cell.light === true) { 
          if(cell.clue === cellData.cell.clue) {
            addClass(cell.cellElement.querySelector('input'), "active");
          } else {
            removeClass(cell.cellElement.querySelector('input'), "active");
          }
        }
      }
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
        if(cell.x > 0 && cellData.crosswordState.cells[x-1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordState.cells[x-1][y].cellElement.querySelector('input').focus();
        }
        break;
      case 38: // up
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell;
        var x = cell.x, y = cell.y;

        //  If we can go up, go up.
        if(cell.y > 0 && cellData.crosswordState.cells[x][y-1].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordState.cells[x][y-1].cellElement.querySelector('input').focus();
        }
        break;
      case 39: // right
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell, width = cellData.crosswordState.width;
        var x = cell.x, y = cell.y;

        //  If we can go right, go right.
        if(cell.x + 1 < width && cellData.crosswordState.cells[x+1][y].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordState.cells[x+1][y].cellElement.querySelector('input').focus();
        }
        break;
      case 40: // down
        var cellElement = event.target.parentNode;
        var cellData = getCellElementData(cellElement);
        var cell = cellData.cell, height = cellData.crosswordState.height;
        var x = cell.x, y = cell.y;

        //  If we can go down, go down.
        if(cell.y + 1 < height && cellData.crosswordState.cells[x][y+1].light === true) {
          //  TODO: optimise with children[0]?
          cellData.crosswordState.cells[x][y+1].cellElement.querySelector('input').focus();
        }
        break;
    }
  });

  return cellElement;
}

function crossword(options) {

  //  Validate the options.
  validateOptions(options);

  //  Now build the cell model from the crossword.
  var cells = buildCellModel(options.crossword);

  //  We can now construct the crossword state.
  var crosswordState = {
    number: crosswordStates.length,
    width: options.crossword.width,
    height: options.crossword.height,
    cells: cells,
    element: null,
    currentX: null,
    currentY: null
  };

  var width = options.crossword.width;
  var height = options.crossword.height;

  //  Create the main crossword element. This has the 
  var container = document.createElement('div');
  container.id = "cw" + crosswordState.number;
  container.className = "crossword";

  for(var y = 0; y < height; y++) {

    var row = document.createElement('div');
    row.className = "cwrow";
    container.appendChild(row);

    for(var x = 0; x < width; x++) {

      var cell = cells[x][y];

      //  Build the cell element.
      var cellElement = createCellElement(cell);

      row.appendChild(cellElement);

      //  We've got a cell element, so we should add it to the 
      //  cell element data map. This is how we go from the DOM
      //  to state.
      cellElementDataMap.push({
        cellElement: cellElement,
        crosswordState: crosswordState,
        cell: cell
      });

    }

  }

  options.element.appendChild(container);

  //  We've built the crossword. Add the state to our global 
  //  set of crosswords and return it.
  crosswordState.element = container;
  crosswordStates.push(crosswordState);
  return crosswordState;
}

