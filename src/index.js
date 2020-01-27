const compileCrossword = require('./compile-crossword');
const CrosswordDOM = require('./crossworddom');
require('./crosswords.less');

//  Define our public API.
const CrosswordsJS = {
  compileCrossword,
  CrosswordDOM,
};

//  If we are in the browser, add the API to the global scope.
if (typeof window !== 'undefined') {
  window.CrosswordsJS = CrosswordsJS;
}

module.exports = CrosswordsJS;
