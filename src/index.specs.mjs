import { expect } from 'chai';
import CrosswordsJS from './index.mjs';
// import { compileCrossword } from './index.mjs';

describe('index.js', () => {
  it('should export a compileCrossword function', () => {
    expect(CrosswordsJS.compileCrossword).to.be.a('Function');
    // expect(compileCrossword).to.be.a('Function');
  });
  it('should export a controller object', () => {
    expect(Controller).to.be.a('Function');
  });
});
