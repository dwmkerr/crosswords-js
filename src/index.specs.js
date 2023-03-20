const { expect } = require("chai");
const index = require("./index");

describe("index.js", () => {
  it("should export a newCrosswordModel function", () => {
    expect(index.newCrosswordModel).to.be.a("Function");
  });
  it("should export a controller object", () => {
    expect(index.controller).to.be.a("Function");
  });
});
