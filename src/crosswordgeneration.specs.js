const { expect } = require('chai');
const Crossword = require('./crossword');
const quiptic89 = require('./data/quiptic89.json');

describe('model generation', () => {
  it('should fail if no definition is provided', () => {
    expect(() => { new Crossword(); }).to.throw('The Crossword must be initialised with a crossword definition.');
  });

  it('should provide basic details of the crossword in the model', () => {
    //  Generate the crossword.
    const crossword = new Crossword(quiptic89);

    //  Check the width, height and clues.
    expect(crossword.width).to.eql(quiptic89.width);
    expect(crossword.height).to.eql(quiptic89.height);
    expect(crossword.acrossClues.length).to.eql(quiptic89.acrossClues.length);
    expect(crossword.downClues.length).to.eql(quiptic89.downClues.length);
  });

  it('should provide clues in the model', () => {
    const crossword = new Crossword(quiptic89);

    const definitionClue = quiptic89.acrossClues[0];
    const modelClue = crossword.acrossClues[0];

    //  Check the width, height and clues.
    expect(modelClue.number).to.eql(definitionClue.number);
    expect(modelClue.x).to.eql(definitionClue.x - 1); //  The model is zero based.
    expect(modelClue.y).to.eql(definitionClue.y - 1);
    expect(modelClue.length).to.eql(definitionClue.length);
    expect(modelClue.clue).to.eql(definitionClue.clue);
  });
});
