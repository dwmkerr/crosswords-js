import { CellMap } from './cell-map.mjs';
import {
  addClass,
  addClasses,
  assert,
  ecs,
  eid,
  newPubSub,
  removeClass,
  trace,
} from './helpers.mjs';
import {
  anchorSegmentClues,
  checkSolved,
  cleanClue,
  cleanCrossword,
  hideElement,
  Outcome,
  resetClue,
  resetCrossword,
  revealCell,
  revealClue,
  revealCrossword,
  testClue,
  testCrossword,
} from './crossword-controller-helpers.mjs';
import {
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  setCellContent,
  toggleClueDirection,
} from './cell-element-helpers.mjs';

// Keycode values
const BACKSPACE = 8,
  TAB = 9,
  ENTER = 13,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  DELETE = 46;

// Regular expressions for keypress processing.
// All pressed keys are upper-cased before testing.
const echoingKeyPressCharacters = /^[A-Z]$/;
const advancingKeyPressCharacters = /^[ A-Z]$/;

// Allow DOM event flushing after clue or crossword solution.
const SOLUTION_TIMEOUT = 5;

/** **CrosswordController** - an [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
 * _Controller_ class for the _CrosswordsJS_ package.
 * Use this class to access the package API.
 */
class CrosswordController {
  #cellMap = new CellMap();
  #current = { clue: null, cell: null };
  #pubSub = newPubSub();
  #subscribers = [];
  #crosswordGridView;
  #crosswordCluesView;
  #crosswordModel;
  #domGridParentElement;
  #domCluesParentElement;
  #userEventHandlers;

  // Events published by the CrosswordController
  #controllerEventNames = [
    'cellRevealed',
    'clueCleaned',
    'clueReset',
    'clueRevealed',
    'clueSelected',
    'clueSolved',
    'clueTested',
    'crosswordCleaned',
    'crosswordReset',
    'crosswordRevealed',
    'crosswordSolved',
    'crosswordTested',
  ];

  constructor(crosswordModel, domGridParentElement, domCluesParentElement) {
    trace('CrosswordController constructor');
    assert(
      crosswordModel,
      'CrosswordController: crosswordModel is null or undefined',
    );
    assert(
      domGridParentElement,
      'CrosswordController: domGridParentElement is null or undefined',
    );
    this.#crosswordModel = crosswordModel;
    this.#domGridParentElement = domGridParentElement;
    this.#domCluesParentElement = domCluesParentElement;
    //  Build the DOM for the crossword grid.
    this.#crosswordGridView = this.#document.createElement('div');
    addClass(this.#crosswordGridView, 'crossword-grid');

    // Build the DOM for the crossword clues.
    if (domCluesParentElement) {
      this.#crosswordCluesView = this.#newCrosswordCluesView(
        this.#document,
        this,
      );
      //  Add the crossword clues to the webpage DOM
      domCluesParentElement.appendChild(this.#crosswordCluesView);
    }

    //  Create each cell.
    for (let y = 0; y < this.#crosswordModel.height; y += 1) {
      for (let x = 0; x < this.#crosswordModel.width; x += 1) {
        const cell = this.#crosswordModel.cells[x][y];

        //  Build the cell element and add it to the row.
        const cellElement = this.#newCellElement(this.#document, cell);
        this.#crosswordGridView.appendChild(cellElement);

        //  Update the map of cells
        this.#cellMap.add(cell, cellElement);
      }
    }

    // Mapping of end-user-initiated events to handler methods
    this.#userEventHandlers = {
      // Reveal solution for current letter in answer. All revealed cells have
      // distinct styling which remains for the duration of the puzzle.
      // Public shaming is strictly enforced!
      'reveal-cell': this.revealCurrentCell,
      // Remove incorrect letters in the answer after testing.
      'clean-clue': this.cleanCurrentClue,
      // Clear out the answer for the current clue
      'reset-clue': this.resetCurrentClue,
      // Reveal solution for current clue
      'reveal-clue': this.revealCurrentClue,
      // Test the current clue answer against the solution. Incorrect letters
      // have distinct styling which is removed when 'cleared' or a new letter
      // entered in the cell.
      'test-clue': this.testCurrentClue,
      // Clear out all incorrect letters in the entire crossword
      'clean-crossword': this.cleanCrossword,
      // Clear out the entire crossword
      'reset-crossword': this.resetCrossword,
      // Reveal solutions for the entire crossword.
      'reveal-crossword': this.revealCrossword,
      // Test the answers for the entire crossword against the solutions
      'test-crossword': this.testCrossword,
    };

    //  Add the crossword grid to the webpage DOM
    this.#domGridParentElement.appendChild(this.crosswordGridView);

    // Select the first "across" clue when the grid is complete and visible.
    this.currentClue = this.#crosswordModel.acrossClues[0];
  }

  //  Completely cleans up the crossword.
  destroy() {
    //  Clear the map, DOM and state change handler.
    this.#cellMap.removeCrosswordCells(this.#crosswordModel);
    this.#domGridParentElement.removeChild(this.crosswordGridView);
    this.#domCluesParentElement.removeChild(this.crosswordCluesView);
    this.#subscribers.forEach((s) => {
      s.remove();
    });
  }

  // Helper function to retrieve corresponding cell for cellElement
  cell = (cellElement) => {
    return this.#cellMap.getCell(cellElement);
  };

  // Helper function to retrieve corresponding cellElement for cell
  cellElement = (cell) => {
    return this.#cellMap.getCellElement(cell);
  };

  // Helper function to retrieve corresponding inputElement for cell
  inputElement = (cell) => {
    // The input element of a cellElement is the first child element.
    // Refer to #newCellElement()
    return this.cellElement(cell).children[0];
  };

  // Helper function to retrieve corresponding revealedElement for cell
  revealedElement = (cell) => {
    // The revealed element of a cellElement is the second or third child element.
    // Refer to #newCellElement()
    const childIndex = cell.clueLabel ? 2 : 1;
    return this.cellElement(cell).children[childIndex];
  };
  // Helper function to retrieve corresponding incorrectElement for cell
  incorrectElement = (cell) => {
    // The incorrect element of a cellElement is the third or fourth child element.
    // Refer to #newCellElement()
    const childIndex = cell.clueLabel ? 3 : 2;
    return this.cellElement(cell).children[childIndex];
  };

  // Helper function to access API event handler functions
  userEventHandler(id) {
    trace(`elementEventHandler:${id}`);
    assert(
      this.#userEventHandlers.hasOwnProperty(id),
      `userEventHandler: [${id}] is not a CrosswordController event handler.`,
    );
    // We dereference userEventHandlers object like an array to get property 'id'
    // We bind the controller object as the context for 'this' references in the event handler,
    // otherwise event.currentTarget is the context
    return this.#userEventHandlers[id].bind(this);
  }

  get userEventHandlerIds() {
    return Object.keys(this.#userEventHandlers);
  }

  // Helper function to bind Controller user-event-handler to webpage
  // DOM elementId.
  bindEventHandlerToId = function (
    elementId,
    eventName = 'click',
    dom = document,
  ) {
    const element = eid(elementId, dom);
    if (element) {
      element.addEventListener(eventName, this.userEventHandler(elementId));
    }
  }.bind(this);

  // Helper function to bind Controller user-event-handlers to a collection
  // of webpage DOM elementIds.
  bindEventHandlersToIds = function (
    // all controller user event handlers
    elementIds = this.userEventHandlerIds,
    eventName = 'click',
    dom = document,
  ) {
    elementIds.forEach((id) => {
      this.bindEventHandlerToId(id, eventName, dom);
    });
  }.bind(this);

  // Helper function to bind Controller user-event-handler to webpage
  // DOM element class. Using element class names rather than element Ids
  // allows us to add controller user-event-handler to more than one
  // DOM element
  bindEventHandlerToClass = function (
    elementClass,
    eventName = 'click',
    dom = document,
  ) {
    const elements = ecs(elementClass, dom);
    elements.forEach((e) => {
      e.addEventListener(eventName, this.userEventHandler(elementClass));
    });
  }.bind(this);

  // Helper function to bind Controller user-event-handlers to a collection
  // of webpage DOM elementIds.
  bindEventHandlersToClass = function (
    // all user event handlers
    elementClasses = this.userEventHandlerIds,
    eventName = 'click',
    dom = document,
  ) {
    elementClasses.forEach((ec) =>
      this.bindEventHandlerToClass(ec, eventName, dom),
    );
  }.bind(this);

  // Accessors for public property currentCell
  get currentCell() {
    return this.#current.cell;
  }
  set currentCell(cell) {
    trace(`set currentCell: (${cell.x},${cell.y})`);
    if (cell !== this.#current.cell) {
      if (this.#current.cell) {
        this.#deHighlightCell(this.#current.cell);
      }
      this.#current.cell = cell;
      cell?.cellElement.children[0].focus();
      this.#highlightCell(cell);
    }
  }

  // Accessors for public property currentClue
  get currentClue() {
    return this.#current.clue;
  }
  set currentClue(clue) {
    if (clue !== this.#current.clue) {
      if (this.#current.clue) {
        this.#deactivateClue(this.#current.clue);
      }
      trace(`set currentClue: '${clue.code}'`);
      this.#current.clue = clue;
      this.#activateClue(clue);
      // check if new current clue includes current cell
      if (!this.currentClue.cells.includes(this.currentCell)) {
        // switch to first cell of new current clue
        this.currentCell = this.currentClue.cells[0];
      }
      this.#stateChange('clueSelected', clue);
    }
  }

  // Accessor for crosswordModel
  get crosswordModel() {
    return this.#crosswordModel;
  }

  // Accessors for public event publisher
  get addEventsListener() {
    return this.#addEventsListener;
  }

  // Accessor for crosswordGridView
  get crosswordGridView() {
    return this.#crosswordGridView;
  }

  // Accessor for crosswordCluesView
  get crosswordCluesView() {
    return this.#crosswordCluesView;
  }

  // Accessor for controllerEventNames
  get controllerEventNames() {
    return this.#controllerEventNames;
  }

  //// methods ////

  testCurrentClue() {
    trace(`testCurrentClue:${this.currentClue.code}`);
    const showIncorrect = true;
    const outcome = testClue(this, this.currentClue, showIncorrect);
    this.#stateChange('clueTested', outcome);
    if (outcome === Outcome.Correct) {
      // allow other events to complete before the tadah! moment
      setTimeout(() => {
        this.#stateChange('clueSolved', this.currentClue);
      }, SOLUTION_TIMEOUT);
    }
    return outcome;
  }

  testCrossword() {
    trace('testCrossword');
    const showIncorrect = true;
    // call the crossword-controller-helper testCrossword
    const outcome = testCrossword(this, showIncorrect);
    this.#stateChange('crosswordTested', outcome);
    if (outcome === Outcome.Correct) {
      // allow other events to complete before the tadah! moment
      setTimeout(() => {
        this.#stateChange('crosswordSolved', this.crosswordModel);
      }, SOLUTION_TIMEOUT);
    }
    return outcome;
  }

  revealCurrentCell() {
    // trace('revealCurrentCell');
    revealCell(this, this.currentCell);
    this.#stateChange('cellRevealed', this.currentCell);
    this.#checkSolved();
  }

  revealCurrentClue() {
    // trace('revealCurrentClue');
    revealClue(this, this.currentClue);
    this.#stateChange('clueRevealed', this.currentClue);
    this.#checkSolved();
  }

  revealCrossword() {
    trace('revealCrossword');
    revealCrossword(this);
    this.#stateChange('crosswordRevealed', this.crosswordModel);
    //No crossword solved notification
  }

  resetCurrentClue() {
    resetClue(this, this.currentClue);
    this.#stateChange('clueReset', this.currentClue);
  }

  resetCrossword() {
    trace('resetCrossword');
    resetCrossword(this);
    this.#stateChange('crosswordReset', this.crosswordModel);
  }

  cleanCurrentClue() {
    cleanClue(this, this.currentClue);
    this.#stateChange('clueCleaned', this.currentClue);
  }

  cleanCrossword() {
    trace('cleanCrossword');
    cleanCrossword(this);
    this.#stateChange('crosswordCleaned', this.crosswordModel);
  }

  //// Private methods ////

  // Accessor for document associated with DOM
  get #document() {
    return this.#domGridParentElement.ownerDocument;
  }
  // Accessor for window associated with DOM
  get #window() {
    return this.#document.defaultView;
  }

  // Helper function to subscribe to CrosswordController events.
  // Refer to #controllerEventNames for complete list of events.
  #addEventsListener = (eventNames, callback) => {
    eventNames.forEach((en) => {
      assert(
        this.controllerEventNames.includes(en),
        `addEventsListener: event [${en}] is not a CrosswordController event.`,
      );
      this.#subscribers.push(this.#pubSub.subscribe(en, callback));
    });
  };

  #currentClueChanged(eventCell) {
    const across = eventCell.acrossClue;
    const down = eventCell.downClue;
    let context;
    const previousClue = this.currentClue;

    //  If we have clicked somewhere which is part of the current clue, we
    //  will not need to change it (we won't toggle either).
    if (
      this.currentClue &&
      (this.currentClue === across || this.currentClue === down)
    ) {
      context = 'in CurrentClue';
    } else if ((across && !down) || (!across && down)) {
      //  If we have an across clue XOR a down clue, pick the one we have.
      this.currentClue = across || down;
      context = `${this.currentClue === across ? 'across' : 'down'} (xor)`;
    } else if (
      across &&
      this.currentClue &&
      (across === this.currentClue.previousClueSegment ||
        across === this.nextClueSegment)
    ) {
      //  We've got across. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      this.currentClue = across;
      context = 'across (multi-segment)';
    } else if (
      down &&
      this.currentClue &&
      (down === this.currentClue.previousClueSegment ||
        down === this.nextClueSegment)
    ) {
      //  We've got down. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      this.currentClue = down;
      context = 'down (multi-segment)';
    } else {
      //  ...otherwise, Prefer across, unless we're on the first letter of a down clue only
      this.currentClue =
        eventCell.downClueLetterIndex === 0 &&
        eventCell.acrossClueLetterIndex !== 0
          ? down
          : across;
      context = `${
        this.currentClue === across ? 'across' : 'down'
      } (first letter of down only or default across)`;
    }

    trace(`currentClueChanged: ${context}`);
    return this.currentClue !== previousClue;
  }

  /**
   * **#stateChange**: Publish crossword events to the handler allocated/subscribed to _onStateChange_.
   * @param {*} message The name of the event to be published
   * @param {*} data not used
   */
  #stateChange(message, data) {
    trace(`stateChange: ${message}`);
    this.#pubSub.publish(message, data);
  }

  #checkSolved() {
    trace('checkSolved');
    if (checkSolved(this) === Outcome.Correct) {
      // allow other events to complete before the tadah! moment
      setTimeout(() => {
        this.#stateChange('crosswordSolved', this.crosswordModel);
      }, SOLUTION_TIMEOUT);
    }
  }

  /**
   * **newCrosswordCluesView**: build a crossword clues DOM element
   * with separate blocks for across and down clues.
   * @param {*} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
   * @param {*} controller the crossword controller object
   * @returns the clues DOM element
   */
  #newCrosswordCluesView(document, controller) {
    trace('newCrosswordCluesView');
    assert(document, '#newCrosswordCluesView: [document] is null or undefined');
    assert(
      controller,
      '#newCrosswordCluesView: [controller] is null or undefined',
    );

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
        labelElement.innerHTML = `${mc.clueLabel}`;
        clueElement.appendChild(labelElement);

        let textElement = document.createElement('span');
        addClass(textElement, 'crossword-clue-text');
        textElement.innerHTML = `${mc.clueText} ${mc.answerLengthText}`;
        clueElement.appendChild(textElement);

        // add handler for click event
        clueElement.addEventListener('click', (element) => {
          trace(`clue(${mc.clueLabel}):click`);
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
        const parentClue = currentClue?.parentClue;

        return (
          currentClue &&
          parentClue &&
          (parentClue === clue ||
            parentClue.connectedClues.indexOf(clue) !== -1)
        );
      }
    }

    // Build the DOM for the crossword clues.
    let view = {
      wrapper: document.createElement('div'),
      acrossClues: newClueBlockElement('crossword-across-clues', 'Across'),
      downClues: newClueBlockElement('crossword-down-clues', 'Down'),
    };

    addClass(view.wrapper, 'crossword-clues');

    addClueElements(
      controller,
      view.acrossClues,
      controller.crosswordModel.acrossClues,
    );
    view.wrapper.appendChild(view.acrossClues);

    addClueElements(
      controller,
      view.downClues,
      controller.crosswordModel.downClues,
    );
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

  // Helper function for #newCellElement()
  #addEventListeners(cellElement, inputElement) {
    const controller = this;
    //  Listen for focus events.
    inputElement.addEventListener('focus', (event) => {
      trace('event:focus');
      //  Get the cell data.
      const eventCell = controller.cell(event.target.parentNode);
      if (controller.#currentClueChanged(eventCell)) {
        this.#stateChange('clueSelected', controller.currentClue);
      }
    });

    //  Listen for click events.
    inputElement.addEventListener('click', (event) => {
      trace('event:click');
      const eventCell = controller.cell(event.target.parentNode);
      // Test for second click on same cell
      if (eventCell === controller.currentCell) {
        toggleClueDirection(controller, eventCell);
      }
      controller.currentCell = eventCell;
    });

    //  Listen for keydown events.
    cellElement.addEventListener('keydown', (event) => {
      trace(`event:keydown keycode=${event.keyCode}`);

      //  Get the cell element and cell data.
      const eventCell = controller.cell(event.target.parentNode);
      const { model } = eventCell;
      let clue = controller.currentClue;

      switch (event.keyCode) {
        case BACKSPACE:
          //  We don't want default behaviour.
          event.preventDefault();
          trace('BACKSPACE');
          // Fill cell with SPACE
          setCellContent(controller, event, ' ');
          // remove any visual flag in cell that letter is incorrect
          hideElement(controller.incorrectElement(eventCell));

          const letterIndex =
            eventCell.acrossClue === clue
              ? eventCell.acrossClueLetterIndex
              : eventCell.downClueLetterIndex;
          trace(`BACKSPACE: current cell index: ${letterIndex}`);
          const previousIndex = letterIndex - 1;

          if (previousIndex >= 0) {
            // Move to previous character
            trace(`Focussing previous cell index: ${previousIndex}`);
            controller.currentCell = clue.cells[previousIndex];
          } else if (previousIndex === -1 && clue.previousClueSegment) {
            //  If we are at the start of the clue and we have a previous segment, select it.
            trace('Focussing previous segment last cell');
            controller.currentCell = last(clue.previousClueSegment.cells);
          }

          break;

        case TAB:
          //  We don't want default behaviour.
          event.preventDefault();
          trace('TAB');

          // get anchor segment of multi-segment clue
          if (clue.parentClue) {
            clue = clue.parentClue;
          }
          // Get the next clue.
          // Skip clues which are part of a multi-segment clue and not the anchor segment.
          const searchClues = clue.isAcross
            ? anchorSegmentClues(model.acrossClues)
            : anchorSegmentClues(model.downClues);

          trace(
            `tab: across (${clue.isAcross}) searchClues.length (${searchClues.length})`,
          );

          let newClue = null;
          const sci = searchClues.indexOf(clue);
          assert(
            sci !== -1,
            `keydown(TAB): clue '${clue.code}' not found in searchClues`,
          );

          if (event.shiftKey) {
            //  Shift-tab selects previous clue
            if (sci > 0) {
              // Selects previous clue in same direction if not the first clue
              newClue = searchClues[sci - 1];
            } else {
              // On first clue, wrap to last clue in other direction
              newClue = clue.isAcross
                ? model.downClues[model.downClues.length - 1]
                : model.acrossClues[model.acrossClues.length - 1];
            }
          } else if (sci < searchClues.length - 1) {
            // Tab selects next clue in same direction if not the last clue
            newClue = searchClues[sci + 1];
          } else {
            // On last clue, tab wraps to first clue in other direction
            newClue = clue.isAcross ? model.downClues[0] : model.acrossClues[0];
          }

          // Select the new clue.
          controller.currentClue = newClue;

          break;

        case ENTER:
          //  We don't want default behaviour.
          event.preventDefault();
          trace('ENTER');
          toggleClueDirection(controller, eventCell);

          break;

        case DELETE:
          //  We don't want default behaviour.
          event.preventDefault();
          trace('DELETE');
          // Fill cell with SPACE
          setCellContent(controller, event, ' ');
          // remove any visual flag in cell that letter is incorrect
          hideElement(controller.incorrectElement(eventCell));

          break;

        default:
          break;
      }
    });

    //  Listen for keypress events.
    cellElement.addEventListener('keypress', (event) => {
      trace('event:keypress');
      // We've just pressed a key that generates a character.
      // Stop default handling for input component
      event.preventDefault();

      //  Get cell data.
      const eventCell = controller.cell(event.target.parentNode);
      const clue = controller.currentClue;

      // Convert keyCode to upper-case character
      const character = String.fromCharCode(event.keyCode).toUpperCase();
      trace(`character:<${character}>`);

      if (echoingKeyPressCharacters.test(character)) {
        //  Sets the letter in the current clue cell.
        trace(`Setting content: <${character}>`);
        setCellContent(controller, event, character);
        // remove any visual flag in cell that letter is incorrect
        hideElement(controller.incorrectElement(eventCell));
        // test for crossword completion
        this.#checkSolved();
      }

      if (advancingKeyPressCharacters.test(character)) {
        //  Move to the next cell in the clue.
        trace('Advancing to next cell');
        const currentCellIndex =
          eventCell.acrossClue === clue
            ? eventCell.acrossClueLetterIndex
            : eventCell.downClueLetterIndex;
        trace(`current cell index: ${currentCellIndex}`);
        const nextCellIndex = currentCellIndex + 1;

        if (nextCellIndex < clue.cells.length) {
          // We are still within the bounds of the current clue (segment)
          trace(`Focussing next cell index: ${nextCellIndex}`);
          controller.currentCell = clue.cells[nextCellIndex];
        } else if (clue.nextClueSegment) {
          //  We are at the end of the clue segment and there is a next segment.
          trace('Focussing next answer segment cell index 0');
          controller.currentClue = clue.nextClueSegment;
        }
      }
    });

    //  Listen for keyup events.
    cellElement.addEventListener('keyup', (event) => {
      trace('event:keyup');
      const eventCell = controller.cell(event.target.parentNode);

      switch (event.keyCode) {
        case LEFT:
          moveLeft(controller, eventCell);
          break;
        case UP:
          moveUp(controller, eventCell);
          break;
        case RIGHT:
          moveRight(controller, eventCell);
          break;
        case DOWN:
          moveDown(controller, eventCell);
          break;
        //  No action needed for any other keys.
        default:
          break;
      }
    });
  }

  /**
   * **newCellElement**: build a crossword grid _cell_ DOM element
   * with child elements and event listeners to handle user interaction events.
   * @param {*} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
   * @param {*} cell the representation of this grid cell in the  _crosswordModel_.
   * @returns the DOM element for the _cell_
   */
  #newCellElement(document, cell) {
    // trace(`newCellElement(${cell.x},${cell.y})`);
    const cellElement = document.createElement('div');
    addClass(cellElement, 'cwcell');
    //  eslint-disable-next-line no-param-reassign
    cell.cellElement = cellElement;

    //  Add a class.
    addClass(cellElement, cell.light ? 'light' : 'dark');

    //  If the cell is dark, we are done.
    if (!cell.light) {
      return cellElement;
    }

    //  Light cells also need an input.
    const inputElement = document.createElement('input');
    inputElement.maxLength = 1;
    if (cell.answer) {
      inputElement.value = cell.answer;
    }
    cellElement.appendChild(inputElement);

    //  We may need to add a clue label.
    if (cell.clueLabel) {
      const clueLabel = document.createElement('div');
      addClass(clueLabel, 'cwclue-label');
      clueLabel.innerHTML = cell.clueLabel;
      cellElement.appendChild(clueLabel);
    }

    const revealedIndicator = document.createElement('div');
    // Remove 'hidden' div class to reveal
    addClasses(revealedIndicator, ['cwcell-revealed', 'hidden']);
    cellElement.appendChild(revealedIndicator);

    const incorrectIndicator = document.createElement('div');
    // Toggle 'hidden' div class to reveal/hide
    addClasses(incorrectIndicator, ['cwcell-incorrect', 'hidden']);
    cellElement.appendChild(incorrectIndicator);

    //  Check for clue answer segment terminator.
    if (',-'.includes(cell.acrossTerminator)) {
      addClass(inputElement, 'cw-across-word-separator');
    } else if (',-'.includes(cell.downTerminator)) {
      addClass(inputElement, 'cw-down-word-separator');
    }

    //// Event handlers
    this.#addEventListeners(cellElement, inputElement);
    return cellElement;
  }

  #activateClue(clue) {
    //  Highlight the clue cells. 'parentClue' is set if this is the later part of
    //  a multi-segment clue.
    const clues = clue.parentClue
      ? [clue.parentClue].concat(clue.parentClue.connectedClues)
      : [clue];
    clues.forEach((c) => {
      c.cells.forEach((cell) => {
        addClass(this.inputElement(cell), 'active');
      });
    });
  }

  #deactivateClue(clue) {
    //  Highlight the clue cells. 'parentClue' is set if this is the later part of
    //  a multi-segment clue.
    const clues = clue.parentClue
      ? [clue.parentClue].concat(clue.parentClue.connectedClues)
      : [clue];
    clues.forEach((c) => {
      c.cells.forEach((cell) => {
        removeClass(this.inputElement(cell), 'active');
      });
    });
  }

  #highlightCell(cell) {
    assert(cell, '#highLightCell: cell is undefined');
    trace('#highlightCell');
    addClass(this.inputElement(cell), 'highlighted');
  }

  #deHighlightCell(cell) {
    trace('#deHighlightCell');
    assert(cell, '#deHighLightCell: cell is undefined');
    removeClass(this.inputElement(cell), 'highlighted');
  }
}

export { CrosswordController };
