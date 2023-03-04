//  This is the main regex which rips apart a clue into a number, clue and
//  answer structure.
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
  function isClueDefinition(clueDefinition) {
    const valid = { x: 1, y: 1, clue: "1. Clue (1)" };
    const validKeys = Object.keys(valid);
    const cdKeys = Object.keys(clueDefinition);

    if (
      // check all required properties of valid are in clueDefinition
      validKeys.every((x) => cdKeys.includes(x)) &&
      // exclude clueDefinition with additional properties
      cdKeys.length == validKeys.length
    ) {
      // check the type of each property matches
      for (const key of validKeys) {
        if (typeof valid[key] != typeof clueDefinition[key]) return false;
      }
    } else {
      return false;
    }

    return true;
  }
  // test for null or undefined argument
  if (clueDefinition === undefined || isAcrossClue === undefined) {
    throw new Error("'clueDefinition' and 'isAcrossClue' are required");
  }

  if (clueDefinition === null) {
    throw new Error("'clueDefinition' can't be null");
  }

  if (!isClueDefinition(clueDefinition)) {
    throw new Error("'clueDefinition' is malformed");
  }

  //  validate isAcrossClue.
  if (typeof isAcrossClue != "boolean") {
    throw new Error("'isAcrossClue' must be a boolean");
  }

  if (!clueRegex.test(clueDefinition)) {
    throw new Error(
      `Clue '${clueDefinition.clue}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`,
    );
  }

  //  Get the clue components.

  const [, numberText, connectedCluesText, clueText, answerText] =
    clueRegex.exec(clueDefinition);
  const number = parseInt(numberText, 10);
  const code = number + (isAcrossClue ? "a" : "d");
  const x = clueDefinition.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  const y = clueDefinition.y - 1;
  const cells = [];
  const clueLabel = `${number}.`;
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
