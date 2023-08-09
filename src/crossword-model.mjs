import { setLetter, trace } from './helpers.mjs';
import { newClueModel } from './clue-model.mjs';

// Helper for newCrosswordModel()
function buildCellGrid(crosswordModel) {
  const { width } = crosswordModel;
  const { height } = crosswordModel;
  const array = new Array(width);
  for (let across = 0; across < width; across += 1) {
    array[across] = new Array(height);
    for (let down = 0; down < height; down += 1) {
      array[across][down] = {
        model: crosswordModel,
        x: across,
        y: down,
      };
    }
  }
  return array;
}

// Helper for newCrosswordModel()
// Find the segment of an answer a specific letter is in.
function getAnswerSegment(answerSegments, letterIndex) {
  let remainingIndex = letterIndex;
  for (const as of answerSegments) {
    if (remainingIndex <= as.length) {
      return [as, remainingIndex];
    }

    remainingIndex -= as.length;
  }

  return null;
}

// Helper for newCrosswordModel()
function initialiseCrosswordModel(crosswordDefinition) {
  let crosswordModel = {
    width: crosswordDefinition.width,
    height: crosswordDefinition.height,
    acrossClues: [],
    downClues: [],
    cells: [],
  };
  if (
    crosswordModel.width === undefined ||
    crosswordModel.width === null ||
    crosswordModel.width < 0 ||
    crosswordModel.height === undefined ||
    crosswordModel.height === null ||
    crosswordModel.height < 0
  ) {
    throw new Error('The crossword bounds are invalid.');
  }
  return crosswordModel;
}

// Helper for newCrosswordModel()
function validateClueInCrossword(clueModel, crosswordModel, isAcrossClue) {
  if (
    clueModel.x < 0 ||
    clueModel.x >= crosswordModel.width ||
    clueModel.y < 0 ||
    clueModel.y >= crosswordModel.height
  ) {
    throw new Error(`Clue ${clueModel.code} doesn't start in the bounds.`);
  }

  //  Make sure the clue is not too long.
  if (isAcrossClue) {
    if (clueModel.x + clueModel.answerLength > crosswordModel.width) {
      throw new Error(`Clue ${clueModel.code} exceeds horizontal bounds.`);
    }
    // down clue
  } else if (clueModel.y + clueModel.answerLength > crosswordModel.height) {
    throw new Error(`Clue ${clueModel.code} exceeds vertical bounds.`);
  }
}

// Helper for newCrosswordModel()
function updateOrthogonalClue(cell, character, isAcrossClue) {
  //  eslint-disable-next-line no-param-reassign

  //  We need to update the answers
  if (!isAcrossClue && cell.acrossClue) {
    //  eslint-disable-next-line no-param-reassign
    cell.acrossClue.answer = setLetter(
      cell.acrossClue.answer,
      cell.acrossClueLetterIndex,
      character,
    );
  }
  if (isAcrossClue && cell.downClue) {
    //  eslint-disable-next-line no-param-reassign
    cell.downClue.answer = setLetter(
      cell.downClue.answer,
      cell.downClueLetterIndex,
      character,
    );
  }
}

/**
 * **newCrosswordModel**: build a crossword model from a crosswordDefinition object.
 * - The function compiles a JSON crossword and emits diagnostic exceptions when errors are encountered.
 * @param {*} crosswordDefinition A javascript Object typically parsed or imported from a crossword description file in JSON or YAML format.
 * @returns a crossword model object
 */
function newCrosswordModel(crosswordDefinition) {
  trace('newCrosswordModel');
  if (!crosswordDefinition) {
    throw new Error(
      'The model must be initialised with a JSON crossword definition.',
    );
  }

  //  Create the basic crosswordModel structure.
  let crosswordModel = initialiseCrosswordModel(crosswordDefinition);

  //  Create the array of cells. Each element has a reference back to the crosswordModel
  //  for convenience.
  crosswordModel.cells = buildCellGrid(crosswordModel);

  //  We're going to go through the across clues, then the down clues.
  const cdClues = crosswordDefinition.acrossClues.concat(
    crosswordDefinition.downClues,
  );
  for (let index = 0; index < cdClues.length; index += 1) {
    //  Grab the clue and build a flag letting us know if we're across or down.
    const cdClue = cdClues[index];
    const isAcrossClue = index < crosswordDefinition.acrossClues.length;

    //  Compile the clue model from the crossword definition of the clue
    const clueModel = newClueModel(cdClue, isAcrossClue);
    //  Add clue model to crosswordModel clues array.
    crosswordModel[isAcrossClue ? 'acrossClues' : 'downClues'].push(clueModel);

    //  The clue position must be in the bounds.
    validateClueInCrossword(clueModel, crosswordModel, isAcrossClue);

    //  We can now mark the cells as light. If the clue has
    //  an answer (which is optional), we can validate it
    //  is coherent.
    let { x, y } = clueModel;
    const cellDefaultAnswer = ' ';
    const cellDefaultSolution = ' ';
    for (let letter = 0; letter < clueModel.answerLength; letter += 1) {
      const cell = crosswordModel.cells[x][y];
      cell.light = true;
      cell[isAcrossClue ? 'acrossClue' : 'downClue'] = clueModel;
      cell[isAcrossClue ? 'acrossClueLetterIndex' : 'downClueLetterIndex'] =
        letter;
      clueModel.cells.push(cell);

      //  Check if we need to add an answer terminator.
      const [segment, index] = getAnswerSegment(
        clueModel.answerSegments,
        letter,
      );
      if (index === segment.length - 1 && segment.terminator !== '') {
        cell[clueModel.isAcross ? 'acrossTerminator' : 'downTerminator'] =
          segment.terminator;
      }

      //  If the imported clue has an answer we set it in the cell...
      if (cdClue.answer) {
        //  ...but only if it is not different to an existing answer.
        if (
          cell.answer &&
          // We can overwrite any cells that have default value
          cell.answer !== cellDefaultAnswer &&
          cell.answer !== clueModel.answer[letter]
        ) {
          throw new Error(
            `Clue ${clueModel.code} answer at (${x + 1},${y + 1}) [${
              clueModel.answer
            }[${letter + 1}],${
              clueModel.answer[letter]
            }] is not coherent with previous clue (${
              cell.acrossClue.code
            }) answer [${cell.acrossClue.answer},${cell.answer}].`,
          );
        }
        // if cell.answer && cell.answer !== ' '
        cell.answer = clueModel.answer[letter];
        // check if cell appears in a clue in the other direction
        updateOrthogonalClue(cell, cell.answer, isAcrossClue);
      }
      // no answer in imported clue, insert default if cell is vacant
      else {
        // don't clobber an existing value
        if (!cell.answer) {
          cell.answer = cellDefaultAnswer;
        }
      }

      //  If the imported clue has a solution we set it in the cell...
      if (cdClue.solution) {
        //  ...but only if it is NOT different to any existing solution.
        if (
          cell.solution &&
          // We can overwrite any cells that have the default value
          cell.solution !== cellDefaultSolution &&
          cell.solution !== clueModel.solution[letter]
        ) {
          throw new Error(
            `Clue ${clueModel.code} solution at (${x + 1},${y + 1}) [${
              clueModel.solution
            }[${letter + 1}],${
              clueModel.solution[letter]
            }] is not coherent with previous clue (${
              cell.acrossClue.code
            }) solution [${cell.acrossClue.solution},${cell.solution}].`,
          );
        }
        // if (cell.solution && cell.solution !== ' '
        cell.solution = clueModel.solution[letter];
      }
      // no solution in imported clue
      else {
        // insert default value (space ' ')
        cell.solution = cellDefaultSolution;
      }

      if (letter === 0) {
        if (cell.clueLabel && cell.clueLabel !== clueModel.number) {
          throw new Error(
            `Clue ${clueModel.code} has a label which is inconsistent with another clue (${cell.acrossClue.code}).`,
          );
        }
        cell.clueLabel = clueModel.number;
      }

      if (isAcrossClue) {
        x += 1;
      } else {
        y += 1;
      }
    }
  }

  //  Now that we have constructed the full crosswordModel,
  //  we will connect the multi-segment clues.
  const allClues = crosswordModel.acrossClues.concat(crosswordModel.downClues);
  allClues.forEach((clue) => {
    //  Skip clues without a connected clue.
    if (!clue.connectedDirectedClues) return;

    //  Find the connected clues.
    //  eslint-disable-next-line no-param-reassign
    clue.connectedClues = clue.connectedDirectedClues.map((cdc) => {
      if (cdc.direction === 'across') {
        return crosswordModel.acrossClues.find(
          (ac) => ac.number === cdc.number,
        );
      }
      if (cdc.direction === 'down') {
        return crosswordModel.downClues.find((dc) => dc.number === cdc.number);
      }
      return (
        crosswordModel.acrossClues.find((ac) => ac.number === cdc.number) ||
        crosswordModel.downClues.find((dc) => dc.number === cdc.number)
      );
    });

    //  Rebuild the answer structure text.
    //  eslint-disable-next-line no-param-reassign
    clue.answerLengthText = `(${[clue.answerLengthText]
      .concat(clue.connectedClues.map((cc) => cc.answerLengthText))
      .join(',')
      .replace(/[()]/g, '')})`;

    //  Each clue should know its parent 'master clue' as well as the next and
    //  previous clue segments.
    let clueSegmentIndex = 0;
    const clueSegments = [clue].concat(clue.connectedClues);
    clueSegments.forEach((cs) => {
      if (clueSegmentIndex > 0) {
        //  eslint-disable-next-line no-param-reassign
        cs.previousClueSegment = clueSegments[clueSegmentIndex - 1];
      }
      if (clueSegmentIndex < clueSegments.length - 1) {
        //  eslint-disable-next-line no-param-reassign
        cs.nextClueSegment = clueSegments[clueSegmentIndex + 1];
      }
      //  eslint-disable-next-line no-param-reassign
      [cs.parentClue] = clueSegments;
      clueSegmentIndex += 1;
    });

    //  Create the master clue label.
    //  eslint-disable-next-line no-param-reassign
    clue.clueLabel = `${[clue.number]
      .concat(clue.connectedClues.map((cc) => cc.number))
      .join(',')}.`;

    //  The connected clues need no answer structure, an indicator they are
    //  connected clues and a back link to the master clue.
    clue.connectedClues.forEach((cc) => {
      //  eslint-disable-next-line no-param-reassign
      cc.answerLengthText = null; // we just show the answer structure for the first clue
      //  eslint-disable-next-line no-param-reassign
      cc.isConnectedClue = true; // makes it easier to render these clues differently
    });
  });

  return crosswordModel;
}

export { newCrosswordModel };
