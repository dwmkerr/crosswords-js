const { newClueModel } = require("./clue-model");

function buildCellGrid(crosswordModel) {
  const width = crosswordModel.width;
  const height = crosswordModel.height;
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

// Find the segment of an answer a specific letter is in.
function getAnswerSegment(answerSegments, letterIndex) {
  let remainingIndex = letterIndex;
  for (let i = 0; i < answerSegments.length; i += 1) {
    if (remainingIndex <= answerSegments[i].length) {
      return [answerSegments[i], remainingIndex];
    }
    remainingIndex -= answerSegments[i].length;
  }
  return null;
}

/**
 * **newCrosswordModel**: build a crossword model from a crossword object read from JSON.
 * - The function compiles a JSON crossword and emits diagnostic exceptions when errors are encountered.
 * @param {*} jsonCrossword the crossword object read from a JSON crossword description.
 * @returns a crossword model object
 */
function newCrosswordModel(jsonCrossword) {
  if (!jsonCrossword) {
    throw new Error(
      "The model must be initialised with a JSON crossword definition.",
    );
  }

  //  Create the basic crosswordModel structure.
  const crosswordModel = {
    width: jsonCrossword.width,
    height: jsonCrossword.height,
    acrossClues: [],
    downClues: [],
    cells: [],
  };

  //  Validate the bounds.
  if (
    crosswordModel.width === undefined ||
    crosswordModel.width === null ||
    crosswordModel.width < 0 ||
    crosswordModel.height === undefined ||
    crosswordModel.height === null ||
    crosswordModel.height < 0
  ) {
    throw new Error("The crossword bounds are invalid.");
  }

  //  Create the array of cells. Each element has a refence back to the crosswordModel
  //  for convenience.
  crosswordModel.cells = buildCellGrid(crosswordModel);

  //  We're going to go through the across clues, then the down clues.
  const jsonClues = jsonCrossword.acrossClues.concat(jsonCrossword.downClues);
  for (let c = 0; c < jsonClues.length; c += 1) {
    //  Grab the clue and build a flag letting us know if we're across or down.
    const jsonClue = jsonClues[c];
    const isAcrossClue = c < jsonCrossword.acrossClues.length;

    //  Compile the clue from the clue.
    const clueModel = newClueModel(jsonClue, isAcrossClue);

    //  Update the crosswordModel.
    crosswordModel[isAcrossClue ? "acrossClues" : "downClues"].push(clueModel);

    //  The clue position must be in the bounds.
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
    } else if (clueModel.y + clueModel.answerLength > crosswordModel.height) {
      throw new Error(`Clue ${clueModel.code} exceeds vertical bounds.`);
    }

    //  We can now mark the cells as light. If the clue has
    //  an answer (which is optional), we can validate it
    //  is coherent.
    let { x, y } = clueModel;
    for (let letter = 0; letter < clueModel.answerLength; letter += 1) {
      const cell = crosswordModel.cells[x][y];
      cell.light = true;
      cell[isAcrossClue ? "acrossClue" : "downClue"] = clueModel;
      cell[isAcrossClue ? "acrossClueLetterIndex" : "downClueLetterIndex"] =
        letter;
      clueModel.cells.push(cell);

      //  Check if we need to add an answer terminator.
      const [segment, index] = getAnswerSegment(
        clueModel.answerSegments,
        letter,
      );
      if (index === segment.length - 1 && segment.terminator !== "") {
        cell[clueModel.isAcross ? "acrossTerminator" : "downTerminator"] =
          segment.terminator;
      }

      //  If the clue has an answer we set it in the cell...
      if (clueModel.answer) {
        //  ...but only if it is not different to an existing answer.
        if (
          cell.answer !== undefined &&
          cell.answer !== " " &&
          cell.answer !== clueModel.answer[letter]
        ) {
          throw new Error(
            `Clue ${clueModel.code} answer at (${x + 1}, ${
              y + 1
            }) is not coherent with previous clue (${
              cell.acrossClue.code
            }) answer.`,
          );
        }
        cell.answer = clueModel.answer[letter];
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

  //  Now that we have constructed the full crosswordModel, we will connect the non-linear
  //  clues.
  const allClues = crosswordModel.acrossClues.concat(crosswordModel.downClues);
  allClues.forEach((clue) => {
    //  Skip clues without a connected clue.
    if (!clue.connectedDirectedClues) return;

    //  Find the connected clues.
    //  eslint-disable-next-line no-param-reassign
    clue.connectedClues = clue.connectedDirectedClues.map((cdc) => {
      if (cdc.direction === "across") {
        return crosswordModel.acrossClues.find(
          (ac) => ac.number === cdc.number,
        );
      }
      if (cdc.direction === "down") {
        return crosswordModel.downClues.find((ac) => ac.number === cdc.number);
      }
      return (
        crosswordModel.acrossClues.find((ac) => ac.number === cdc.number) ||
        crosswordModel.downClues.find((ac) => ac.number === cdc.number)
      );
    });

    //  Rebuild the answer structure text.
    //  eslint-disable-next-line no-param-reassign
    clue.answerLengthText = `(${[clue.answerLengthText]
      .concat(clue.connectedClues.map((cc) => cc.answerLengthText))
      .join(",")
      .replace(/[()]/g, "")})`;

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
      .join(",")}.`;

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

module.exports = newCrosswordModel;
