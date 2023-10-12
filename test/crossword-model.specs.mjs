import { expect } from 'chai';
import { newCrosswordModel } from '../src/crossword-model.mjs';

// mocha requires 'assert' for json imports but eslint (ecma version 13) throws parsing error...
//  import quiptic89 from '../data/quiptic89.json' assert { type: "json" };
//  import alberich4 from '../data/alberich_4.json' assert { type: "json" };
// eslint (ecma version 13) passes but mocha requires 'assert' phrase...
//  import quiptic89 from '../data/quiptic_89.json';
//  import alberich4 from '../data/alberich_4.json';
//
// hack: reintroduce 'require'!

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const quiptic89 = require('../data/quiptic_89.json');
const alberich4 = require('../data/alberich_4.json');
const ftimes17095 = require('../data/ftimes_17095.json');
const daquick20230818 = require('../data/da_quick_20230818.json');

const { width, height, acrossClues, downClues } = quiptic89;
const mimetype = 'application/vnd.js-crossword';
const version = '1.0';
const document = { mimetype, version };

describe('newCrosswordModel()', () => {
  it('should return null if crosswordDefinition is not provided', () => {
    expect(newCrosswordModel()).to.eql(null);
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
    expect(modelClue.headNumber).to.eql(1);
    expect(modelClue.clueText).to.eql(
      'Conspicuous influence exerted by active troops',
    );
  });

  it('should fail if the bounds of crosswordDefinition are invalid', () => {
    const expectedError = 'The crossword bounds are invalid.';

    let crosswordDefinition = {
      document,
      width: null,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);

    crosswordDefinition = {
      document,
      width: 3,
      height: -1,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);

    crosswordDefinition = {
      document,
      height: -2,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);
  });

  it('should fail if a clue exceeds the bounds of crosswordDefinition', () => {
    const crosswordDefinition = {
      document,
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
      document,
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
      document,
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
      document,
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
    const clue4down = crossword.downClues.find((dc) => dc.headNumber === 4);
    const clue21across = crossword.acrossClues.find(
      (ac) => ac.headNumber === 21,
    );

    //  Check we've found the clues.
    expect(clue4down).not.to.equal(null);
    expect(clue21across).not.to.equal(null);

    //  Make sure the connected clues are set.

    expect(clue4down.tailSegments).to.eql([clue21across]);
    expect(clue4down.segmentLength).to.eql(9);
    // Reset when head clue is processed
    expect(clue4down.lengthText).to.eql('(9,3,5)');
    expect(clue4down.labelText).to.eql('4,21.');
    expect(clue4down.clueId).to.eql('4d');

    // Reset when head clue is processed
    expect(clue21across.tailSegments).to.eql([]);
    expect(clue21across.segmentLength).to.eql(8);
    // Reset when head clue is processed
    expect(clue21across.lengthText).to.eql('');
    expect(clue21across.labelText).to.eql('21.');
    expect(clue21across.clueText).to.eql('See 4-down');
    expect(clue21across.clueId).to.eql('21a');
  });

  it('should correctly construct reversed multi-segment clues', () => {
    //  multi-segment clues are clues which have an answer that does fit in a
    //  single contiguous block, but instead is split into multiple sections.
    const crossword = newCrosswordModel(daquick20230818);

    //  Get the two clues which make up the single multi-segment clue.
    const clue1across = crossword.acrossClues.find((ac) => ac.headNumber === 1);
    const clue13across = crossword.acrossClues.find(
      (ac) => ac.headNumber === 13,
    );

    //  Check we've found the clues.
    expect(clue1across).not.to.equal(null);
    expect(clue13across).not.to.equal(null);

    //  Make sure the connected clues are set.

    //Set when head clue is processed
    expect(clue1across.tailSegments).to.eql([]);
    // Reset when head clue is processed
    expect(clue1across.lengthText).to.eql('');
    expect(clue1across.labelText).to.eql('1.');
    expect(clue1across.clueText).to.eql('See 13-across');
    expect(clue1across.clueId).to.eql('1a');
    expect(clue13across.tailSegments).to.eql([clue1across]);
    // Reset when head clue is processed
    expect(clue13across.lengthText).to.eql('(7,8)');
    expect(clue13across.labelText).to.eql('13,1.');
    expect(clue13across.clueText).to.eql('Footscray, rebadged');
    expect(clue13across.clueId).to.eql('13a');
  });

  it('should validate the test crosswords', () => {
    [ftimes17095, alberich4, quiptic89, daquick20230818].forEach((cd) => {
      newCrosswordModel(cd);
    });
  });
});
