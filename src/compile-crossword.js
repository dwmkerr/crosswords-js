const compileClue = require('./compile-clue');

function buildCellArray2D(crosswordModel) {
  const x = crosswordModel.width;
  const y = crosswordModel.height;
  const array = new Array(x);
  for (let i = 0; i < y; i++) {
    array[i] = new Array(y);
    for (let j = 0; j < y; j++) {
      array[i][j] = {
        crossword: crosswordModel,
        x: i,
        y: j,
      };
    }
  }
  return array;
}

//  Find the segment of an answer a specific letter is in.
function getAnswerSegment(answerStructure, letterIndex) {
  let remainingIndex = letterIndex;
  for (let i = 0; i < answerStructure.length; i++) {
    if (remainingIndex <= answerStructure[i].length) {
      return [answerStructure[i], remainingIndex];
    }
    remainingIndex -= answerStructure[i].length;
  }
}

//  The crossword class. When a crossword is built from a definition
//  and options, this is the object which is returned.
function compileCrossword(crosswordDefinition) {
  if (!crosswordDefinition) {
    throw new Error('The Crossword must be initialised with a crossword definition.');
  }

  //  Create the basic model structure.
  const model = {
    width: crosswordDefinition.width,
    height: crosswordDefinition.height,
    acrossClues: [],
    downClues: [],
    cells: [],
  };

  //  Validate the bounds.
  if (model.width === undefined || model.width === null || model.width < 0
      || model.height === undefined || model.height === null || model.height < 0) {
    throw new Error('The crossword bounds are invalid.');
  }

  //  Create the array of cells. Each element has a refence back to the model
  //  for convenience.
  model.cells = buildCellArray2D(model);

  //  We're going to go through the across clues, then the down clues.
  const clueDefinitions = crosswordDefinition.acrossClues.concat(crosswordDefinition.downClues);
  for (let c = 0; c < clueDefinitions.length; c++) {
    //  Grab the clue and build a flag letting us know if we're across or down.
    const clueDefinition = clueDefinitions[c];
    const across = c < crosswordDefinition.acrossClues.length;

    //  Compile the clue from the clue model.
    const clueModel = compileClue(clueDefinition.clue);

    //  TODO: extract this into the clueCompile function.
    //  Update the clue model.
    clueModel.code = clueModel.number + (across ? 'a' : 'd');
    clueModel.answer = clueDefinition.answer;
    clueModel.x = clueDefinition.x - 1; //  Definitions are 1 based, models are more useful 0 based.
    clueModel.y = clueDefinition.y - 1;
    clueModel.across = across;
    clueModel.cells = [];
    clueModel.clueLabel = `${clueModel.number}.`;
    model[across ? 'acrossClues' : 'downClues'].push(clueModel);

    //  The clue position must be in the bounds.
    if (clueModel.x < 0 || clueModel.x >= model.width || clueModel.y < 0 || clueModel.y >= model.height) {
      throw new Error(`Clue ${clueModel.code} doesn't start in the bounds.`);
    }

    //  Make sure the clue is not too long.
    if (across) {
      if ((clueModel.x + clueModel.totalLength) > model.width) {
        throw new Error(`Clue ${clueModel.code} exceeds horizontal bounds.`);
      }
    } else if ((clueModel.y + clueModel.totalLength) > model.height) {
      throw new Error(`Clue ${clueModel.code} exceeds vertical bounds.`);
    }

    //  We can now mark the cells as light. If the clue has
    //  an answer (which is optional), we can validate it
    //  is coherent.
    let { x, y } = clueModel;
    for (let letter = 0; letter < clueModel.totalLength; letter++) {
      const cell = model.cells[x][y];
      cell.light = true;
      cell[across ? 'acrossClue' : 'downClue'] = clueModel;
      cell[across ? 'acrossClueLetterIndex' : 'downClueLetterIndex'] = letter;
      clueModel.cells.push(cell);

      //  Check if we need to add an answer terminator.
      const [segment, index] = getAnswerSegment(clueModel.answerStructure, letter);
      if (index === (segment.length - 1) && segment.terminator !== '') {
        cell[clueModel.across ? 'acrossTerminator' : 'downTerminator'] = segment.terminator;
      }

      //  If the clue has an answer we set it in the cell...
      if (clueModel.answer) {
        //  ...but only if it is not different to an existing answer.
        if (cell.answer !== undefined && cell.answer !== ' ' && cell.answer !== clueModel.answer[letter]) {
          throw new Error(`Clue ${clueModel.code} answer at (${x + 1}, ${y + 1}) is not coherent with previous clue (${cell.acrossClue.code}) answer.`);
        }
        cell.answer = clueModel.answer[letter];
      }

      if (letter === 0) {
        if (cell.clueLabel && cell.clueLabel !== clueModel.number) {
          throw new Error(`Clue ${clueModel.code} has a label which is inconsistent with another clue (${cell.acrossClue.code}).`);
        }
        cell.clueLabel = clueModel.number;
      }

      if (across) {
        x++;
      } else {
        y++;
      }
    }
  }

  //  Now that we have constructed the full model, we will connect the non-linear
  //  clues.
  const allClues = model.acrossClues.concat(model.downClues);
  allClues.forEach((clue) => {
    //  Skip clues without a connected clue.
    if (!clue.connectedClueNumbers) return;

    //  Find the connected clues.
    clue.connectedClues = clue.connectedClueNumbers.map((connectedClue) => {
      if (connectedClue.direction === 'across') {
        return model.acrossClues.find((ac) => ac.number === connectedClue.number);
      }
      if (connectedClue.direction === 'down') {
        return model.downClues.find((ac) => ac.number === connectedClue.number);
      }
      return model.acrossClues.find((ac) => ac.number === connectedClue.number)
        || model.downClues.find((ac) => ac.number === connectedClue.number);
    });

    //  Rebuild the answer structure text.
    clue.answerStructureText = '('
      + [clue.answerStructureText].concat(clue.connectedClues
        .map((cc) => cc.answerStructureText)).join(',').replace(/[()]/g, '')
      + ')';

    //  Each clue should know its parent 'master clue' as well as the next and
    //  previous clue segments.
    let clueSegmentIndex = 0;
    const clueSegments = [clue].concat(clue.connectedClues);
    clueSegments.forEach((cs) => {
      if (clueSegmentIndex > 0) cs.previousClueSegment = clueSegments[clueSegmentIndex - 1];
      if (clueSegmentIndex < (clueSegments.length - 1)) cs.nextClueSegment = clueSegments[clueSegmentIndex + 1];
      cs.parentClue = clueSegments[0];
      clueSegmentIndex++;
    });

    //  Create the master clue label.
    clue.clueLabel = `${[clue.number].concat(clue.connectedClues.map((cc) => cc.number)).join(',')}.`;

    //  The connected clues need no answer structure, an indicator they are
    //  connected clues and a back link to the master clue.
    clue.connectedClues.forEach((cc) => {
      cc.answerStructureText = null; // we just show the answer structure for the first clue
      cc.isConnectedClue = true; // makes it easier to render these clues differently
    });
  });

  return model;
}

module.exports = compileCrossword;
