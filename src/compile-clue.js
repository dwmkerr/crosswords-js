const { first, last } = require("./helpers");

// Parse the groups: /^numberGroup\.clueGroup\(answerGroup\)$/
// const clueRegex = /^(\d+[ad]?[,\dad]*?)\.(\s*.*?\s*)\(([\d,-]+)\)$/;
const clueRegex = /^(.*?)\.(.*)\((.*?)\)$/;
// Parse numberGroup into 1+ cluesegment labels
const numberGroupRegex = /^(\d+[ad]?)(,(\d+[ad]?.*))*$/;
// Parse clueGroup from surrounding whitespace
const clueGroupRegex = /^\s*(.*?)\s*$/;
// Parse answerGroup into 1+ single-word or multi-word lengths
const answerGroupRegex = /^(\d+)(([,-])(\d+.*))*$/;

const cluePattern = "<NumberText>.<ClueText>(<AnswerText>)";

// Helper
function directionFromClueLabel(clueLabel) {
  if (/a$/.test(clueLabel)) return "across";
  if (/d$/.test(clueLabel)) return "down";
  return null;
}

/**
 * compileClue - create a clue model from a clue definition
 *
 * @param clueDefinition - an object which defines the clue, with properties:
 * x: the zero-based grid column index of the starting letter of the clue
 * y: the zero-based grid row index of the starting letter of the clue
 * clue: the clue description string which has the format:
 *   "<Number Structure>.<Clue>(<Answer Structure>)"
 * @param isAcrossClue - a boolean indicating the clue orientation
 * @returns - the clue model for the given definition
 */
function compileClue(clueDefinition, isAcrossClue) {
  function validateClueStructure(clueDefinition) {
    const required = { x: 1, y: 1, clue: "1. Clue (1)" };
    const optional = { answer: "" };
    const requiredKeys = Object.keys(required);
    const optionalKeys = Object.keys(optional);
    const cdKeys = Object.keys(clueDefinition);

    // Test for presence of required keys
    for (const requiredKey of requiredKeys) {
      if (!cdKeys.includes(requiredKey))
        throw new Error(`'clueDefinition.${requiredKey}' is missing`);
    }

    // Test for type of required keys
    for (const key of requiredKeys) {
      if (typeof required[key] != typeof clueDefinition[key]) {
        throw new Error(
          `'clueDefinition.${key} (${
            clueDefinition[key]
          })' must be a ${typeof required[key]}`,
        );
      }
    }

    // Test for presence and type of optional keys
    for (const key of optionalKeys) {
      if (
        cdKeys.includes(key) &&
        typeof optional[key] != typeof clueDefinition[key]
      )
        throw new Error(
          `'clueDefinition.${key} (${
            clueDefinition[key]
          })' must be a ${typeof optional[key]}`,
        );
    }

    // Test for additional properties in clueDefinition

    const difference = new Set(cdKeys);
    for (const requiredKey of requiredKeys) {
      difference.delete(requiredKey);
    }
    for (const optionalKey of optionalKeys) {
      difference.delete(optionalKey);
    }

    if (difference.size > 0) {
      throw new Error(
        `'clueDefinition' has unexpected properties <${[...difference].join(
          ",",
        )}>`,
      );
    }
  }

  // Test for null or undefined argument

  if (clueDefinition === undefined || isAcrossClue === undefined) {
    throw new Error("'clueDefinition' and 'isAcrossClue' are required");
  }

  if (clueDefinition === null) {
    throw new Error("'clueDefinition' can't be null");
  }

  if (isAcrossClue === null) {
    throw new Error("'isAcrossClue' can't be null");
  }

  if (typeof isAcrossClue != "boolean") {
    throw new Error("'isAcrossClue' must be a boolean (true,false)");
  }

  // Test the properties and types of the clueDefinition argument
  validateClueStructure(clueDefinition);

  // Test if clue text matches expected pattern
  if (!clueRegex.test(clueDefinition.clue)) {
    throw new Error(
      `Clue '${clueDefinition.clue}' does not match the required pattern '${cluePattern}'`,
    );
  }

  // Extract simple properties
  const x = clueDefinition.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  const y = clueDefinition.y - 1;

  // Initialise array of crossword grid elements - populated as part of crossword DOM
  const cells = [];
  // Initialise user's answer for clue
  const answer = clueDefinition.answer;

  //  Get the clue components.
  const [, numberGroup, clueGroup, answerGroup] = clueRegex.exec(
    clueDefinition.clue,
  );

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
      `'${clueDefinition.clue}' Error in <numberText> near <${remainingText}>`,
    );
  }

  const anchorSegment = first(clueLabelSegments);
  const number = parseInt(anchorSegment, 10);
  const clueLabel = number.toString();
  // Code is number followed by 'a' or 'd'...
  // Check last character of anchorSegment and append if required
  const code = "ad".includes(last(anchorSegment))
    ? anchorSegment
    : anchorSegment + (isAcrossClue ? "a" : "d");

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
      terminator: terminator ?? "",
    });
    remainingText = residual;
  }

  if (remainingText != undefined) {
    throw new Error(
      `'${clueDefinition.clue}' Error in <answerText> near <${remainingText}>`,
    );
  }

  //  Calculate the total length of the answer.
  const answerLength = answerSegments.reduce(
    (current, as) => current + as.length,
    0,
  );

  //  Also create the answer segments as text.
  const answerLengthText = `(${answerGroup})`;

  return {
    isAcrossClue,
    answer,
    answerLength,
    answerSegments,
    answerLengthText,
    cells,
    clueLabel,
    clueText,
    code,
    connectedDirectedClues,
    number,
    x,
    y,
  };
}

module.exports = { compileClue, cluePattern };
