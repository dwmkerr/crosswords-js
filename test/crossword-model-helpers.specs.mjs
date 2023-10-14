import { expect } from 'chai';
import { isWordSeparatorIndex } from '../src/crossword-model.mjs';

const wordLengths = [1, 2, 3, 4];
const wordSeparatorIndices = [0, 2, 5];

describe(`isWordSeparatorIndex() for [${wordLengths}]`, () => {
  const sumWordLengths = wordLengths.reduce((acc, v) => acc + v, 0);
  const results = new Array(sumWordLengths);
  // Unassigned and outside bounds values are undefined (false)
  wordSeparatorIndices.forEach((wsi) => {
    results[wsi] = true;
  });

  // Test for indexes in and out of bounds of sumWordLengths
  for (let i = -1; i < sumWordLengths + 1; i += 1) {
    it(`should return ${!!results[i]} for letterIndex=${i}`, () => {
      const result = isWordSeparatorIndex(i, wordLengths);
      expect(result).to.eql(!!results[i]);
    });
  }
});
