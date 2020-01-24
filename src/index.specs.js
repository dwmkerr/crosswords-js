const { expect } = require('chai');
const index = require('./index');

describe('index', () => {
  it('should export a compileCrossword function', () => {
    expect(index.compileCrossword).to.be.a('Function');
  });
});
