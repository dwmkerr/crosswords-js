import { first, last, trace } from './helpers.mjs';
// Parse the groups: /^numberGroup\.clueGroup\(answerGroup\)$/
const clueRegex = /^(.*?)\.(.*)\((.*?)\)$/;
// Parse numberGroup into 1+ clue segment labels
const numberGroupRegex = /^(\d+[ad]?)(,(\d+[ad]?.*))*$/;
// Parse clueGroup from surrounding whitespace
const clueGroupRegex = /^\s*(.*?)\s*$/;
// Parse answerGroup into 1+ single-word or multi-word lengths
const answerGroupRegex = /^(\d+)(([,-])(\d+.*))*$/;

const cluePattern = '<NumberText>.<ClueText>(<AnswerText>)';

//  Helper for newClueModel()
function validateClueStructure(cdClue) {
  const required = { x: 1, y: 1, clue: '1. Clue (1)' };
  const optional = { answer: '', solution: '', revealed: '' };
  const requiredKeys = Object.keys(required);
  const optionalKeys = Object.keys(optional);
  const cdKeys = Object.keys(cdClue);

  // Test for presence of required keys
  for (const rk of requiredKeys) {
    if (!cdKeys.includes(rk)) throw new Error(`'cdClue.${rk}' is missing`);
  }

  // Test for type of required keys
  for (const rk of requiredKeys) {
    if (typeof required[rk] != typeof cdClue[rk]) {
      throw new Error(
        `'cdClue.${rk} (${cdClue[rk]})' must be a ${typeof required[rk]}`,
      );
    }
  }

  // Test for presence and type of optional keys
  for (const ok of optionalKeys) {
    if (cdKeys.includes(ok) && typeof optional[ok] != typeof cdClue[ok])
      throw new Error(
        `'cdClue.${ok} (${cdClue[ok]})' must be a ${typeof optional[ok]}`,
      );
  }

  // Test for additional properties in cdClue

  const difference = new Set(cdKeys);
  for (const rk of requiredKeys) {
    difference.delete(rk);
  }
  for (const ok of optionalKeys) {
    difference.delete(ok);
  }

  if (difference.size > 0) {
    throw new Error(
      `'cdClue' has unexpected properties <${[...difference].join(',')}>`,
    );
  }

  // Test if clue text matches expected pattern
  if (!clueRegex.test(cdClue.clue)) {
    throw new Error(
      `Clue '${cdClue.clue}' does not match the required pattern '${cluePattern}'`,
    );
  }
}

//  Helper for newClueModel()
function validateClueModelArguments(cdClue, isAcrossClue) {
  if (cdClue === undefined || isAcrossClue === undefined) {
    throw new Error("'cdClue' and 'isAcrossClue' are required");
  }

  if (cdClue === null) {
    throw new Error("'cdClue' can't be null");
  }

  if (isAcrossClue === null) {
    throw new Error("'isAcrossClue' can't be null");
  }

  if (typeof isAcrossClue != 'boolean') {
    throw new Error("'isAcrossClue' must be a boolean (true,false)");
  }
}

// Helper for newClueModel()
function buildClueLabelSegments(clueLabelText, cdClue) {
  let remainingText = clueLabelText;
  let clueLabelSegments = [];
  while (numberGroupRegex.test(remainingText)) {
    // Discard leading "," before residual
    const [, labelSegment, , residual] = numberGroupRegex.exec(remainingText);
    clueLabelSegments.push(labelSegment);
    remainingText = residual;
  }

  if (remainingText != undefined) {
    throw new Error(
      `'${cdClue.clue}' Error in <numberText> near <${remainingText}>`,
    );
  }
  return clueLabelSegments;
}

// Helper for newClueModel()
function buildConnectedDirectedClues(clueLabelSegments) {
  // Helper
  function directionFromClueLabel(clueLabel) {
    if (clueLabel.endsWith('a')) {
      return 'across';
    } else if (clueLabel.endsWith('d')) {
      return 'down';
    } else {
      return null;
    }
  }

  let connectedSegments = clueLabelSegments.slice(1);
  let connectedDirectedClues = [];

  // build connected clues
  if (connectedSegments) {
    connectedDirectedClues = connectedSegments.map((cs) => ({
      number: parseInt(cs, 10),
      direction: directionFromClueLabel(cs),
    }));
  }
  return connectedDirectedClues;
}

// Helper for newClueModel()
function buildAnswerSegments(answerGroup, cdClue) {
  let answerSegments = [];
  let remainingText = answerGroup;

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
      `'${cdClue.clue}' Error in <answerText> near <${remainingText}>`,
    );
  }
  return answerSegments;
}

/**
 * Create a clue model from a clue read from a
 * _CrosswordDefinition_ [JSON](https://en.wikipedia.org/wiki/JSON) document.
 * @param cdClue - an object which defines the clue, with properties:
 * x: the zero-based grid column index of the starting letter of the clue
 * y: the zero-based grid row index of the starting letter of the clue
 * clue: the clue description string which has the format:
 *   "<Number Structure>.<Clue>(<Answer Structure>)"
 * @param isAcrossClue - a boolean indicating the clue orientation
 * @returns - the clue model for the given definition
 */
function newClueModel(cdClue, isAcrossClue) {
  // Test for null or undefined argument
  validateClueModelArguments(cdClue, isAcrossClue);
  // Test the properties and types of the cdClue argument
  validateClueStructure(cdClue);

  // Extract simple properties
  const x = cdClue.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  const y = cdClue.y - 1;

  const isAcross = isAcrossClue;
  // Initialise array of crossword grid elements - populated as part of crossword DOM
  const cells = [];
  // Initialise setter's solution for clue
  const solution = cdClue.solution
    ? // Strip out everything from solution except alphabetical characters
      // DO NOT substitute spaces
      cdClue.solution.toUpperCase().replaceAll(/[^A-Z]/g, '')
    : undefined;
  // Initialise revealed letters for clue
  const revealed = cdClue.revealed
    ? // string of upper-cased revealed characters
      cdClue.revealed.toUpperCase()
    : undefined;

  //  Get the clue components.
  const [, numberGroup, clueGroup, answerGroup] = clueRegex.exec(cdClue.clue);

  //// Parse numberGroup

  const clueLabelSegments = buildClueLabelSegments(numberGroup, cdClue);
  const connectedDirectedClues = buildConnectedDirectedClues(clueLabelSegments);

  const anchorSegment = first(clueLabelSegments);
  const number = parseInt(anchorSegment, 10);
  const clueLabel = number.toString();

  // Code is number followed by 'a' or 'd'...
  // Check last character of anchorSegment and append if required

  const code =
    anchorSegment.endsWith('a') || anchorSegment.endsWith('d')
      ? anchorSegment
      : anchorSegment + (isAcrossClue ? 'a' : 'd');

  //// Parse clueGroup

  const [, clueText] = clueGroupRegex.exec(clueGroup);

  //// Parse answerGroup

  const answerSegments = buildAnswerSegments(answerGroup, cdClue);

  //  Calculate the total length of the answer.
  const answerLength = answerSegments.reduce(
    (current, as) => current + as.length,
    0,
  );

  // trace(`cdClue.answer: <${cdClue.answer}>`);
  // Initialise punter's answer for clue
  const answer = cdClue.answer
    ? cdClue.answer
        // convert to uppercase
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

  // Combine elements into object and exit
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
