import compileCrossword from './compile-crossword.mjs';
import CrosswordDOM from './crossworddom.mjs';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
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

export default CrosswordsJS;
