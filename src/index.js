const Crossword = require('./crossword');
const CrosswordDOM = require('./crossworddom');
require('./crosswords.less');

//  Define our public API.
window.CrosswordsJS = {
  Crossword,
  CrosswordDOM
};
