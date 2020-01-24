const compileCrossword = require('./compile-crossword');
const CrosswordDOM = require('./crossworddom');
require('./crosswords.less');

//  Define our public API.
window.CrosswordsJS = {
  compileCrossword,
  CrosswordDOM,
};

module.exports = window.CrosswordsJS;
