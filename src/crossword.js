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