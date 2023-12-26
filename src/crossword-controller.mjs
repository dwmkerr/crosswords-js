import { CellMap } from './cell-map.mjs';
import { newCrosswordCluesView } from './crossword-cluesview.mjs';
import {
  Outcome,
  checkSolved,
  cleanClue,
  cleanCrossword,
  resetClue,
  resetCrossword,
  revealCell,
  revealClue,
  revealCrossword,
  setCellText,
  testClue,
  testCrossword,
} from './crossword-controller-helpers.mjs';
import {
  EventKey,
  hideElement,
  moveToCellAhead,
  newCrosswordGridView,
  setCellContent,
  styleCurrentCell,
  styleCurrentClue,
  toggleClueDirection,
} from './crossword-gridview.mjs';
import {
  newCrosswordDefinition,
  newCrosswordModel,
} from './crossword-model.mjs';
import {
  defaultKeyDownBinding,
  defaultKeyUpBinding,
} from './default-eventbindings.mjs';
import { assert, ecs, eid, newPubSub, trace } from './helpers.mjs';

/**
 * Build a new CrosswordController object
 * @param {*} crosswordDefinition A crossword puzzle document imported or parsed to create an Object.
 * @param {*} domGridParentElement The webpage location (DOM element) for the GridView.
 * @param {*} domCluesParentElement The webpage location (DOM element) for the CluesView.
 * @returns A CrosswordController on successful creation, or null on failure.
 */

function newCrosswordController(
  crosswordDefinition,
  domGridParentElement,
  domCluesParentElement,
) {
  const controller = new CrosswordController(
    crosswordDefinition,
    domGridParentElement,
    domCluesParentElement,
  );
  return controller?.isValid ? controller : null;
}

// Regular expressions for keypress processing.
// All pressed keys are lower-cased before testing
//  - see'keypress' event listener
const echoingKeyPressCharacters = /^[a-z]$/;
const advancingKeyPressCharacters = /^[a-z]$/;

// Allow DOM event flushing after clue or crossword solution.
const publicationDelayMs = 5;

/** **CrosswordController** - an [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
 * _Controller_ class for the _CrosswordsJS_ package.
 * Use this class to access the package API.
 */
class CrosswordController {
  #boundUserEventElements = [];
  #cellMap = new CellMap();
  #cluesView;
  #crosswordModel;
  #current = { clue: null, cell: null };
  #domCluesParentElement;
  #domGridParentElement;
  #gridView;
  #keyboardEventBindings = {};
  #lastMoveEvent;
  #pubSub = newPubSub();
  #eventSubscribers = [];
  #userEventHandlers;
  #isValidController = false;

  // Events published by the CrosswordController
  #controllerEventNames = [
    'cellRevealed',
    'clueCleaned',
    'clueIncomplete',
    'clueReset',
    'clueRevealed',
    'clueSelected',
    'clueSolved',
    'clueTested',
    'crosswordCleaned',
    'crosswordIncomplete',
    'crosswordLoaded',
    'crosswordReset',
    'crosswordRevealed',
    'crosswordSolved',
    'crosswordTested',
  ];

  //////////////////////////
  //// Lifecycle methods
  //////////////////////////

  constructor(
    crosswordDefinition,
    domGridParentElement,
    domCluesParentElement,
  ) {
    trace('CrosswordController constructor');
    assert(
      crosswordDefinition?.width,
      '[crosswordDefinition] argument is null/undefined or not a crossword definition',
    );
    assert(
      domGridParentElement?.ownerDocument,
      '[domGridParentElement] argument is null/undefined or not a DOM element',
    );
    // Optional argument but must be valid if provided
    assert(
      !domCluesParentElement || domCluesParentElement.ownerDocument,
      '[domCluesParentElement] argument is not a DOM element',
    );

    this.#domGridParentElement = domGridParentElement;
    this.#domCluesParentElement = domCluesParentElement;
    // Set keyboard event keyBindings. Must precede gridView construction
    this.setKeyboardEventBindings([defaultKeyDownBinding, defaultKeyUpBinding]);
    // Create model and views
    this.#isValidController = this.#bindDefinition(crosswordDefinition);
    if (this.isValid) {
      // Mapping of DOM idents (ids or classes) to event handler methods
      this.#mapDomIdentsToUserEventHandlers();
    }
  }

  //  Completely cleans up the crossword.
  destroy() {
    //  Clear the cellMap, DOM and state change handler.
    this.#cellMap = null;
    this.#crosswordModel = null;
    this.#gridParent?.removeChild(this.gridView);
    this.#cluesParent?.removeChild(this.cluesView);
    // Remove all subscribers
    this.#eventSubscribers.forEach((s) => {
      s.remove();
    });
    // Remove all user event handlers from DOM elements
    this.#boundUserEventElements.forEach((bl) => {
      const { element, eventName, handler } = bl;
      element.removeEventListener(eventName, handler);
    });
  }

  //////////////////////////
  //// Grid element helpers
  //////////////////////////

  // Helper function to retrieve corresponding cell for cellElement
  cell = (cellElement) => {
    return this.#cellMap.modelCell(cellElement);
  };

  // Helper function to retrieve corresponding cellElement for cell
  cellElement = (cell) => {
    if (!cell.light) {
      trace(`cellElement: dark cell! ${cell}`, 'warn');
    }
    // The input element of a cellElement is the cellElement.
    // Refer to ./crosswordGridView.mjs:newCellElement()
    return this.#cellMap.cellElement(cell);
  };

  // Helper function to set corresponding cellElement text for cell
  setCellElementText = (cell, character) => {
    assert(cell.light, `dark cell! ${cell}`);
    // The input element of a cellElement is the cellElement.
    // The first child of the cellElement is a Text node.
    // Refer to ./crosswordGridView.mjs:newCellElement()
    this.#cellMap.cellElement(cell).firstChild.nodeValue = character;
  };

  // Helper function to retrieve corresponding revealedElement for cell
  revealedElement = (cell) => {
    assert(cell.light, `dark cell! ${cell}`);
    // The revealed element of a cellElement is the second or third child element.
    // Refer to #newCellElement()
    const childIndex = cell.labelText ? 1 : 0;
    return this.#cellMap.cellElement(cell).children[childIndex];
  };

  // Helper function to retrieve corresponding incorrectElement for cell
  incorrectElement = (cell) => {
    assert(cell.light, `dark cell! ${cell}`);
    // The incorrect element of a cellElement is the third or fourth child element.
    // Refer to #newCellElement()
    const childIndex = cell.labelText ? 2 : 1;
    return this.#cellMap.cellElement(cell).children[childIndex];
  };

  //////////////////////////////////
  //// User EventHandler binding
  //////////////////////////////////

  // Helper function to access API event handler functions
  userEventHandler(id) {
    trace(`elementEventHandler:${id}`);
    assert(
      this.#userEventHandlers.hasOwnProperty(id),
      `[${id}] is not a CrosswordController event handler.`,
    );
    // We dereference userEventHandlers object like an array to get property 'id'.
    // Note: 'this' inside an event handler is event.currentTarget.
    // So, we must bind the controller object to 'this' to override
    return this.#userEventHandlers[id].bind(this);
  }

  // Helper function to bind Controller user-event-handler to webpage
  // DOM elementId.
  bindUserEventHandlerToId(elementId, eventName = 'click', dom = document) {
    const element = eid(elementId, dom);
    if (element) {
      const handler = this.userEventHandler(elementId);
      element.addEventListener(eventName, handler);
      this.#boundUserEventElements.push({ element, eventName, handler });
    }
  }

  // Helper function to bind Controller user-event-handlers to a collection
  // of webpage DOM elementIds.
  bindUserEventHandlersToIds(
    // all controller user event handlers
    elementIds = this.userEventHandlerIds,
    eventName = 'click',
    dom = document,
  ) {
    elementIds.forEach((id) => {
      this.bindUserEventHandlerToId(id, eventName, dom);
    });
  }

  // Helper function to bind Controller user-event-handler to webpage
  // DOM element class. Using element class names rather than element Ids
  // allows us to add controller user-event-handler to more than one
  // DOM element
  bindUserEventHandlerToClass(
    elementClass,
    eventName = 'click',
    dom = document,
  ) {
    const elements = ecs(elementClass, dom);
    elements.forEach((element) => {
      const handler = this.userEventHandler(elementClass);
      element.addEventListener(eventName, handler);
      this.#boundUserEventElements.push({ element, eventName, handler });
    });
  }

  // Helper function to bind Controller user-event-handlers to a collection
  // of webpage DOM elementIds.
  bindUserEventHandlersToClass(
    // all user event handlers
    elementClasses = this.userEventHandlerIds,
    eventName = 'click',
    dom = document,
  ) {
    elementClasses.forEach((ec) =>
      this.bindUserEventHandlerToClass(ec, eventName, dom),
    );
  }

  ////////////////////////////////
  //// Public property accessors
  ////////////////////////////////

  get isValid() {
    return this.#isValidController;
  }

  // Accessors for public property currentCell
  get currentCell() {
    return this.#current.cell;
  }
  set currentCell(newCell) {
    trace(`currentCell: ${newCell}`);
    const oldCell = this.currentCell;
    if (newCell !== oldCell) {
      this.#current.cell = newCell;
      this.cellElement(newCell).focus();
      styleCurrentCell(this, newCell, oldCell);
    }
  }

  // Accessors for public property currentClue
  get currentClue() {
    return this.#current.clue;
  }
  set currentClue(newClue) {
    const oldClue = this.currentClue;
    if (newClue !== oldClue) {
      trace(`currentClue: '${newClue}' [currentCell ${this.currentCell}]`);
      this.#current.clue = newClue;
      styleCurrentClue(this, newClue, oldClue);
      // check if new current clue includes current cell
      if (!this.currentClue.cells.includes(this.currentCell)) {
        // switch to first cell of new current clue
        this.currentCell = newClue.cells[0];
      }
      this.#stateChange('clueSelected', newClue);
    }
  }

  // Accessor for public property model
  get model() {
    return this.#crosswordModel;
  }

  // Accessor for public property gridView
  get gridView() {
    return this.#gridView;
  }

  // Accessor for public property cluesView
  get cluesView() {
    return this.#cluesView;
  }

  // Accessor for addEventsListener - public event publisher
  get addEventsListener() {
    return this.#addEventsListener;
  }

  // Accessor for public property controllerEventNames
  get controllerEventNames() {
    // Return array copy
    return [...this.#controllerEventNames];
  }

  // Accessors for public property lastMoveEvent
  get lastMoveEvent() {
    return this.#lastMoveEvent;
  }
  set lastMoveEvent(eventName) {
    const en = eventName.toLowerCase();
    assert(['click', 'focus'].includes(en), `unknown event: ${eventName}`);
    this.#lastMoveEvent = en;
  }
  // Accessor for public property userEventHandlerIds
  get userEventHandlerIds() {
    return Object.keys(this.#userEventHandlers);
  }

  //////////////////////////
  //// Public methods
  //////////////////////////

  /**
   * Programmatically set the content of a crossword grid cell
   * @param {*} cellElementId The id of the associated cell DOM element
   * @param {*} character The new text content for the cell.
   */
  setGridCell(cellElementId, character) {
    trace(`setCell:${cellElementId} '${character}}'`);
    const clearRevealed = true;
    setCellText(
      this,
      this.#cellMap.modelCell(cellElementId),
      character,
      clearRevealed,
    );
  }

  loadCrosswordSource(mimeType, crosswordSourceText, sourceFileName = '') {
    assert(mimeType, '[mimeType] is undefined or null');
    assert(crosswordSourceText, '[crosswordSourceText] is undefined or null');
    trace(`loadCrosswordSource: ${mimeType} ${sourceFileName}`);
    // Build a crossword definition
    const definition = newCrosswordDefinition(mimeType, crosswordSourceText);
    if (!definition) {
      trace(
        `loadCrosswordSource: invalid crossword definition "${sourceFileName}"`,
        'error',
      );
      return false;
    }

    return this.#bindDefinition(definition);
  }

  setKeyboardEventBindings(eventBindings) {
    assert(
      eventBindings?.length,
      '[eventBindings] argument is empty, null or undefined.',
    );
    const supportedEvents = ['keydown', 'keyup'];
    eventBindings.forEach((eb) => {
      assert(
        eb.eventName?.trim(),
        `Missing or empty "eventName" property for event binding.`,
      );
      const ebn = eb.eventName.trim().toLowerCase();
      assert(
        supportedEvents.includes(ebn),
        `Binding event name "${eb.eventName}" is not supported.`,
      );
      assert(
        eb.keyBindings?.length,
        `Missing or  empty "keyBindings" array property for [${ebn}].`,
      );
      trace(`setKeyboardEventBindings: Setting keyBindings for "${ebn}".`);
      this.#keyboardEventBindings[ebn] = eb.keyBindings;
    });
  }

  /////////////////////////////////
  //// Public user event handlers
  /////////////////////////////////

  testCurrentClue() {
    trace(`testCurrentClue:${this.currentClue}`);
    const showIncorrect = true;
    const outcome = testClue(this, this.currentClue, showIncorrect);
    this.#stateChange('clueTested', outcome);
    if (outcome === Outcome.correct) {
      this.#delayPublish('clueSolved', this.currentClue);
    } else if (outcome === Outcome.incomplete) {
      this.#delayPublish('clueIncomplete', this.currentClue);
    }
    return outcome;
  }

  testCrossword() {
    trace('testCrossword');
    const showIncorrect = true;
    // call the crossword-controller-helper testCrossword
    const outcome = testCrossword(this, showIncorrect);
    this.#stateChange('crosswordTested', outcome);
    if (outcome === Outcome.correct) {
      this.#delayPublish('crosswordSolved', this.#crosswordModel);
    } else if (outcome === Outcome.incomplete) {
      this.#delayPublish('crosswordIncomplete', this.#crosswordModel);
    }
    return outcome;
  }

  revealCurrentCell() {
    revealCell(this, this.currentCell);
    this.#stateChange('cellRevealed', this.currentCell);
    this.#checkSolved();
  }

  revealCurrentClue() {
    revealClue(this, this.currentClue);
    this.#stateChange('clueRevealed', this.currentClue);
    this.#checkSolved();
  }

  revealCrossword() {
    trace('revealCrossword');
    revealCrossword(this);
    this.#stateChange('crosswordRevealed', this.model);
    //No crosswordSolved event is published in this case
  }

  resetCurrentClue() {
    resetClue(this, this.currentClue);
    this.#stateChange('clueReset', this.currentClue);
  }

  resetCrossword() {
    trace('resetCrossword');
    resetCrossword(this);
    this.#stateChange('crosswordReset', this.model);
  }

  cleanCurrentClue() {
    cleanClue(this, this.currentClue);
    this.#stateChange('clueCleaned', this.currentClue);
  }

  cleanCrossword() {
    trace('cleanCrossword');
    cleanCrossword(this);
    this.#stateChange('crosswordCleaned', this.model);
  }

  //////////////////////////
  //// Private methods
  //////////////////////////

  // Accessor for document associated with DOM
  get #document() {
    return this.#gridParent.ownerDocument;
  }

  // Accessors for DOM parent/placeholder elements

  get #gridParent() {
    return this.#domGridParentElement;
  }

  get #cluesParent() {
    return this.#domCluesParentElement;
  }
  // Common logic for CrosswordController constructor and loadCrosswordSource()
  #bindDefinition(crosswordDefinition) {
    // Build a crossword model
    const model = newCrosswordModel(crosswordDefinition);
    if (!model) {
      trace('#bindDefinition: crosswordModel creation failed', 'error');
      return false;
    }

    // Do we have an existing model?
    if (this.model) {
      // Detach DOM elements dependent on old crosswordModel
      this.#gridParent.removeChild(this.gridView);
      this.#cluesParent?.removeChild(this.cluesView);
      // Clear all mappings for old model
      this.#cellMap = new CellMap();
    }
    ////  Rebuild and rebind for new model

    this.#crosswordModel = model;

    // (Re)build gridView and fill cellMap
    this.#gridView = newCrosswordGridView(
      this.#document,
      this.model,
      this.#cellMap,
    );

    // For light cells, wire up controller event listeners
    this.#cellMap.modelCells
      .filter((cell) => cell.light)
      .forEach((lc) => {
        this.#addKeyboardEventListeners(lc.cellElement);
        this.#addCellEventListeners(this.cellElement(lc));
      });

    //  Add the crossword grid to the webpage DOM
    this.#gridParent.appendChild(this.gridView);

    // Build the DOM for the crossword clues.
    if (this.#cluesParent) {
      this.#cluesView = newCrosswordCluesView(this.#document, this);
      //  Add the crossword clues to the webpage DOM
      this.#cluesParent.appendChild(this.cluesView);
    }

    // Select the first "across" head clue segment when the grid is complete and visible.
    this.currentClue = this.model.acrossClues.headSegments[0];

    // We're done! Publish event and go.
    this.#stateChange('crosswordLoaded', crosswordDefinition);
    return true;
  }

  // Helper function for constructor
  #mapDomIdentsToUserEventHandlers = () => {
    // Mapping of DOM element idents (ids or classes) to event handler methods
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
  };

  // Helper function to subscribe to CrosswordController events.
  // Refer to #controllerEventNames for complete list of events.
  #addEventsListener = (eventNames, callback) => {
    eventNames.forEach((en) => {
      assert(
        this.controllerEventNames.includes(en),
        `event [${en}] is not a CrosswordController event.`,
      );
      this.#eventSubscribers.push(this.#pubSub.subscribe(en, callback));
    });
  };

  // Helper for multi-segment current clue
  #isSiblingClue = (clue) => {
    return (
      clue &&
      (clue === this.currentClue.previousClueSegment ||
        clue === this.currentClue.nextClueSegment)
    );
  };

  #hasClueChanged = (focusCell) => {
    // Helper
    const resolution = (focusCell, newCurrentClue) => {
      if (newCurrentClue !== this.currentClue) {
        trace(
          `Clue has changed [was ${this.currentClue}, ` +
            `focused ${focusCell}] => ${newCurrentClue}`,
        );
        this.currentClue = newCurrentClue;
      }
    };

    // assigned values below are clueModel references or undefined
    const [previous, cellAcross, cellDown, ai, di] = [
      this.currentClue,
      focusCell.acrossClue,
      focusCell.downClue,
      focusCell.acrossClueLetterIndex,
      focusCell.downClueLetterIndex,
    ];
    //  We are in the current clue
    if ([cellAcross, cellDown].includes(this.currentClue)) {
      resolution(focusCell, this.currentClue);
    } else if (cellAcross ? !cellDown : cellDown) {
      //  We have an across clue or a down clue, but not both (i.e. xor).
      resolution(focusCell, cellAcross ?? cellDown);
    } else if (this.#isSiblingClue(cellAcross)) {
      //  We've got cellAcross. If we are moving between clue segments,
      //  choose the next/previous segment
      resolution(focusCell, cellAcross);
    } else if (this.#isSiblingClue(cellDown)) {
      //  We've got cellDown. If we are moving between clue segments,
      //  choose the next/previous segment
      resolution(focusCell, cellDown);
    } else {
      //  Prefer cellAcross, unless we're on the start of a down clue
      //  and not the start of an across clue
      resolution(focusCell, di === 0 && ai !== 0 ? cellDown : cellAcross);
    }
    return this.currentClue !== previous;
  };

  /**
   * **#stateChange**: Publish an event to the listeners subscribed to _onStateChange_.
   * @param {*} eventName The name of the event to be published
   * @param {*} data not used
   */
  #stateChange(eventName, data) {
    trace(`stateChange: ${eventName}`);
    this.#pubSub.publish(eventName, data);
  }

  // Flush DOM event queue before publishing event
  // Used to publish user notification events so pending events complete first.
  #delayPublish(eventName, eventData) {
    assert(
      this.controllerEventNames.includes(eventName),
      `unknown event "${eventName}"`,
    );
    setTimeout(() => {
      this.#stateChange(eventName, eventData);
    }, publicationDelayMs);
  }

  // Helper to publish crosswordSolved event if the crossword is solved
  #checkSolved() {
    trace('checkSolved');
    if (checkSolved(this) === Outcome.correct) {
      this.#delayPublish('crosswordSolved', this.model);
    }
  }

  // Assign event handlers to cell's input element
  #addCellEventListeners(cellElement) {
    assert(cellElement, 'cellElement is null or undefined');
    const controller = this;

    // 1. A user clicking on or touching an unfocussed cellElement generates
    //    two events (focus, click)
    // 2. A user clicking on a focussed cellElement only produces a click event
    // 3. Keyboard-based movements set currentCell programmatically,
    //    and the setter method calls element.focus() only, AFTER setting
    //    the currentCell value.

    //  Listen for focus events.
    cellElement.addEventListener('focus', (event) => {
      //  Get the cell data.
      const eventCell = controller.cell(event.target);
      trace(`event:focus ${eventCell}`);
      // Have this event fired as a result of a touch or mouse click?
      if (controller.currentCell !== eventCell) {
        controller.currentCell = eventCell;
      }
      controller.lastMoveEvent = 'focus';
      controller.#hasClueChanged(eventCell);
    });

    //  Listen for click events.
    cellElement.addEventListener('click', (event) => {
      const eventCell = controller.cell(event.target);
      trace(`event:click ${eventCell}`);
      // Test for second click on same cell
      if (eventCell === controller.currentCell) {
        // We don't want this to toggle clue direction if
        // immediately preceding event was a focus:
        if (controller.lastMoveEvent === 'click') {
          toggleClueDirection(controller, eventCell);
        }
      } else {
        controller.currentCell = eventCell;
      }
      controller.lastMoveEvent = 'click';
    });
  }

  // Assign keyboard event handlers to cell element
  #addKeyboardEventListeners(cellElement) {
    const controller = this;

    // Iterate over bindable keyboard events
    Object.keys(controller.#keyboardEventBindings).forEach((eventName) => {
      const keyBindings = controller.#keyboardEventBindings[eventName];
      assert(keyBindings, `"${eventName}" bindings are null or undefined.`);
      cellElement.addEventListener(eventName, (event) => {
        const eventKey = event.key;
        trace(`event:${eventName} key=[${eventKey}]`);
        const keyBinding = keyBindings.find((kb) => kb.key === eventKey);
        const ekName = EventKey.name(eventKey);
        //  We don't want directional KeyboardEvents to be handled beyond the cellElement.
        const preventDefault = ['left', 'right', 'up', 'down'].includes(ekName);

        if (keyBinding) {
          //  We don't want KeyboardEvents to be handled beyond the cellElement.
          event.preventDefault();
          trace(
            event.shiftKey
              ? `SHIFT+${ekName.toUpperCase()}`
              : ekName.toUpperCase(),
          );
          const eventCell = controller.cell(event.target);
          keyBinding.action(controller, event, eventCell);
        } else if (preventDefault) {
          event.preventDefault();
        }
      });
    });

    //  Listen for keypress events.
    cellElement.addEventListener('keypress', (event) => {
      trace('event:keypress');
      // We've just pressed a key that generates a character.
      // Stop event propagation beyond cellElement
      event.preventDefault();
      //  Get cell data.
      const [eventCell, character] = [controller.cell(event.target), event.key];
      const [testCharacter, displayCharacter] = [
        character.toLowerCase(),
        character.toUpperCase(),
      ];

      if (echoingKeyPressCharacters.test(testCharacter)) {
        //  Sets the letter in the current clue cell.
        trace(`Setting cell content: [${displayCharacter}]`);
        setCellContent(controller, event, displayCharacter);
        // remove any visual flag in cell that letter is incorrect
        hideElement(controller.incorrectElement(eventCell));
        // test for crossword completion
        controller.#checkSolved();
      }

      if (advancingKeyPressCharacters.test(testCharacter)) {
        //  Move to the next cell in the clue.
        trace('Advancing to next cell');
        moveToCellAhead(controller, eventCell);
      }
    });
  }
}

export { CrosswordController, newCrosswordController };
