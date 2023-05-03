import { CellMap } from './cell-map.mjs';
import {
  addClass,
  addClasses,
  assert,
  removeClass,
  trace,
} from './helpers.mjs';
import {
  anchorSegmentClues,
  cleanCell,
  cleanClue,
  hideElement,
  resetCell,
  resetClue,
  revealCell,
  revealClue,
  testCell,
  testClue,
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

/** **CrosswordController** - an [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
 * _Controller_ class for the _CrosswordsJS_ package. Use this class to access the package API.
 */
class CrosswordController {
  #cellMap;
  #crosswordGridView;
  #crosswordCluesView;
  #crosswordModel;
  #current;
  #domGridParentElement;
  #domCluesParentElement;
  #onStateChanged;
  #elementEventHandlers;

  constructor(crosswordModel, domGridParentElement, domCluesParentElement) {
    trace('CrosswordController constructor');
    assert(
      crosswordModel,
      'CrosswordController: crosswordModel is null or undefined'
    );
    assert(
      domGridParentElement,
      'CrosswordController: domGridParentElement is null or undefined'
    );
    assert(
      domCluesParentElement,
      'CrosswordController: domCluesParentElement is null or undefined'
    );
    this.#crosswordModel = crosswordModel;
    this.#cellMap = new CellMap();
    this.#domGridParentElement = domGridParentElement;
    this.#domCluesParentElement = domCluesParentElement;
    this.#current = { clue: null, cell: null };
    //  Build the DOM for the crossword grid.
    this.#crosswordGridView = this.#document.createElement('div');
    addClass(this.#crosswordGridView, 'crossword-grid');

    // Build the DOM for the crossword clues.
    if (domCluesParentElement) {
      this.#crosswordCluesView = this.#newCrosswordCluesView(
        this.#document,
        this
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

    this.#elementEventHandlers = {
      'reveal-cell': this.revealCurrentCell.bind(this),
      'clean-clue': this.cleanCurrentClue.bind(this),
      'reset-clue': this.resetCurrentClue.bind(this),
      'reveal-clue': this.revealCurrentClue.bind(this),
      'test-clue': this.testCurrentClue.bind(this),
      'clean-crossword': this.cleanCrossword.bind(this),
      'reset-crossword': this.resetCrossword.bind(this),
      'reveal-crossword': this.revealCrossword.bind(this),
      'test-crossword': this.testCrossword.bind(this),
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
    this.onStateChanged = null;
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
  #elementEventHandler(id) {
    trace(`elementEventHandler:${id}`);
    // We dereference elementEventHandlers object like an array to get property 'id'
    return this.#elementEventHandlers[id];
  }
  elementEventHandler = this.#elementEventHandler.bind(this);

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
      cell && cell.cellElement.children[0].focus();
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
      this.#stateChange('clueSelected');
    }
  }

  // Accessor for crosswordModel

  get crosswordModel() {
    return this.#crosswordModel;
  }

  // Accessors for public event publisher onStateChanged
  get onStateChanged() {
    return this.#onStateChanged;
  }
  set onStateChanged(eventHandler) {
    this.#onStateChanged = eventHandler;
  }

  // Accessor for crosswordGridView
  get crosswordGridView() {
    return this.#crosswordGridView;
  }

  // Accessor for crosswordCluesView
  get crosswordCluesView() {
    return this.#crosswordCluesView;
  }
  //// API methods ////

  testCurrentClue() {
    trace(`testCurrentClue:${this.currentClue.code}`);
    testClue(this, this.currentClue);
    this.#stateChange('clueTested');
  }

  testCrossword() {
    trace('testCrossword');
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          testCell(this, cell);
        });
    });
    this.#stateChange('crosswordTested');
  }

  revealCurrentCell() {
    revealCell(this, this.currentCell);
    this.#stateChange('cellRevealed');
  }

  revealCurrentClue() {
    revealClue(this, this.currentClue);
    this.#stateChange('clueRevealed');
  }

  revealCrossword() {
    trace('revealCrossword');
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          revealCell(this, cell);
        });
    });
    this.#stateChange('crosswordRevealed');
  }

  resetCurrentClue() {
    resetClue(this, this.currentClue);
    this.#stateChange('clueReset');
  }

  resetCrossword() {
    trace('resetCrossword');
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          resetCell(this, cell);
        });
    });
    this.#stateChange('crosswordReset');
  }

  cleanCurrentClue() {
    cleanClue(this, this.currentClue);
    this.#stateChange('clueCleaned');
  }

  cleanCrossword() {
    trace('cleanCrossword');
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          cleanCell(this, cell);
        });
    });
    this.#stateChange('crosswordCleaned');
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
   * - Events: _cellRevealed_,_clueReset_,_clueRevealed_,_clueSelected_,_clueTested_,_crosswordReset_,_crosswordRevealed_,_crosswordTested_
   */
  #stateChange(message, data) {
    trace(`stateChange: ${message}`);
    this.#onStateChanged &&
      this.#onStateChanged({
        message,
        data,
      });
  }

  #newCrosswordCluesView(document, controller) {
    trace('newCrosswordCluesView');
    assert(document, '#newCrosswordCluesView: [document] is null or undefined');
    assert(
      controller,
      '#newCrosswordCluesView: [controller] is null or undefined'
    );

    function addClueElements(controller, viewClues, modelClues) {
      modelClues.forEach((mc) => {
        let clueElement = document.createElement('div');
        addClass(clueElement, 'crossword-across-clue');

        let labelElement = document.createElement('span');
        addClass(labelElement, 'clue-label');
        labelElement.innerHTML = `${mc.clueLabel}`;
        clueElement.appendChild(labelElement);

        let textElement = document.createElement('span');
        addClass(textElement, 'clue-text');
        textElement.innerHTML = `${mc.clueText} ${mc.answerLengthText}`;
        clueElement.appendChild(textElement);

        viewClues.appendChild(clueElement);
        clueElement.addEventListener('click', (element) => {
          trace(`clue(${mc.clueLabel}):click`);
          // eslint-disable-next-line no-param-reassign
          controller.currentClue = mc;
        });
      });
    }

    // Build the DOM for the crossword clues.
    let view = {
      wrapper: document.createElement('div'),
      acrossClues: document.createElement('div'),
      downClues: document.createElement('div'),
    };

    addClass(view.wrapper, 'crossword-clues');

    view.acrossClues.id = 'crossword-across-clues';
    view.acrossClues.innerHTML = 'Across';
    addClueElements(
      controller,
      view.acrossClues,
      controller.crosswordModel.acrossClues
    );
    view.wrapper.appendChild(view.acrossClues);

    view.downClues.id = 'crossword-down-clues';
    view.downClues.innerHTML = 'Down';
    addClueElements(
      controller,
      view.downClues,
      controller.crosswordModel.downClues
    );
    view.wrapper.appendChild(view.downClues);

    return view.wrapper;
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
    const controller = this;
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

    //  Check to see whether we need to add an across clue answer segment terminator.
    if (cell.acrossTerminator === ',') {
      addClass(inputElement, 'cw-across-word-separator');
    } else if (cell.acrossTerminator === '-') {
      const acrossTerminator = document.createElement('div');
      addClass(acrossTerminator, 'cw-across-terminator');
      acrossTerminator.innerHTML = '|';
      cellElement.appendChild(acrossTerminator);
    } else if (cell.downTerminator === ',') {
      addClass(inputElement, 'cw-down-word-separator');
    } else if (cell.downTerminator === '-') {
      const acrossTerminator = document.createElement('div');
      addClass(acrossTerminator, 'cw-down-terminator');
      acrossTerminator.innerHTML = '|';
      cellElement.appendChild(acrossTerminator);
    }

    //// Event handlers

    //  Listen for focus events.
    inputElement.addEventListener('focus', (event) => {
      trace('event:focus');
      //  Get the cell data.
      const eventCell = controller.cell(event.target.parentNode);
      if (controller.#currentClueChanged(eventCell)) {
        this.#stateChange('clueSelected');
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

      if (event.keyCode === BACKSPACE) {
        //  We don't want default behaviour.
        event.preventDefault();
        // Fill cell with SPACE
        setCellContent(controller, event, ' ');
        // remove any visual flag in cell that letter is incorrect
        hideElement(controller.incorrectElement(eventCell));

        const currentIndex =
          eventCell.acrossClue === clue
            ? eventCell.acrossClueLetterIndex
            : eventCell.downClueLetterIndex;
        trace(`BACKSPACE: current cell index: ${currentIndex}`);
        const previousIndex = currentIndex - 1;

        if (previousIndex >= 0) {
          // Move to previous character
          trace(`Focussing previous cell index: ${previousIndex}`);
          controller.currentCell = clue.cells[previousIndex];
        } else if (previousIndex === -1 && clue.previousClueSegment) {
          //  If we are at the start of the clue and we have a previous segment, select it.
          trace('Focussing previous segment last cell');
          controller.currentCell = last(clue.previousClueSegment.cells);
        }
      } else if (event.keyCode === TAB) {
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
          `tab: across (${clue.isAcross}) searchClues.length (${searchClues.length})`
        );

        let newClue = null;
        const currentIndex = searchClues.indexOf(clue);
        assert(
          currentIndex !== -1,
          `keydown(TAB): clue '${clue.code}' not found in searchClues`
        );

        if (event.shiftKey) {
          //  Shift-tab selects previous clue
          if (currentIndex > 0) {
            // Selects previous clue in same direction if not the first clue
            newClue = searchClues[currentIndex - 1];
          } else {
            // On first clue, wrap to last clue in other direction
            newClue = clue.isAcross
              ? model.downClues[model.downClues.length - 1]
              : model.acrossClues[model.acrossClues.length - 1];
          }
        } else if (currentIndex < searchClues.length - 1) {
          // Tab selects next clue in same direction if not the last clue
          newClue = searchClues[currentIndex + 1];
        } else {
          // On last clue, tab wraps to first clue in other direction
          newClue = clue.isAcross ? model.downClues[0] : model.acrossClues[0];
        }

        // Select the new clue.
        controller.currentClue = newClue;
      } else if (event.keyCode === ENTER) {
        //  We don't want default behaviour.
        event.preventDefault();
        trace('ENTER');
        toggleClueDirection(controller, eventCell);
      } else if (event.keyCode === DELETE) {
        //  We don't want default behaviour.
        event.preventDefault();
        // Fill cell with SPACE
        setCellContent(controller, event, ' ');
        // remove any visual flag in cell that letter is incorrect
        hideElement(controller.incorrectElement(eventCell));
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
      }

      if (advancingKeyPressCharacters.test(character)) {
        //  Move to the next cell in the clue.
        trace('Advancing to next cell');
        const currentIndex =
          eventCell.acrossClue === clue
            ? eventCell.acrossClueLetterIndex
            : eventCell.downClueLetterIndex;
        trace(`current cell index: ${currentIndex}`);
        const nextIndex = currentIndex + 1;

        if (nextIndex < clue.cells.length) {
          // We are still within the bounds of the current clue (segment)
          trace(`Focussing next cell index: ${nextIndex}`);
          controller.currentCell = clue.cells[nextIndex];
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
