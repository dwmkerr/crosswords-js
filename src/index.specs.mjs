import { expect } from 'chai';
import { compileCrossword } from './index.mjs';

describe('index', () => {
  it('should export a compileCrossword function', () => {
    expect(compileCrossword).to.be.a('Function');
  });
});
