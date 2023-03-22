const { expect } = require("chai");
const index = require("./index");

describe("index.js", () => {
  it("should export a compileCrossword function", () => {
    expect(index.compileCrossword).to.be.a("Function");
  });
  it("should export a controller object", () => {
    expect(index.Controller).to.be.a("Function");
  });
});
