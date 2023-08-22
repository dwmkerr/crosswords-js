import { expect } from 'chai';
import { newClueModel, cluePattern } from '../src/clue-model.mjs';
const isAcrossClue = true;
const cd = [];
cd['missing-clue'] = { x: 12, y: 9 };
cd['null-clue'] = { x: 12, y: 9, clue: null };
cd['missing-label'] = { x: 12, y: 9, clue: 'Red or green fruit (5)' };
cd['non-numeric-label'] = { x: 12, y: 9, clue: 'a. Red or green fruit (5)' };
cd['missing-answer'] = { x: 12, y: 9, clue: '3. Red or green fruit' };
cd['non-numeric-answer'] = { x: 12, y: 9, clue: '3. Red or green fruit (a)' };
cd['z-replaces-x'] = { z: 12, y: 9, clue: '3. Red or green fruit (5)' };
cd['missing-x'] = { y: 9, clue: 'Red or green fruit (5)' };
cd['null-x'] = { x: null, y: 9, clue: 'Red or green fruit (5)' };
cd['string-x'] = { x: 'a', y: 9, clue: 'Red or green fruit (5)' };
cd['missing-y'] = { x: 12, clue: 'Red or green fruit (5)' };
cd['null-y'] = { x: 12, y: null, clue: 'Red or green fruit (5)' };
cd['boolean-y'] = { x: 12, y: true, clue: 'Red or green fruit (5)' };
cd['unexpected-properties'] = {
  x: 12,
  y: 9,
  z: true,
  a: 'z',
  clue: '3. Red or green fruit (5)',
};
cd['optional-properties'] = {
  x: 12,
  y: 9,
  answer: 'guess',
  clue: '3. Red or green fruit (5)',
};
cd['undefined-answer'] = {
  x: 12,
  y: 9,
  answer: undefined,
  clue: 'Red or green fruit (5)',
};
cd['undefined-solution'] = {
  x: 12,
  y: 9,
  solution: undefined,
  clue: 'Red or green fruit (5)',
};
cd['normalisable-answer'] = {
  x: 12,
  y: 9,
  answer: 'a ?l[',
  clue: '1. Red or green fruit (5)',
};
cd['normalisable-solution'] = {
  x: 12,
  y: 9,
  solution: ' ap-p l?[e',
  clue: '1. Red or green fruit (5)',
};
cd['valid-single-segment'] = { x: 12, y: 9, clue: '3. Red or green fruit (5)' };
cd['valid-multi-word-hyphenated-answer'] = {
  x: 12,
  y: 9,
  clue: '9. Clue (5,3-4)',
};
cd['invalid-multi-word-hyphenated-answer'] = {
  x: 12,
  y: 9,
  clue: '9. Clue (5,3-4-,6)',
};
cd['valid-multi-segment-number'] = { x: 12, y: 9, clue: '9,3a,4d,6. Clue (5)' };
cd['invalid-multi-segment-number'] = { x: 12, y: 9, clue: '9,3b,4. Clue (5)' };
(cd['valid-answer-solution-revealed'] = {
  x: 6,
  y: 5,
  clue: '13. Woman who suffered capital loss in Lebanon, beaten by fluctuating yen (4,6)',
  solution: 'anne boleyn',
  // cspell:disable-next-line
  answer: 'a nxxxxx n',
  revealed: 'a n      n',
}),
  (cd['invalid-solution'] = {
    x: 6,
    y: 5,
    clue: '13. Woman who suffered capital loss in Lebanon, beaten by fluctuating yen (4,6)',
    solution: 'catherine parr',
    // cspell:disable-next-line
    answer: 'a nxxxxx n',
    revealed: 'a n      n',
  }),
  (cd['invalid-revealed'] = {
    x: 6,
    y: 5,
    clue: '13. Woman who suffered capital loss in Lebanon, beaten by fluctuating yen (4,6)',
    solution: 'anne boleyn',
    // cspell:disable-next-line
    answer: 'a nxxxxx n',
    revealed: 'a n    ',
  });

describe('newClueModel()', () => {
  it('should fail if cdClue is not provided', () => {
    expect(() => {
      newClueModel();
    }).to.throw("'cdClue' and 'isAcrossClue' are required");
  });

  it('should fail if isAcrossClue is not provided', () => {
    expect(() => {
      newClueModel(cd['valid-single-segment']);
    }).to.throw("'cdClue' and 'isAcrossClue' are required");
  });

  it('should fail if isAcrossClue is null', () => {
    expect(() => {
      newClueModel(cd['valid-single-segment'], null);
    }).to.throw("'isAcrossClue' can't be null");
  });

  it('should fail if isAcrossClue is string', () => {
    expect(() => {
      newClueModel(cd['valid-single-segment'], 'wotcha!');
    }).to.throw("'isAcrossClue' must be a boolean (true,false)");
  });

  it('should fail if cdClue is null', () => {
    expect(() => {
      newClueModel(null, isAcrossClue);
    }).to.throw("'cdClue' can't be null");
  });

  it('should fail if cdClue.x replaced by another property', () => {
    expect(() => {
      newClueModel(cd['z-replaces-x'], isAcrossClue);
    }).to.throw("'cdClue.x' is missing");
  });

  it('should fail if cdClue.x missing', () => {
    expect(() => {
      newClueModel(cd['missing-x'], isAcrossClue);
    }).to.throw("'cdClue.x' is missing");
  });

  it('should fail if cdClue.x is null', () => {
    expect(() => {
      newClueModel(cd['null-x'], isAcrossClue);
    }).to.throw("'cdClue.x (null)' must be a number");
  });

  it('should fail if cdClue.x is a string', () => {
    expect(() => {
      newClueModel(cd['string-x'], isAcrossClue);
    }).to.throw("'cdClue.x (a)' must be a number");
  });

  it('should fail if cdClue.y missing', () => {
    expect(() => {
      newClueModel(cd['missing-y'], isAcrossClue);
    }).to.throw("'cdClue.y' is missing");
  });

  it('should fail if cdClue.y is null', () => {
    expect(() => {
      newClueModel(cd['null-y'], isAcrossClue);
    }).to.throw("'cdClue.y (null)' must be a number");
  });

  it('should fail if cdClue.y is a boolean', () => {
    expect(() => {
      newClueModel(cd['boolean-y'], isAcrossClue);
    }).to.throw("'cdClue.y (true)' must be a number");
  });

  it('should fail if cdClue has unexpected properties', () => {
    expect(() => {
      newClueModel(cd['unexpected-properties'], isAcrossClue);
    }).to.throw("'cdClue' has unexpected properties <z,a>");
  });

  it('should pass if cdClue has optional properties', () => {
    const clueModel = newClueModel(cd['optional-properties'], isAcrossClue);
    expect(clueModel.answer).to.eql('GUESS');
  });

  it('should pass if cdClue has normalisable answer', () => {
    const clueModel = newClueModel(cd['normalisable-answer'], isAcrossClue);
    expect(clueModel.answer).to.eql('A  L ');
  });

  it('should pass if cdClue has normalisable solution', () => {
    const clueModel = newClueModel(cd['normalisable-solution'], isAcrossClue);
    expect(clueModel.solution).to.eql('APPLE');
  });

  it('should fail if cdClue.answer is not a string', () => {
    expect(() => {
      newClueModel(cd['undefined-answer'], isAcrossClue);
    }).to.throw("'cdClue.answer (undefined)' must be a string");
  });

  it('should fail if cdClue.solution is not a string', () => {
    expect(() => {
      newClueModel(cd['undefined-solution'], isAcrossClue);
    }).to.throw("'cdClue.solution (undefined)' must be a string");
  });

  it('should fail if the clue number is not provided', () => {
    expect(() => {
      newClueModel(cd['missing-label'], isAcrossClue);
    }).to.throw(
      `Clue '${cd['missing-label'].clue}' does not match the required pattern '${cluePattern}'`,
    );
  });

  it('should fail if the clue number is not numeric', () => {
    expect(() => {
      newClueModel(cd['non-numeric-label'], isAcrossClue);
    }).to.throw(`'a. Red or green fruit (5)' Error in <numberText> near <a>`);
  });

  it('should fail if the answer structure is not provided', () => {
    expect(() => {
      newClueModel(cd['missing-answer'], isAcrossClue);
    }).to.throw(
      `Clue '${cd['missing-answer'].clue}' does not match the required pattern '${cluePattern}'`,
    );
  });

  it('should fail if the answer structure is not numeric', () => {
    expect(() => {
      newClueModel(cd['non-numeric-answer'], isAcrossClue);
    }).to.throw(`'3. Red or green fruit (a)' Error in <answerText> near <a>`);
  });

  it('should compile the number, code and answer lengths of a clue string', () => {
    const clueModel = newClueModel(cd['valid-single-segment'], false);
    expect(clueModel.number).to.eql(3);
    expect(clueModel.code).to.eql('3d');
    expect(clueModel.clueText).to.eql('Red or green fruit');
    expect(clueModel.answerLength).to.eql(5);
    expect(clueModel.answerSegments).to.eql([{ length: 5, terminator: '' }]);
    expect(clueModel.answerLengthText).to.eql('(5)', isAcrossClue);
  });

  it('should compile multi-word and hyphenated answers', () => {
    const clueModel = newClueModel(
      cd['valid-multi-word-hyphenated-answer'],
      isAcrossClue,
    );
    expect(clueModel.number).to.eql(9);
    expect(clueModel.clueText).to.eql('Clue');
    expect(clueModel.answerLength).to.eql(12);
    expect(clueModel.answerSegments).to.eql([
      { length: 5, terminator: ',' },
      { length: 3, terminator: '-' },
      { length: 4, terminator: '' },
    ]);
    expect(clueModel.answerLengthText).to.eql('(5,3-4)', isAcrossClue);
  });

  it('should fail on error in multi-word and hyphenated answer', () => {
    expect(() => {
      newClueModel(cd['invalid-multi-word-hyphenated-answer'], isAcrossClue);
    }).to.throw("'9. Clue (5,3-4-,6)' Error in <answerText> near <4-,6>");
  });

  it('should compile multi-segment clue numbers', () => {
    const clueModel = newClueModel(
      cd['valid-multi-segment-number'],
      isAcrossClue,
    );
    expect(clueModel.number).to.eql(9);
    expect(clueModel.clueText).to.eql('Clue');
    expect(clueModel.answerLength).to.eql(5);
    expect(clueModel.answerSegments).to.eql([{ length: 5, terminator: '' }]);
    expect(clueModel.answerLengthText).to.eql('(5)');
    expect(clueModel.connectedDirectedClues).to.eql([
      { number: 3, direction: 'across' },
      { number: 4, direction: 'down' },
      { number: 6, direction: null },
    ]);
  });

  it('should fail on error in multi-segment clue number', () => {
    expect(() => {
      newClueModel(cd['invalid-multi-segment-number'], isAcrossClue);
    }).to.throw("'9,3b,4. Clue (5)' Error in <numberText> near <3b,4>");
  });

  it('should compile the number, code and answer lengths of a clue string', () => {
    const clueModel = newClueModel(cd['valid-single-segment'], isAcrossClue);
    expect(clueModel.answer).to.eql('     ');
    expect(clueModel.answerSegments).to.eql([{ length: 5, terminator: '' }]);
    expect(clueModel.answerLengthText).to.eql('(5)', isAcrossClue);
    expect(clueModel.cells).to.eql([]);
    expect(clueModel.clueLabel).to.eql('3');
    expect(clueModel.revealed).to.eql(undefined);
    expect(clueModel.solution).to.eql(undefined);
    expect(clueModel.clueText).to.eql('Red or green fruit');
    expect(clueModel.number).to.eql(3);
    expect(clueModel.code).to.eql('3a');
    expect(clueModel.answerLength).to.eql(5);
    expect(clueModel.x).to.eql(11);
    expect(clueModel.y).to.eql(8);
  });

  it('should compile the answer, solution and revealed a clue string', () => {
    const clueModel = newClueModel(
      cd['valid-answer-solution-revealed'],
      isAcrossClue,
    );
    // cspell:disable-next-line
    expect(clueModel.answer).to.eql('A NXXXXX N');
    expect(clueModel.answerSegments).to.eql([
      { length: 4, terminator: ',' },
      { length: 6, terminator: '' },
    ]);
    expect(clueModel.answerLengthText).to.eql('(4,6)', isAcrossClue);
    expect(clueModel.cells).to.eql([]);
    expect(clueModel.clueLabel).to.eql('13');
    expect(clueModel.revealed).to.eql('A N      N');
    expect(clueModel.solution).to.eql('ANNEBOLEYN');
    expect(clueModel.clueText).to.eql(
      'Woman who suffered capital loss in Lebanon, beaten by fluctuating yen',
    );
    expect(clueModel.number).to.eql(13);
    expect(clueModel.answerLength).to.eql(10);
    expect(clueModel.x).to.eql(5);
    expect(clueModel.y).to.eql(4);
  });

  it('should fail if solution length does not match answer length in clue text', () => {
    expect(() => {
      newClueModel(cd['invalid-solution'], isAcrossClue);
    }).to.throw(
      "Length of clue solution 'CATHERINEPARR' does not match the answer length '(4,6)'",
    );
  });

  it('should fail if revealed characters length does not match answer length in clue text', () => {
    expect(() => {
      newClueModel(cd['invalid-revealed'], isAcrossClue);
    }).to.throw(
      "Length of clue revealed characters 'A N    ' does not match the answer length: 10",
    );
  });
});
