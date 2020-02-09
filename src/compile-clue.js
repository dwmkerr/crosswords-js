//  This is the main regex which rips apart a clue into a number, clue and
//  answer structure.
const clueRegex = new RegExp(/^(\d+),?([\dad,]*).[\s]*(.*)[\s]*\(([\d,-]+)\)$/);

function directionFromClueLabel(clueLabel) {
  if (/a$/.test(clueLabel)) return 'across';
  if (/d$/.test(clueLabel)) return 'down';
  return null;
}

/**
 * compileClue - create a clue model from a clue defintion
 *
 * @param clueDefinition - a string which defines the clue, in the format:
 *   "<Number>. <Clue> (<Answer Structure>)"
 * @returns - the clue model for the given defintion
 */
function compileClue(clueDefinition) {
  if (!clueDefinition) {
    throw new Error('\'clue\' is required');
  }

  //  First, validate the clue structure.
  if (!clueRegex.test(clueDefinition)) {
    throw new Error(`Clue '${clueDefinition}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`);
  }

  //  Get the clue components.
  const [, numberText, connectedCluesText, clue, answerText] = clueRegex.exec(clueDefinition);
  const number = parseInt(numberText, 10);

  //  If we have connected clues, break them apart.
  let connectedClueNumbers = null;
  if (connectedCluesText) {
    connectedClueNumbers = connectedCluesText.split(',').map((cc) => ({
      number: parseInt(cc, 10),
      direction: directionFromClueLabel(cc),
    }));
  }

  //  Now we can start to break up the answer segments.
  const answerStructure = [];
  const answerSegmentRegex = new RegExp(/([\d]+)([,-]?)(.*)/);
  let remainingAnswerStructure = answerText;
  while (answerSegmentRegex.test(remainingAnswerStructure)) {
    const [, length, terminator, rest] = answerSegmentRegex.exec(remainingAnswerStructure);
    answerStructure.push({ length: parseInt(length, 10), terminator });
    remainingAnswerStructure = rest;
  }

  //  Calculate the total length of the answer.
  const totalLength = answerStructure.reduce((current, as) => current + as.length, 0);

  //  Also create the answer structure as text.
  const answerStructureText = `(${answerStructure.map((as) => `${as.length}${as.terminator}`).join('')})`;

  return {
    number,
    clue,
    connectedClueNumbers,
    answerStructure,
    answerStructureText,
    totalLength,
  };
}

module.exports = compileClue;
