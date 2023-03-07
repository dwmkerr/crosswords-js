const { compileClue } = require("./compile-clue");

function buildCellArray2D(crosswordModel) {
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

//  The crossword class. When a crossword is built from a definition
//  and options, this is the object which is returned.
function compileCrossword(crosswordDefinition) {
  if (!crosswordDefinition) {
    throw new Error(
      "The Crossword must be initialised with a crossword definition.",
    );
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
  if (
    model.width === undefined ||
    model.width === null ||
    model.width < 0 ||
    model.height === undefined ||
    model.height === null ||
    model.height < 0
  ) {
    throw new Error("The crossword bounds are invalid.");
  }

  //  Create the array of cells. Each element has a refence back to the model
  //  for convenience.
  model.cells = buildCellArray2D(model);

  //  We're going to go through the across clues, then the down clues.
  const clueDefinitions = crosswordDefinition.acrossClues.concat(
    crosswordDefinition.downClues,
  );
  for (let c = 0; c < clueDefinitions.length; c += 1) {
    //  Grab the clue and build a flag letting us know if we're across or down.
    const clueDefinition = clueDefinitions[c];
    const across = c < crosswordDefinition.acrossClues.length;

    //  Compile the clue from the clue model.
    const clueModel = compileClue(clueDefinition, across);

    //  Update the clue model.
    model[across ? "acrossClues" : "downClues"].push(clueModel);

    //  The clue position must be in the bounds.
    if (
      clueModel.x < 0 ||
      clueModel.x >= model.width ||
      clueModel.y < 0 ||
      clueModel.y >= model.height
    ) {
      throw new Error(`Clue ${clueModel.code} doesn't start in the bounds.`);
    }

    //  Make sure the clue is not too long.
    if (across) {
      if (clueModel.x + clueModel.answerLength > model.width) {
        throw new Error(`Clue ${clueModel.code} exceeds horizontal bounds.`);
      }
    } else if (clueModel.y + clueModel.answerLength > model.height) {
      throw new Error(`Clue ${clueModel.code} exceeds vertical bounds.`);
    }

    //  We can now mark the cells as light. If the clue has
    //  an answer (which is optional), we can validate it
    //  is coherent.
    let { x, y } = clueModel;
    for (let letter = 0; letter < clueModel.answerLength; letter += 1) {
      const cell = model.cells[x][y];
      cell.light = true;
      cell[across ? "acrossClue" : "downClue"] = clueModel;
      cell[across ? "acrossClueLetterIndex" : "downClueLetterIndex"] = letter;
      clueModel.cells.push(cell);

      //  Check if we need to add an answer terminator.
      const [segment, index] = getAnswerSegment(
        clueModel.answerSegments,
        letter,
      );
      if (index === segment.length - 1 && segment.terminator !== "") {
        cell[clueModel.across ? "acrossTerminator" : "downTerminator"] =
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

      if (across) {
        x += 1;
      } else {
        y += 1;
      }
    }
  }

  //  Now that we have constructed the full model, we will connect the non-linear
  //  clues.
  const allClues = model.acrossClues.concat(model.downClues);
  allClues.forEach((clue) => {
    //  Skip clues without a connected clue.
    if (!clue.connectedDirectedClues) return;

    //  Find the connected clues.
    clue.connectedClues = clue.connectedDirectedClues.map((cdc) => {
      if (cdc.direction === "across") {
        return model.acrossClues.find((ac) => ac.number === cdc.number);
      }
      if (cdc.direction === "down") {
        return model.downClues.find((ac) => ac.number === cdc.number);
      }
      return (
        model.acrossClues.find((ac) => ac.number === cdc.number) ||
        model.downClues.find((ac) => ac.number === cdc.number)
      );
    });

    //  Rebuild the answer structure text.
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
        cs.previousClueSegment = clueSegments[clueSegmentIndex - 1];
      }
      if (clueSegmentIndex < clueSegments.length - 1) {
        cs.nextClueSegment = clueSegments[clueSegmentIndex + 1];
      }
      [cs.parentClue] = clueSegments;
      clueSegmentIndex += 1;
    });

    //  Create the master clue label.
    clue.clueLabel = `${[clue.number]
      .concat(clue.connectedClues.map((cc) => cc.number))
      .join(",")}.`;

    //  The connected clues need no answer structure, an indicator they are
    //  connected clues and a back link to the master clue.
    clue.connectedClues.forEach((cc) => {
      cc.answerLengthText = null; // we just show the answer structure for the first clue
      cc.isConnectedClue = true; // makes it easier to render these clues differently
    });
  });

  return model;
}

module.exports = compileCrossword;
