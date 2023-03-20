const { expect } = require("chai");
const { replaceStrAt, setLetter } = require("./helpers");

describe("replaceStrAt()", () => {
  it("should return null for null [original]", () => {
    const result = replaceStrAt(null, 0, "X");
    expect(result).to.eql(null);
  });
  it("should return undefined for undefined [original]", () => {
    const result = replaceStrAt(undefined, 0, "X");
    expect(result).to.eql(undefined);
  });
  it("should overlay 'X' at position 0", () => {
    const result = replaceStrAt("hello", 0, "X");
    expect(result).to.eql("Xello");
  });
  it("should overlay 'X' at position 2", () => {
    const result = replaceStrAt("hello", 2, "X");
    expect(result).to.eql("heXlo");
  });
  it("should overlay 'X' at position (length - 1)", () => {
    const result = replaceStrAt("hello", 4, "X");
    expect(result).to.eql("hellX");
  });
  it("should return [original] for [index] < 0", () => {
    const result = replaceStrAt("hello", -1, "X");
    expect(result).to.eql("hello");
  });
  it("should return [original] for [index] = [original] length", () => {
    const result = replaceStrAt("hello", 5, "X");
    expect(result).to.eql("hello");
  });
  it("should return [original] for [index] > [original] length", () => {
    const result = replaceStrAt("hello", 9, "X");
    expect(result).to.eql("hello");
  });
  it("should extend [original] if overlaying [str] extends beyond current length", () => {
    const result = replaceStrAt("hello", 2, "wotcha");
    expect(result).to.eql("hewotcha");
  });
});

describe("setLetter()", () => {
  it("should return a left-padded result for null source", () => {
    const source = null;
    const index = 5;
    const result = setLetter(source, index, "x");
    //  Check the width, height and clues.
    expect(result.length).to.eql(index + 1);
    expect(result[index]).to.eql("x");
    expect(result).to.eql("     x");
  });
});
