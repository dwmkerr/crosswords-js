import yaml from 'js-yaml';
import { newClueModel } from './clue-model.mjs';
import { assert, setLetter, trace } from './helpers.mjs';

/**
 * **newCrosswordModel**: build a crossword model from a crosswordDefinition object.
 * - The function compiles a JSON crossword and emits diagnostic exceptions when errors are encountered.
 * @param {*} crosswordDefinition A javascript Object typically parsed or imported from a crossword description file in JSON or YAML format.
 * @returns a crossword model object
 */
function newCrosswordModel(crosswordDefinition) {
  trace('newCrosswordModel');

  if (!validateCrosswordDefinition(crosswordDefinition)) {
    trace(
      'newCrosswordModel: The model must be initialised with a valid crossword definition.',
      `error`,
    );
    return null;
  }

  //  Create the basic crosswordModel structure.
  let crosswordModel = initialiseCrosswordModel(crosswordDefinition);
  //  Create the array of cells. Each element has a reference back to the crosswordModel
  //  for convenience.
  crosswordModel.cells = buildCellGrid(crosswordModel);

  //  Add all the crosswordDefinition clues to the crosswordModel.
  const isAcross = /across/i;
  ['acrossClues', 'downClues'].forEach((clues) => {
    crosswordDefinition[clues].forEach(
      addClueToModel(crosswordModel, isAcross.test(clues)),
    );
  });

  //  Process any multi-segment clues.
  [...crosswordModel.acrossClues, ...crosswordModel.downClues].forEach(
    addMultiSegmentProperties(crosswordModel),
  );

  // Assign lightCells property
  crosswordModel.lightCells = crosswordModel.cells
    .flat()
    .filter((cell) => cell.light);

  // Assign headSegment (array) properties to model's acrossClues and downClues arrays.
  ['acrossClues', 'downClues'].forEach((clues) => {
    crosswordModel[clues].headSegments = crosswordModel[clues].filter(
      (c) => c === c.headSegment,
    );
  });

  return crosswordModel;
}

// Helper for newCrosswordModel()
function buildCellGrid(crosswordModel) {
  const { width } = crosswordModel;
  const { height } = crosswordModel;
  const array = new Array(width);
  for (let x = 0; x < width; x += 1) {
    array[x] = new Array(height);
    for (let y = 0; y < height; y += 1) {
      // assign cell object
      array[x][y] = {
        model: crosswordModel,
        x,
        y,
        toString: () => {
          return `${x},${y}`;
        },
      };
    }
  }
  return array;
}

// Helper for newCrosswordModel()
/**
 * Is the character at letterIndex the last letter of a non-terminal
 * word in a multi-word sequence?
 * @param {*} letterIndex
 * @param {*} wordLengths array of word lengths
 * @returns boolean
 */
function isWordSeparatorIndex(letterIndex, wordLengths) {
  if (letterIndex >= 0) {
    let remainingIndex = letterIndex;
    let index = 0;
    while (index < wordLengths.length) {
      const wl = wordLengths[index];
      if (remainingIndex < wl) {
        return (
          // is a word terminator
          remainingIndex === wl - 1 &&
          //  is not last word
          index !== wordLengths.length - 1
        );
      } else {
        remainingIndex -= wl;
        index += 1;
      }
    }
  }
  return false;
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
function validateCrosswordDefinition(crosswordDefinition) {
  const versionRegex = /^1\.0$/;

  function error(message) {
    trace(`validateCrosswordDefinition: ${message}`, 'error');
    return false;
  }
  function normalise(text) {
    return text.toString().trim().toLowerCase();
  }

  const cd = crosswordDefinition;

  // Test supplied arguments

  if (!cd) {
    return error('[crosswordDefinition] argument is undefined or null');
  }

  // Test for document element
  else if (!cd.document) {
    return error('Missing "document" element');
  }
  // Test for document.mimetype element
  else if (!cd.document?.mimetype) {
    return error('Missing "document.mimetype" element');
  } else {
    const mimeType = normalise(cd.document.mimetype);

    // Test for valid mimetype

    if (mimeType !== 'application/vnd.js-crossword') {
      return error(
        `Unsupported "document.mimetype" (${mimeType}) Expected: application/vnd.js-crossword`,
      );
    }
    // Test for document.version element
    else if (!cd.document?.version) {
      return error('Missing "document.mimetype" element');
    }

    // Test for supported version
    else {
      const version = normalise(cd.document.version);

      // Final test!
      return versionRegex.test(version)
        ? true
        : error(`Unsupported document version (${version}) Expected: 1.0`);
    }
  }
}

// Helper for newCrosswordModel()
function validateClueInCrossword(clueModel, crosswordModel, isAcrossClue) {
  if (
    clueModel.x < 0 ||
    clueModel.x >= crosswordModel.width ||
    clueModel.y < 0 ||
    clueModel.y >= crosswordModel.height
  ) {
    throw new Error(`Clue ${clueModel} doesn't start in the bounds.`);
  }

  //  Make sure the clue is not too long.
  if (isAcrossClue) {
    if (clueModel.x + clueModel.segmentLength > crosswordModel.width) {
      throw new Error(`Clue ${clueModel} exceeds horizontal bounds.`);
    }
    // down clue
  } else if (clueModel.y + clueModel.segmentLength > crosswordModel.height) {
    throw new Error(`Clue ${clueModel} exceeds vertical bounds.`);
  }
}

// Helper for newCrosswordModel()
function updateOrthogonalClueAnswer(cell, answer, isAcrossClue) {
  //  eslint-disable-next-line no-param-reassign

  //  We need to update the answers
  if (!isAcrossClue && cell.acrossClue) {
    //  eslint-disable-next-line no-param-reassign
    cell.acrossClue.answer = setLetter(
      cell.acrossClue.answer,
      cell.acrossClueLetterIndex,
      answer,
    );
  }
  if (isAcrossClue && cell.downClue) {
    //  eslint-disable-next-line no-param-reassign
    cell.downClue.answer = setLetter(
      cell.downClue.answer,
      cell.downClueLetterIndex,
      answer,
    );
  }
}

// Curried function returns a function to map a tailSegmentDescriptor to its clueModel (clue)
const tailDescriptorConverter = (crosswordModel) => {
  return (tailDescriptor) => {
    const cm = crosswordModel;
    const td = tailDescriptor;
    const hn = td.headNumber;

    switch (td.direction) {
      case 'across':
        // non-terminal
        return cm.acrossClues.find((ac) => ac.headNumber === hn);
      case 'down':
        // non-terminal
        return cm.downClues.find((dc) => dc.headNumber === hn);
      default:
        // terminal (direction === null)
        return (
          cm.acrossClues.find((ac) => ac.headNumber === hn) ||
          cm.downClues.find((dc) => dc.headNumber === hn)
        );
    }
  };
};

// Curried function returns a function to add a crosswordDefinition clue to a crosswordModel
function addClueToModel(crosswordModel, isAcrossClue) {
  return (cdClue) => {
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
    for (
      let letterIndex = 0;
      letterIndex < clueModel.segmentLength;
      letterIndex += 1
    ) {
      const cell = crosswordModel.cells[x][y];
      cell.light = true;
      cell[isAcrossClue ? 'acrossClue' : 'downClue'] = clueModel;
      cell[isAcrossClue ? 'acrossClueLetterIndex' : 'downClueLetterIndex'] =
        letterIndex;
      clueModel.cells.push(cell);

      //  Check if we need to add a word separator to the grid cell.
      if (isWordSeparatorIndex(letterIndex, clueModel.wordLengths)) {
        cell[clueModel.isAcross ? 'acrossTerminator' : 'downTerminator'] = true;
      }

      //  If the imported clue has an answer we set it in the cell...
      setCellAnswer(cell, clueModel, letterIndex, cdClue.answer, isAcrossClue);
      //  If the imported clue has a solution we set it in the cell...
      setCellSolution(cell, clueModel, letterIndex, cdClue.solution);
      //  //  Set label for first cell, and check against existing value
      setCellLabel(letterIndex, cell, clueModel);

      if (isAcrossClue) {
        x += 1;
      } else {
        y += 1;
      }
    }
  };
}

function setCellLabel(letterIndex, cell, clueModel) {
  if (letterIndex === 0) {
    if (cell.labelText && cell.labelText !== clueModel.headNumber) {
      throw new Error(
        `Clue ${clueModel} has a label which is inconsistent with another clue (${cell.acrossClue}).`,
      );
    }
    // eslint-disable-next-line no-param-reassign
    cell.labelText = clueModel.headNumber;
  }
}

// Curried function returns a function to add multi-segment properties to a clueModel
function addMultiSegmentProperties(crosswordModel) {
  return (cmClue) => {
    //  Find the connected clues. Pass curried iterator function
    //  eslint-disable-next-line no-param-reassign
    cmClue.tailSegments = cmClue.tailDescriptors.map(
      tailDescriptorConverter(crosswordModel),
    );

    //  Rebuild the lengthText.
    //  For head clue segments, it will be the aggregate of the multi-word descriptors for each segment.
    //  For tail clue segments, it will be the multi-word descriptors for itself (no change).
    const multiSegmentLengths = [
      ...cmClue.wordLengths,
      ...cmClue.tailSegments.flatMap((ts) => ts.wordLengths),
    ];
    //  eslint-disable-next-line no-param-reassign
    cmClue.lengthText = `(${multiSegmentLengths})`;

    //  Each clue should know its head segment as well as the next and
    //  previous clue segments.
    let clueSegmentIndex = 0;
    const clueSegments = [cmClue, ...cmClue.tailSegments];

    clueSegments.forEach((cs) => {
      //  Set the head segment for _each_ clue segment via destructuring.
      //  Note that the head segment for a one-segment clue is itself.
      //  eslint-disable-next-line no-param-reassign
      [cs.headSegment] = clueSegments;

      // Assign previousClueSegment (all except first)
      if (clueSegmentIndex > 0) {
        //  eslint-disable-next-line no-param-reassign
        cs.previousClueSegment = clueSegments[clueSegmentIndex - 1];
      }

      // Assign nextClueSegment (all except last)
      if (clueSegmentIndex < clueSegments.length - 1) {
        //  eslint-disable-next-line no-param-reassign
        cs.nextClueSegment = clueSegments[clueSegmentIndex + 1];
      }
      clueSegmentIndex += 1;
    });

    // Assign flatCells property to head segment
    clueSegments[0].flatCells =
      clueSegments.length === 1
        ? clueSegments[0].cells
        : // Remove duplicates from intersecting multiple segments by constructing a set
          new Set(clueSegments.flatMap((cs) => cs.cells));

    //  Rewrite the clue label.
    //  Head clues will get a comma-separated list of connected segments.
    //  eslint-disable-next-line no-param-reassign
    cmClue.labelText = `${[cmClue.headNumber]
      .concat(cmClue.tailSegments.map((ts) => ts.headNumber))
      .join(',')}.`;

    //  The tail clues have no lengthText
    cmClue.tailSegments.forEach((ts) => {
      //  eslint-disable-next-line no-param-reassign
      ts.lengthText = '';
    });
  };
}

/**
 * **convertSourceFileToDefinition** build a _crosswordDefinition_ from a YAML or JSON file.
 * @param {*} mimeType The [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) type of the
 * _documentText_: `application/json` or `application/yaml`
 * @param {*} crosswordSourcePath system file path to a JSON or YAML crosswordSource.
 * @returns {*} a crosswordDefinition Object on successful conversion, or null.
 *
 * > NOTE: This function can't be called from client/browser code.
 * > Local file system access is typically not allowed in that context.
 */
function convertSourceFileToDefinition(mimeType, crosswordSourcePath) {
  assert(fileExists(crosswordSourcePath));
  const crosswordSource = readFileSync(crosswordSourcePath, {
    encoding: 'utf8',
    flag: 'r',
  });

  return newCrosswordDefinition(mimeType, crosswordSource.toString());
}

// Helper function to build a CrosswordDefinition

/**
 * **newCrosswordDefinition** build a _crosswordDefinition_ from a _crosswordSource_ in JSON or YAML format.
 * @param {*} mimeType The [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) type of the
 * _documentText_, `application/json` or `application/yaml`
 * @param {*} crosswordSource a structured text description of a crossword puzzle in _mimeType_ format.
 * @returns {*} a crosswordDefinition object on successful conversion, or null.
 */
function newCrosswordDefinition(mimeType, crosswordSource) {
  let parsedDocument;
  switch (mimeType.trim().toLowerCase()) {
    case 'application/json':
      try {
        parsedDocument = JSON.parse(crosswordSource);
      } catch (error) {
        trace(
          `newCrosswordDefinition: [documentText] is not a simple JSON object.\n` +
            `Error: ${error.message}\n`,
          `error`,
        );
        return null;
      }
      break;
    case 'application/yaml':
    case 'application/x-yaml':
      try {
        parsedDocument = yaml.load(crosswordSource);
      } catch (error) {
        trace(
          `newCrosswordDefinition: [documentText] is not a YAML object.\n` +
            `Error: ${error.message}\n`,
          `error`,
        );
        return null;
      }
      break;
    default:
      trace(
        `newCrosswordDefinition: Unsupported file type: (${mimeType})`,
        'error',
      );
      return null;
  }
  return validateCrosswordDefinition(parsedDocument) ? parsedDocument : null;
}

function propertyErrorText(clueModel, cell, letterIndex, property) {
  const gridCoords = `(${clueModel.x + 1},${clueModel.y + 1})`;
  const propVal = `[${clueModel[property]}[${letterIndex + 1}],${
    clueModel[property][letterIndex]
  }]`;
  const prevClue = `(${cell.acrossClue})`;
  const prevVal = `[${cell.acrossClue[property]},${cell[property]}]`;

  return (
    `Clue ${clueModel} ${property} at ${gridCoords} ${propVal} is not coherent` +
    ` with previous clue ${prevClue} ${property} ${prevVal}.`
  );
}

// Helper function to set solution letter in a cell
function setCellSolution(cell, clueModel, letterIndex, clueSolution) {
  const cellDefaultSolution = ' ';

  if (clueSolution) {
    //  ...set solution only if it is NOT different to an existing solution.
    if (
      cell.solution &&
      // We can overwrite any cells that have the default value
      cell.solution !== cellDefaultSolution &&
      cell.solution !== clueModel.solution[letterIndex]
    ) {
      throw new Error(
        propertyErrorText(clueModel, cell, letterIndex, 'solution'),
      );
    } else {
      // if (cell.solution && cell.solution !== ' '
      // eslint-disable-next-line no-param-reassign
      cell.solution = clueModel.solution[letterIndex];
    }
  } else {
    // eslint-disable-next-line no-param-reassign
    cell.solution = cellDefaultSolution;
  }
}

// Helper function to set answer letter in a cell
function setCellAnswer(cell, clueModel, letterIndex, clueAnswer, isAcrossClue) {
  const cellDefaultAnswer = ' ';

  if (clueAnswer) {
    const clueAnswerLetter = clueModel.answer[letterIndex];

    //  ...but only if it is not different to an existing answer.
    if (
      cell.answer &&
      // We can overwrite any cells that have default value
      cell.answer !== cellDefaultAnswer &&
      cell.answer !== clueAnswerLetter
    ) {
      throw new Error(
        propertyErrorText(clueModel, cell, letterIndex, 'answer'),
      );
    }
    // if cell.answer && cell.answer !== ' '
    // eslint-disable-next-line no-param-reassign
    cell.answer = clueAnswerLetter;
    // check if cell appears in a clue in the other direction
    updateOrthogonalClueAnswer(cell, cell.answer, isAcrossClue);
  }

  // No answer in imported clue, insert default if cell is vacant.
  // Don't clobber an existing value
  else if (!cell.answer) {
    // eslint-disable-next-line no-param-reassign
    cell.answer = cellDefaultAnswer;
  }
}

export {
  convertSourceFileToDefinition,
  isWordSeparatorIndex,
  newCrosswordDefinition,
  newCrosswordModel,
};
