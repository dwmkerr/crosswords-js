import { first, last, trace } from './helpers.mjs';
// Parse the groups: /^numberGroup\.clueGroup\(answerGroup\)$/
// const clueRegex = /^(\d+[ad]?[,\dad]*?)\.(\s*.*?\s*)\(([\d,-]+)\)$/;
const clueRegex = /^(.*?)\.(.*)\((.*?)\)$/;
// Parse numberGroup into 1+ clue segment labels
const numberGroupRegex = /^(\d+[ad]?)(,(\d+[ad]?.*))*$/;
// Parse clueGroup from surrounding whitespace
const clueGroupRegex = /^\s*(.*?)\s*$/;
// Parse answerGroup into 1+ single-word or multi-word lengths
const answerGroupRegex = /^(\d+)(([,-])(\d+.*))*$/;

const cluePattern = '<NumberText>.<ClueText>(<AnswerText>)';

// Helper
function directionFromClueLabel(clueLabel) {
  if (/a$/.test(clueLabel)) return 'across';
  if (/d$/.test(clueLabel)) return 'down';
  return null;
}

/**
 * compileClue - create a clue model from a clue read
 * from a _CrosswordDefinition_ [JSON](https://en.wikipedia.org/wiki/JSON) document.
 *
 * @param jsonClue - an object which defines the clue, with properties:
 * x: the zero-based grid column index of the starting letter of the clue
 * y: the zero-based grid row index of the starting letter of the clue
 * clue: the clue description string which has the format:
 *   "<Number Structure>.<Clue>(<Answer Structure>)"
 * @param isAcrossClue - a boolean indicating the clue orientation
 * @returns - the clue model for the given definition
 */
function newClueModel(jsonClue, isAcrossClue) {
  function validateClueStructure(jsonClue) {
    const required = { x: 1, y: 1, clue: '1. Clue (1)' };
    const optional = { answer: '', solution: '', revealed: '' };
    const requiredKeys = Object.keys(required);
    const optionalKeys = Object.keys(optional);
    const cdKeys = Object.keys(jsonClue);

    // Test for presence of required keys
    for (const requiredKey of requiredKeys) {
      if (!cdKeys.includes(requiredKey))
        throw new Error(`'jsonClue.${requiredKey}' is missing`);
    }

    // Test for type of required keys
    for (const key of requiredKeys) {
      if (typeof required[key] != typeof jsonClue[key]) {
        throw new Error(
          `'jsonClue.${key} (${jsonClue[key]})' must be a ${typeof required[
            key
          ]}`,
        );
      }
    }

    // Test for presence and type of optional keys
    for (const key of optionalKeys) {
      if (cdKeys.includes(key) && typeof optional[key] != typeof jsonClue[key])
        throw new Error(
          `'jsonClue.${key} (${jsonClue[key]})' must be a ${typeof optional[
            key
          ]}`,
        );
    }

    // Test for additional properties in jsonClue

    const difference = new Set(cdKeys);
    for (const requiredKey of requiredKeys) {
      difference.delete(requiredKey);
    }
    for (const optionalKey of optionalKeys) {
      difference.delete(optionalKey);
    }

    if (difference.size > 0) {
      throw new Error(
        `'jsonClue' has unexpected properties <${[...difference].join(',')}>`,
      );
    }
  }

  // Test for null or undefined argument

  if (jsonClue === undefined || isAcrossClue === undefined) {
    throw new Error("'jsonClue' and 'isAcrossClue' are required");
  }

  if (jsonClue === null) {
    throw new Error("'jsonClue' can't be null");
  }

  if (isAcrossClue === null) {
    throw new Error("'isAcrossClue' can't be null");
  }

  if (typeof isAcrossClue != 'boolean') {
    throw new Error("'isAcrossClue' must be a boolean (true,false)");
  }

  // Test the properties and types of the jsonClue argument
  validateClueStructure(jsonClue);

  // Test if clue text matches expected pattern
  if (!clueRegex.test(jsonClue.clue)) {
    throw new Error(
      `Clue '${jsonClue.clue}' does not match the required pattern '${cluePattern}'`,
    );
  }

  // Extract simple properties
  const x = jsonClue.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  const y = jsonClue.y - 1;

  const isAcross = isAcrossClue;
  // Initialise array of crossword grid elements - populated as part of crossword DOM
  const cells = [];
  // Initialise setter's solution for clue
  const solution = jsonClue.solution
    ? // Strip out everything from solution except spaces and alphabetical characters
      // DO NOT substitute spaces
      jsonClue.solution.toUpperCase().replaceAll(/[^A-Z]/g, '')
    : undefined;
  // Initialise revealed letters for clue
  const revealed = jsonClue.revealed
    ? // strip out everything from revealed except alphabetical characters
      jsonClue.revealed.toUpperCase()
    : undefined;

  //  Get the clue components.
  const [, numberGroup, clueGroup, answerGroup] = clueRegex.exec(jsonClue.clue);

  //// Parse numberGroup

  let clueLabelSegments = [],
    connectedDirectedClues = [],
    remainingText = numberGroup;

  while (numberGroupRegex.test(remainingText)) {
    const [, labelSegment, , residual] = numberGroupRegex.exec(remainingText);
    clueLabelSegments.push(labelSegment);
    // Trim leading ',' from residual
    remainingText = residual;
  }

  if (remainingText != undefined) {
    throw new Error(
      `'${jsonClue.clue}' Error in <numberText> near <${remainingText}>`,
    );
  }

  const anchorSegment = first(clueLabelSegments);
  const number = parseInt(anchorSegment, 10);
  const clueLabel = number.toString();
  // Code is number followed by 'a' or 'd'...
  // Check last character of anchorSegment and append if required
  const code = 'ad'.includes(last(anchorSegment))
    ? anchorSegment
    : anchorSegment + (isAcrossClue ? 'a' : 'd');

  //  Trim off anchor segment
  let connectedSegments = clueLabelSegments.slice(1);
  // build connected clues
  if (connectedSegments) {
    connectedDirectedClues = connectedSegments.map((cs) => ({
      number: parseInt(cs, 10),
      direction: directionFromClueLabel(cs),
    }));
  }

  //// Parse clueGroup

  const [, clueText] = clueGroupRegex.exec(clueGroup);

  //// Parse answerGroup

  let answerSegments = [];
  remainingText = answerGroup;
  while (answerGroupRegex.test(remainingText)) {
    const [, length, , terminator, residual] =
      answerGroupRegex.exec(remainingText);
    answerSegments.push({
      length: parseInt(length, 10),
      terminator: terminator ?? '',
    });
    remainingText = residual;
  }

  if (remainingText != undefined) {
    throw new Error(
      `'${jsonClue.clue}' Error in <answerText> near <${remainingText}>`,
    );
  }

  //  Calculate the total length of the answer.
  const answerLength = answerSegments.reduce(
    (current, as) => current + as.length,
    0,
  );

  // trace(`jsonClue.answer: <${jsonClue.answer}>`);
  // Initialise punter's answer for clue
  const answer = jsonClue.answer
    ? jsonClue.answer
        // convert to uppercase and pad out to answerLength with spaces
        .toUpperCase()
        // replace illegal characters with spaces
        .replaceAll(/[^ A-Z]/g, ' ')
        // pad out if required
        .padEnd(answerLength)
    : // pad out null or undefined answer with spaces
      ''.padEnd(answerLength);
  // trace(`newClueModel: answer:<${answer}> solution:<${solution}>`);

  //  Also create the answer segments as text.
  const answerLengthText = `(${answerGroup})`;

  // Test if clue solution length matches answerLength
  if (solution && solution.length !== answerLength) {
    throw new Error(
      `Length of clue solution '${solution}' does not match the answer length '${answerLengthText}'`,
    );
  }

  // Test if clue revealed length matches answerLength
  if (revealed && revealed.length !== answerLength) {
    throw new Error(
      `Length of clue revealed characters '${revealed}' does not match the answer length: ${answerLength}`,
    );
  }

  return {
    answer,
    answerLength,
    answerLengthText,
    answerSegments,
    cells,
    clueLabel,
    clueText,
    code,
    connectedDirectedClues,
    isAcross,
    number,
    revealed,
    solution,
    x,
    y,
  };
}

export { newClueModel, cluePattern };
