const newCrosswordModel = require("./crossword-model");
const CrosswordController = require("./crossword-controller");
const css = require("./crosswords.less");

//  Define our public API.
const CrosswordsJS = {
  newCrosswordModel,
  controller: CrosswordController,
};

//  If we are in the browser, add the API to the global scope.
if (typeof window !== "undefined") {
  window.CrosswordsJS = CrosswordsJS;
}

module.exports = CrosswordsJS;
