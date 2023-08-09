import { expect } from 'chai';
import { newCrosswordModel } from '../src/crossword-model.mjs';

// mocha requires 'assert' for json imports but eslint (ecma version 13) throws parsing error...
//  import quiptic89 from '../data/quiptic89.json' assert { type: "json" };
//  import alberich4 from '../data/alberich_4.json' assert { type: "json" };
// eslint (ecma version 13) passes but mocha requires 'assert'...
//  import quiptic89 from '../data/quiptic_89.json';
//  import alberich4 from '../data/alberich_4.json';
//
// hack: reintroduce 'require'!

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const quiptic89 = require('../data/quiptic_89.json');
const alberich4 = require('../data/alberich_4.json');
const ftimes17095 = require('../data/ftimes_17095.json');

const { width, height, acrossClues, downClues } = quiptic89;

describe('newCrosswordModel()', () => {
  it('should fail if crosswordDefinition is not provided', () => {
    expect(() => {
      newCrosswordModel();
    }).to.throw(
      'The model must be initialised with a JSON crossword definition.',
    );
  });

  it('should provide basic details of the crossword in crosswordDefinition', () => {
    //  Generate the crossword model.
    const crosswordModel = newCrosswordModel(quiptic89);

    //  Check the width, height and clues.
    expect(crosswordModel.width).to.eql(width);
    expect(crosswordModel.height).to.eql(height);
    expect(crosswordModel.acrossClues.length).to.eql(acrossClues.length);
    expect(crosswordModel.downClues.length).to.eql(downClues.length);
  });

  it('should provide clues in the crosswordDefinition', () => {
    const crosswordModel = newCrosswordModel(quiptic89);

    const definitionClue = acrossClues[0];
    const modelClue = crosswordModel.acrossClues[0];

    //  Check the width, height and clues.
    expect(modelClue.x).to.eql(definitionClue.x - 1); //  The model is zero based.
    expect(modelClue.y).to.eql(definitionClue.y - 1);

    //  The following elements are parsed from the clue text.
    expect(modelClue.number).to.eql(1);
    expect(modelClue.clueText).to.eql(
      'Conspicuous influence exerted by active troops',
    );
  });

  it('should fail if the bounds of crosswordDefinition are invalid', () => {
    const expectedError = 'The crossword bounds are invalid.';

    let crosswordDefinition = {
      width: null,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);

    crosswordDefinition = {
      width: 3,
      height: -1,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);

    crosswordDefinition = {
      height: -2,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);
  });

  it('should fail if a clue exceeds the bounds of crosswordDefinition', () => {
    const crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [],
      downClues: [],
    };

    crosswordDefinition.acrossClues = [
      {
        x: 3,
        y: 1,
        clue: '3. Clue (12)',
      },
    ];
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw('Clue 3a exceeds horizontal bounds.');

    crosswordDefinition.acrossClues = [];
    crosswordDefinition.downClues = [
      {
        x: 1,
        y: 3,
        clue: '3. Clue (3,1,5)',
      },
    ];
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw('Clue 3d exceeds vertical bounds.');

    crosswordDefinition.acrossClues = [
      {
        x: 3,
        y: -1,
        clue: '3. Clue (12)',
      },
    ];
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw("Clue 3a doesn't start in the bounds.");
  });

  it('should validate the coherence of a clue if the answers are provided', () => {
    //  This is incoherent - (3,3) is both A and P.
    let crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [
        {
          clue: '1. Red or green fruit (5)',
          x: 3,
          y: 3,
          answer: 'apple',
        },
      ],
      downClues: [
        {
          clue: '1. Fuzzy fruit (5)',
          x: 3,
          y: 3,
          answer: 'angry',
        },
      ],
    };
    // No exceptions thrown
    let crosswordModel = newCrosswordModel(crosswordDefinition);
    expect(crosswordModel.acrossClues[0].answer).to.equal('APPLE');
    expect(crosswordModel.downClues[0].answer).to.equal('ANGRY');
    expect(crosswordModel.acrossClues[0].answer[0]).to.equal(
      crosswordModel.downClues[0].answer[0],
    );

    crosswordModel.acrossClues[0].answer = 'apple';
    crosswordDefinition.downClues[0].answer = 'peach';

    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(
      'Clue 1d answer at (3,3) [PEACH[1],P] is not coherent with previous clue (1a) answer [APPLE,A].',
    );
  });

  it('should validate the coherence of a clue if the solutions are provided', () => {
    //  This is incoherent - (3,3) is both A and P.
    const crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [
        {
          clue: '1. Red or green fruit (5)',
          x: 3,
          y: 3,
          solution: 'APPLE',
        },
      ],
      downClues: [
        {
          clue: '1. Fuzzy fruit (5)',
          x: 3,
          y: 3,
          solution: 'PEACH',
        },
      ],
    };

    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(
      'Clue 1d solution at (3,3) [PEACH[1],P] is not coherent with previous clue (1a) solution [APPLE,A].',
    );
  });

  it('should validate the coherence of a clue if solutions are provided with similar normalised values', () => {
    //  This is incoherent - (3,3) is both A and P.
    const crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [
        {
          clue: '1. Red or green fruit (5)',
          x: 3,
          y: 3,
          solution: ' AP ple ',
        },
      ],
      downClues: [
        {
          clue: '1. Red or green fruit (5)',
          x: 3,
          y: 3,
          solution: 'App-LE   ',
        },
      ],
    };

    const crosswordModel = newCrosswordModel(crosswordDefinition);
    expect(crosswordModel.downClues[0].solution).to.eql('APPLE');
    expect(crosswordModel.acrossClues[0].solution).to.eql('APPLE');
  });

  it('should correctly construct multi-segment clues', () => {
    //  multi-segment clues are clues which have an answer that does fit in a
    //  single contiguous block, but instead is split into multiple sections.
    const crossword = newCrosswordModel(alberich4);

    //  Get the two clues which make up the single multi-segment clue.
    const clue4down = crossword.downClues.find((dc) => dc.number === 4);
    const clue21across = crossword.acrossClues.find((ac) => ac.number === 21);

    //  Check we've found the clues.
    expect(clue4down).not.to.equal(null);
    expect(clue21across).not.to.equal(null);

    //  Make sure the connected clues are set.
    expect(clue4down.connectedClues).to.eql([clue21across]);
    expect(clue4down.answerLengthText).to.eql('(9,3,5)');
    expect(clue4down.clueLabel).to.eql('4,21.');
  });

  it('should validate the test crosswords', () => {
    [ftimes17095, alberich4, quiptic89].forEach((cd) => {
      newCrosswordModel(cd);
    });
  });
});
