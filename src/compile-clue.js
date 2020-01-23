//  This is the main regex which rips apart a clue into a number, clue and
//  answer structure.
const clueRegex = new RegExp(/^(\d+).[\s]*(.*)[\s]*\(([\d,-]+)\)$/);

function compileClue(clueDefinition) {
  if (!clueDefinition) {
    throw new Error('\'clue\' is required');
  }

  //  First, validate the clue structure.
  if (!clueRegex.test(clueDefinition)) {
    throw new Error(`Clue '${clueDefinition}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`);
  }

  //  Get the clue components.
  const [_, numberText, clue, answerStructure] = clueRegex.exec(clueDefinition);
  const number = parseInt(numberText, 10);

  //  Break the answer string into an array of answer segment lengths.
  const length = answerStructure.replace('-', ',').split(',').map((l) => parseInt(l, 10));

  //  Calculate the total length of the answer.
  const totalLength = length.reduce((current, l) => current + l, 0);

  return {
    number,
    clue,
    length,
    totalLength,
  };
}

module.exports = compileClue;
