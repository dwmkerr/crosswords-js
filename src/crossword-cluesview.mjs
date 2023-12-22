import {
  addClass,
  addClasses,
  assert,
  removeClass,
  trace,
} from './helpers.mjs';

/**
 * **newCrosswordCluesView**: build a crossword clues DOM element
 * with separate blocks for across and down clues.
 * @param {*} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
 * @param {*} controller the crossword controller object
 * @returns the clues DOM element
 */
function newCrosswordCluesView(document, controller) {
  trace('newCrosswordCluesView');
  assert(document, '[document] is null or undefined');
  assert(controller, '[controller] is null or undefined');
  assert(controller.model, '[controller.model] is null or undefined');
  // assert(controller.model.acrossClues,)
  function newClueBlockElement(id, title) {
    let cbElement = document.createElement('div');
    addClass(cbElement, 'crossword-clue-block');
    cbElement.id = id;
    let titleElement = document.createElement('p');
    titleElement.innerHTML = title;
    addClass(titleElement, 'crossword-clue-block-title');
    cbElement.appendChild(titleElement);
    return cbElement;
  }

  function addClueElements(controller, clueBlockElement, cluesModel) {
    cluesModel.forEach((mc) => {
      let clueElement = document.createElement('div');
      addClass(clueElement, 'crossword-clue');
      clueElement.modelClue = mc;

      let labelElement = document.createElement('span');
      addClass(labelElement, 'crossword-clue-label');
      labelElement.innerHTML = `${mc.labelText}`;
      clueElement.appendChild(labelElement);

      let textElement = document.createElement('span');
      addClass(textElement, 'crossword-clue-text');
      textElement.innerHTML = `${mc.clueText} ${mc.lengthText}`;
      clueElement.appendChild(textElement);

      // add handler for click event
      clueElement.addEventListener('click', (element) => {
        trace(`clue(${mc.labelText}):click`);
        // eslint-disable-next-line no-param-reassign
        controller.lastMoveEvent = 'click';
        // eslint-disable-next-line no-param-reassign
        controller.currentClue = mc;
      });
      clueBlockElement.appendChild(clueElement);
    });
  }

  function isCurrentClueSegment(clue) {
    const currentClue = controller.currentClue;

    // The trivial case is that the clue is selected.
    if (clue === currentClue) {
      return true;
    } else {
      //  We might also be a clue which is part of a multi-segment clue.
      const headSegment = currentClue.headSegment;

      return (
        headSegment === clue || headSegment.tailSegments.indexOf(clue) !== -1
      );
    }
  }

  // Build the DOM for the crossword clues.
  let view = {
    wrapper: document.createElement('div'),
    acrossClues: newClueBlockElement('crossword-across-clues', 'Across'),
    downClues: newClueBlockElement('crossword-down-clues', 'Down'),
  };

  addClasses(view.wrapper, ['crosswords-js', 'crossword-clues']);

  addClueElements(controller, view.acrossClues, controller.model.acrossClues);
  view.wrapper.appendChild(view.acrossClues);

  addClueElements(controller, view.downClues, controller.model.downClues);
  view.wrapper.appendChild(view.downClues);

  // Handle when current clue has changed in controller
  // eslint-disable-next-line no-param-reassign
  controller.addEventsListener(['clueSelected'], (data) => {
    for (const vac of view.acrossClues.children) {
      if (isCurrentClueSegment(vac.modelClue)) {
        addClass(vac, 'current-clue-segment');
      } else {
        removeClass(vac, 'current-clue-segment');
      }
    }

    for (const vdc of view.downClues.children) {
      if (isCurrentClueSegment(vdc.modelClue)) {
        addClass(vdc, 'current-clue-segment');
      } else {
        removeClass(vdc, 'current-clue-segment');
      }
    }
  });

  return view.wrapper;
}

export { newCrosswordCluesView };
