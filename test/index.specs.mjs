import { expect } from 'chai';
import { CrosswordsJS } from '../src/index.mjs';
const { compileCrossword, Controller } = CrosswordsJS;

describe('index.js', () => {
  it('should export a compileCrossword function', () => {
    expect(compileCrossword).to.be.a('Function');
  });
  it('should export a controller object', () => {
    expect(Controller).to.be.a('Function');
  });
});
