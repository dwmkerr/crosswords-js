const CellMap = require("./cell-map");
const { addClass, last, removeClass, trace } = require("./helpers");
const {
  anchorSegmentClues,
  resetCell,
  resetClue,
  revealCell,
  revealClue,
  testCell,
  testClue,
  updateCrosswordFontSize,
} = require("./crossworddom-helpers");
const {
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  setCellContent,
  toggleClueDirection,
} = require("./celldom-helpers");

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

class CrosswordDOM {
  #cellMap;
  #crosswordGridElement;
  #crosswordModel;
  #current;
  #domParentElement;
  #onStateChanged;

  constructor(crosswordModel, domParentElement) {
    this.#crosswordModel = crosswordModel;
    this.#cellMap = new CellMap();
    this.#domParentElement = domParentElement;
    this.#current = { clue: null, cell: null };
    //  Now build the DOM for the crossword.
    this.#crosswordGridElement = this.#document.createElement("div");
    this.gridElement.className = "crossword";

    //  Create each cell.
    for (let y = 0; y < this.#crosswordModel.height; y += 1) {
      const row = this.#document.createElement("div");
      row.className = "cwrow";
      this.gridElement.appendChild(row);

      for (let x = 0; x < this.#crosswordModel.width; x += 1) {
        const cell = this.#crosswordModel.cells[x][y];

        //  Build the cell element and add it to the row.
        const cellElement = this.#createCellDOM(this.#document, cell);
        row.appendChild(cellElement);

        //  Update the map of cells
        this.#cellMap.add(cell, cellElement);
      }
    }

    //  Update the font size when the window changes size
    this.#window.addEventListener("resize", this.#onWindowResize);
    //  Focus the first clue when the page loads
    this.#window.addEventListener("onload", this.#onPageLoaded);
    //  Add the crossword grid to the webpage DOM
    this.#domParentElement.appendChild(this.gridElement);
    //  Set the font size
    updateCrosswordFontSize(this.gridElement);
  }
  //  Completely cleans up the crossword.
  destroy() {
    //  Clear the map, DOM and state change handler.
    this.#cellMap.removeCrosswordCells(this.#crosswordModel);
    this.#domParentElement.removeChild(this.gridElement);
    this.#window.removeEventListener("resize", this.#onWindowResize);
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
    // Refer to #createCellDOM()
    return this.cellElement(cell).children[0];
  };

  // Helper function to retrieve corresponding revealedElement for cell
  revealedElement = (cell) => {
    // The revealed element of a cellElement is the third child element.
    // Refer to #createCellDOM()
    return this.cellElement(cell).children[2];
  };
  // Helper function to retrieve corresponding incorrectElement for cell
  incorrectElement = (cell) => {
    // The incorrect element of a cellElement is the fourth child element.
    // Refer to #createCellDOM()
    return this.cellElement(cell).children[3];
  };

  //  Helper function to allow the font to be resized programmatically,
  //  useful if something else changes the size of the crossword.
  updateFontSize = () => updateCrosswordFontSize(this.gridElement);

  // Accessors for public property currentCell
  get currentCell() {
    return this.#current.cell;
  }
  set currentCell(cell) {
    trace(`set currentCell`);
    if (cell !== this.#current.cell) {
      this.#current.cell = cell;
      cell && cell.cellElement.children[0].focus();
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
      trace(`set currentClue: ${clue.code}`);
      this.#current.clue = clue;
      this.#activateClue(clue);
      this.currentCell = clue.cells[0];
      this.#stateChange("clueSelected");
    }
  }

  // Accessors for public event publisher onStateChanged
  get onStateChanged() {
    return this.#onStateChanged;
  }
  set onStateChanged(eventHandler) {
    this.#onStateChanged = eventHandler;
  }

  // Accessor for gridElement
  get gridElement() {
    return this.#crosswordGridElement;
  }

  testCurrentClue() {
    testClue(this.currentClue);
    this.#stateChange("clueTested");
  }

  testCrossword() {
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          testCell(cell);
        });
    });
    this.#stateChange("crosswordTested");
  }

  revealCurrentCell() {
    revealCell(this.currentCell);
    this.#stateChange("cellRevealed");
  }

  revealCurrentClue() {
    revealClue(this.currentClue);
    this.#stateChange("clueRevealed");
  }

  revealCrossword() {
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          revealCell(cell);
        });
    });
    this.#stateChange("crosswordRevealed");
  }

  resetClue() {
    resetClue(this.currentClue);
    this.#stateChange("clueReset");
  }

  resetCrossword() {
    this.#crosswordModel.cells.forEach((row) => {
      row
        .filter((x) => x.light)
        .forEach((cell) => {
          resetCell(cell);
        });
    });
    this.#stateChange("crosswordReset");
  }
  //// Private methods

  // Accessor for document associated with DOM
  get #document() {
    return this.#domParentElement.ownerDocument;
  }
  // Accessor for window associated with DOM
  get #window() {
    return this.#document.defaultView;
  }

  #onWindowResize() {
    trace("window.event:resize");
    updateCrosswordFontSize(this.gridElement);
  }

  #onPageLoaded() {
    trace("window.event:onload");
    // Select the first "across" clue when the page loads
    this.currentClue = this.#crosswordModel.acrossClues[0];
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
      context = "in CurrentClue";
    } else if ((across && !down) || (!across && down)) {
      //  If we have an across clue XOR a down clue, pick the one we have.
      this.currentClue = across || down;
      context = `${this.currentClue === across ? "across" : "down"} (xor)`;
    } else if (
      across &&
      this.currentClue &&
      (across === this.currentClue.previousClueSegment ||
        across === this.nextClueSegment)
    ) {
      //  We've got across. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      this.currentClue = across;
      context = "across (multi-segment)";
    } else if (
      down &&
      this.currentClue &&
      (down === this.currentClue.previousClueSegment ||
        down === this.nextClueSegment)
    ) {
      //  We've got down. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      this.currentClue = down;
      context = "down (multi-segment)";
    } else {
      //  ...otherwise, Prefer across, unless we're on the first letter of a down clue only
      this.currentClue =
        eventCell.downClueLetterIndex === 0 &&
        eventCell.acrossClueLetterIndex !== 0
          ? down
          : across;
      context = `${
        this.currentClue === across ? "across" : "down"
      } (first letter of down only or default across)`;
    }

    trace(`currentClueChanged: ${context}`);
    return this.currentClue !== previousClue;
  }

  //  Sends a state change message.
  #stateChange(message, data) {
    //  TODO: we could probably inherit from EventEmitter as a more standard way
    //  to implement this functionality.
    //  Send the message.
    trace(`stateChange: ${message}`);
    this.#onStateChanged &&
      this.#onStateChanged({
        message,
        data,
      });
  }

  //  Creates DOM for a cell.
  #createCellDOM(document, cell) {
    const crosswordDom = this;
    const cellElement = document.createElement("div");
    cellElement.className = "cwcell";
    //  eslint-disable-next-line no-param-reassign
    cell.cellElement = cellElement;

    //  Add a class.
    cellElement.className += cell.light ? " light" : " dark";

    //  If the cell is dark, we are done.
    if (!cell.light) {
      return cellElement;
    }

    //  Light cells also need an input.
    const inputElement = document.createElement("input");
    inputElement.maxLength = 1;
    if (cell.answer) {
      inputElement.value = cell.answer;
    }
    cellElement.appendChild(inputElement);

    //  We may need to add a clue label.
    if (cell.clueLabel) {
      const clueLabel = document.createElement("div");
      clueLabel.className = "cwclue-label";
      clueLabel.innerHTML = cell.clueLabel;
      cellElement.appendChild(clueLabel);
    }

    // Remove 'hidden' div class to reveal
    const cellRevealed = document.createElement("div");
    cellRevealed.className = "cwcell-revealed hidden";
    cellElement.appendChild(cellRevealed);

    // Toggle 'hidden' div class to reveal/hide
    const cellIncorrect = document.createElement("div");
    cellIncorrect.className = "cwcell-incorrect hidden";
    cellElement.appendChild(cellIncorrect);

    //  Check to see whether we need to add an across clue answer segment terminator.
    if (cell.acrossTerminator === ",") {
      inputElement.className += " cw-across-word-separator";
    } else if (cell.acrossTerminator === "-") {
      const acrossTerminator = document.createElement("div");
      acrossTerminator.className = "cw-across-terminator";
      acrossTerminator.innerHTML = "|";
      cellElement.appendChild(acrossTerminator);
    } else if (cell.downTerminator === ",") {
      inputElement.className += " cw-down-word-separator";
    } else if (cell.downTerminator === "-") {
      const acrossTerminator = document.createElement("div");
      acrossTerminator.className = "cw-down-terminator";
      acrossTerminator.innerHTML = "|";
      cellElement.appendChild(acrossTerminator);
    }

    //// Event handlers

    //  Listen for focus events.
    inputElement.addEventListener("focus", (event) => {
      trace("event:focus");
      //  Get the cell data.
      const eventCell = crosswordDom.cell(event.target.parentNode);
      if (crosswordDom.#currentClueChanged(eventCell)) {
        this.#stateChange("clueSelected");
      }
    });

    //  Listen for click events.
    inputElement.addEventListener("click", (event) => {
      trace("event:click");
      const eventCell = crosswordDom.cell(event.target.parentNode);
      // Test for second click on same cell
      if (eventCell === crosswordDom.currentCell) {
        toggleClueDirection(crosswordDom, eventCell);
      } else {
        crosswordDom.currentCell = eventCell;
      }
    });

    //  Listen for keydown events.
    cellElement.addEventListener("keydown", (event) => {
      trace(`event:keydown keycode=${event.keyCode}`);

      //  Get the cell element and cell data.
      const eventCell = crosswordDom.cell(event.target.parentNode);
      const { model } = eventCell;
      let clue = crosswordDom.currentClue;

      if (event.keyCode === BACKSPACE) {
        //  We don't want default behaviour.
        event.preventDefault();
        // Fill cell with SPACE
        setCellContent(crosswordDom, event, " ");

        const currentIndex =
          eventCell.acrossClue === clue
            ? eventCell.acrossClueLetterIndex
            : eventCell.downClueLetterIndex;
        trace(`BACKSPACE: current cell index: ${currentIndex}`);
        const previousIndex = currentIndex - 1;

        if (previousIndex >= 0) {
          // Move to previous character
          trace(`Focussing previous cell index: ${previousIndex}`);
          crosswordDom.currentCell = clue.cells[previousIndex];
        } else if (previousIndex === -1 && clue.previousClueSegment) {
          //  If we are at the start of the clue and we have a previous segment, select it.
          trace("Focussing previous segment last cell");
          crosswordDom.currentCell = last(clue.previousClueSegment.cells);
        }
      } else if (event.keyCode === TAB) {
        //  We don't want default behaviour.
        event.preventDefault();
        trace("TAB");

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
        for (let i = 0; i < searchClues.length; i += 1) {
          if (clue === searchClues[i]) {
            let newClue = null;

            if (event.shiftKey) {
              //  Shift-tab selects previous clue
              if (i > 0) {
                // Selects previous clue in same direction if not the first clue
                newClue = searchClues[i - 1];
              } else {
                // On first clue, wrap to last clue in other direction
                newClue = clue.isAcross
                  ? model.downClues[model.downClues.length - 1]
                  : model.acrossClues[model.acrossClues.length - 1];
              }
            } else if (i < searchClues.length - 1) {
              // Tab selects next clue in same direction if not the last clue
              newClue = searchClues[i + 1];
            } else {
              // On last clue, tab wraps to first clue in other direction
              newClue = clue.isAcross
                ? model.downClues[0]
                : model.acrossClues[0];
            }

            // Select the new clue.
            crosswordDom.currentClue = newClue;
            break;
          }
        }
      } else if (event.keyCode === ENTER) {
        //  We don't want default behaviour.
        event.preventDefault();
        trace("ENTER");
        toggleClueDirection(crosswordDom, eventCell);
      } else if (event.keyCode === DELETE) {
        //  We don't want default behaviour.
        event.preventDefault();
        // Fill cell with SPACE
        setCellContent(crosswordDom, event, " ");
      }
    });

    //  Listen for keypress events.
    cellElement.addEventListener("keypress", (event) => {
      trace("event:keypress");
      // We've just pressed a key that generates a char.
      // Stop default handling for input component
      event.preventDefault();

      //  Get cell data.
      const eventCell = crosswordDom.cell(event.target.parentNode);
      const clue = crosswordDom.currentClue;

      // Convert keyCode to upper-case character
      const character = String.fromCharCode(event.keyCode).toUpperCase();
      trace(`character:<${character}>`);

      if (echoingKeyPressCharacters.test(character)) {
        //  Sets the letter in the current clue cell.
        trace(`Setting content: <${character}>`);
        setCellContent(crosswordDom, event, character);
      }

      if (advancingKeyPressCharacters.test(character)) {
        trace("Advancing to next cell");
        //  Move to the next cell in the clue.
        const currentIndex =
          eventCell.acrossClue === clue
            ? eventCell.acrossClueLetterIndex
            : eventCell.downClueLetterIndex;
        trace(`current cell index: ${currentIndex}`);
        const nextIndex = currentIndex + 1;

        if (nextIndex < clue.cells.length) {
          // We are still within the bounds of the current clue (segment)
          trace(`Focussing next cell index: ${nextIndex}`);
          crosswordDom.currentCell = clue.cells[nextIndex];
        } else if (clue.nextClueSegment) {
          //  We are at the end of the clue segment and there is a next segment.
          trace("Focussing next answer segment cell index 0");
          crosswordDom.currentClue = clue.nextClueSegment;
        }
      }
    });

    //  Listen for keyup events.
    cellElement.addEventListener("keyup", (event) => {
      trace("event:keyup");
      const eventCell = crosswordDom.cell(event.target.parentNode);

      switch (event.keyCode) {
        case LEFT:
          moveLeft(crosswordDom, eventCell);
          break;
        case UP:
          moveUp(crosswordDom, eventCell);
          break;
        case RIGHT:
          moveRight(crosswordDom, eventCell);
          break;
        case DOWN:
          moveDown(crosswordDom, eventCell);
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
        addClass(this.inputElement(cell), "active");
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
        removeClass(this.inputElement(cell), "active");
      });
    });
  }
}

module.exports = CrosswordDOM;
