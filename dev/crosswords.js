const compileCrossword = require("../src/crossword-model");
const CrosswordController = require("../src/crossword-controller");

//  Define our public API.
const CrosswordsJS = {
  compileCrossword,
  Controller: CrosswordController,
};

//  If we are in the browser, add the API to the global scope.
if (typeof window !== "undefined") {
  window.CrosswordsJS = CrosswordsJS;
}

module.exports = CrosswordsJS;
