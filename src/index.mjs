import { newCrosswordModel } from './crossword-model.mjs';
import { CrosswordController } from './crossword-controller.mjs';

//  Define our public API.
const CrosswordsJS = {
  compileCrossword: newCrosswordModel,
  Controller: CrosswordController,
};

//  If we are in the browser, add the API to the global scope.
if (typeof window !== 'undefined') {
  window.CrosswordsJS = CrosswordsJS;
}

export { CrosswordsJS };
