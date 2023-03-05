//  This is the main regex which rips apart a clue into a number, clue and
//  answer structure.
// 
// There are no leading characters allowed
// 
// The number is evaluated as: ^(\d+),?([\dad,]*)
//   - one or more digits
//   - followed by an optional comma
//   - followed by an optional additional segment group: [\dad,]*
//      - zero or more of any of (digit,'a','d',',')
//
// Followed by any character (typically a period '.')
// Followed by zero or more whitespace
//
// The clue is evaluated as: .*
//   - a sequence of zero or more (non-whitespace) characters
//   
// Followed by zero or more whitespace
// Followed by an opening parenthesis '('
//
// The answer structure is evaluated as: [\d,-]+
//   - a sequence of one or more of any of (digit,'-')
//
// Followed by a closing parenthesis ')'
// There are no trailing characters allowed   

// For a single segment clue
const clueRegex = /^(\d+),?([\dad,]*).[\s]*(.*)[\s]*\(([\d,-]+)\)$/;
const missing = [undefined, null];
function directionFromClueLabel(clueLabel) {
  if (/a$/.test(clueLabel)) return "across";
  if (/d$/.test(clueLabel)) return "down";
  return null;
}

/**
 * compileClue - create a clue model from a clue defintion
 *
 * @param clueDefinition - a string which defines the clue, in the format:
 *   "<Number>. <Clue> (<Answer Structure>)"
 * @param isAcrossClue - a boolean indicating the clue orientation
 * @returns - the clue model for the given defintion
 */
function compileClue(clueDefinition, isAcrossClue) {
  function validateClueStructure(clueDefinition) {
    const valid = { x: 1, y: 1, clue: "1. Clue (1)" };
    const validKeys = Object.keys(valid);
    const cdKeys = Object.keys(clueDefinition);

    for (const validKey of validKeys) {
      if (!cdKeys.includes(validKey))
        throw new Error(`'clueDefinition.${validKey}' property is missing`);
    }

    for (const key of validKeys) {
      if (typeof valid[key] != typeof clueDefinition[key]) {
        throw new Error(
          `'clueDefinition.${key}' must have type <${typeof valid[key]}>`,
        );
      }
    }
 
    // check for additional properties in clueDefinition
    const difference = new Set(cdKeys);
    for (const validKey of validKeys) {
      difference.delete(validKey);
    }

    if (difference.size > 0) {
      throw new Error(
        `'clueDefinition' has unexpected properties <${[...difference].join(',')}>`,
      );
    }
  }
  // test for null or undefined argument
  if (clueDefinition === undefined || isAcrossClue === undefined) {
    throw new Error("'clueDefinition' and 'isAcrossClue' are required");
  }

  if (clueDefinition === null) {
    throw new Error("'clueDefinition' can't be null");
  }

  //  validate isAcrossClue.
  if (isAcrossClue === null) {
    throw new Error("'isAcrossClue' can't be null");
  }

  //  validate isAcrossClue.
  if (typeof isAcrossClue != "boolean") {
    throw new Error("'isAcrossClue' must be a boolean (true,false)");
  }

  validateClueStructure(clueDefinition);

  if (!clueRegex.test(clueDefinition.clue)) {
    throw new Error(
      `Clue '${clueDefinition.clue}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`,
    );
  }

  //  Get the clue components.

  const [, numberText, connectedCluesText, clueText, answerText] =
    clueRegex.exec(clueDefinition.clue);
  const number = parseInt(numberText, 10);
  const code = number + (isAcrossClue ? "a" : "d");
  const x = clueDefinition.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  const y = clueDefinition.y - 1;
  const cells = [];
  const clueLabel = `${number}`;
  const answer = answerText;

  //  If we have connected clues, break them apart.
  let connectedClueNumbers = null;
  if (connectedCluesText) {
    connectedClueNumbers = connectedCluesText.split(",").map((cc) => ({
      number: parseInt(cc, 10),
      direction: directionFromClueLabel(cc),
    }));
  }

  //  Now we can start to break up the answer segments.
  const answerStructure = [];
  const answerSegmentRegex = /([\d]+)([,-]?)(.*)/;
  let remainingAnswerStructure = answerText;
  while (answerSegmentRegex.test(remainingAnswerStructure)) {
    const [, length, terminator, rest] = answerSegmentRegex.exec(
      remainingAnswerStructure,
    );
    answerStructure.push({ length: parseInt(length, 10), terminator });
    remainingAnswerStructure = rest;
  }

  //  Calculate the total length of the answer.
  const totalLength = answerStructure.reduce(
    (current, as) => current + as.length,
    0,
  );

  //  Also create the answer structure as text.
  const answerStructureText = `(${answerStructure
    .map((as) => `${as.length}${as.terminator}`)
    .join("")})`;

  return {
    isAcrossClue,
    answer,
    answerStructure,
    answerStructureText,
    cells,
    clueLabel,
    clueText,
    code,
    connectedClueNumbers,
    number,
    totalLength,
    x,
    y,
  };
}

module.exports = compileClue;
