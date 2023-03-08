const CellMap = require("./cell-map");
const { addClass, last, memoize, removeClass, trace } = require("./helpers");

// Regular expressions for keypress processing
const legalCharacters = /^[a-zA-Z]$/;
const advancingCharacters = /^[ a-zA-Z]$/;

//  For a given crossword object, this function sets the appropriate font
//  size based on the current crossword size.
const updateCrosswordFontSize = (crosswordGridElement) => {
  trace("updateCrosswordFontSize");
  //  Get the width of a cell (first child of first row).
  const cellWidth = crosswordGridElement.children[0].children[0].clientWidth;
  //  eslint-disable-next-line no-param-reassign
  crosswordGridElement.style.fontSize = `${cellWidth * 0.6}px`;
};

// Helper function to filter single-segment and anchor-segment clues
// from clue array
const anchorSegmentClues = memoize((clues) => {
  return clues.filter((x) => !x.previousClueSegment);
});

class CrosswordDOM {
  #cellMap;
  #crosswordModel;
  #domParentElement;
  #crosswordGridElement;
  #currentClue;
  #onStateChanged;

  constructor(crosswordModel, domParentElement) {
    this.#crosswordModel = crosswordModel;
    this.#cellMap = new CellMap();
    this.#domParentElement = domParentElement;

    //  Now build the DOM for the crossword.
    this.#crosswordGridElement = this.#document.createElement("div");
    this.#crosswordGridElement.className = "crossword";

    //  Create each cell.
    for (let y = 0; y < this.#crosswordModel.height; y += 1) {
      const row = this.#document.createElement("div");
      row.className = "cwrow";
      this.#crosswordGridElement.appendChild(row);

      for (let x = 0; x < this.#crosswordModel.width; x += 1) {
        const cell = this.#crosswordModel.cells[x][y];

        //  Build the cell element and add it to the row.
        const cellElement = this.#createCellDOM(this.#document, cell);
        row.appendChild(cellElement);

        //  Update the map of cells
        this.#cellMap.add(cell, cellElement);
      }
    }

    //  Update the fontsize when the window changes size
    this.#window.addEventListener("resize", this.#onWindowResize);
    // Add the crossword grid to the webpage DOM
    this.#domParentElement.appendChild(this.#crosswordGridElement);
    // Set the font size
    updateCrosswordFontSize(this.#crosswordGridElement);
  }

  // Accessor for window associated with DOM
  get #window() {
    return this.#document.defaultView;
  }
  // Accessor for document associated with DOM
  get #document() {
    return this.#domParentElement.ownerDocument;
  }

  #onWindowResize = () => {
    trace("window.event:resize");
    updateCrosswordFontSize(this.#crosswordGridElement);
  };

  // Helper function to retrieve corresponding cellElement for cell
  cellElement = (cell) => {
    return this.#cellMap.getCellElement(cell);
  };

  // Helper function to retrieve corresponding inputElement for cell
  inputElement = (cell) => {
    return this.cellElement(cell).querySelector("input");
  };

  // Helper function to retrieve corresponding cell for cellElement
  cell = (cellElement) => {
    return this.#cellMap.getCell(cellElement);
  };

  //  Helper function to allow the font to be resized programmatically,
  //  useful if something else changes the size of the crossword.
  updateFontSize = () => updateCrosswordFontSize(this.#crosswordGridElement);

  // static class method
  static #focus(cellElement) {
    // The input element of a cellElement is the first child element.
    // Refer to #createCellDOM()
    cellElement && cellElement.children[0].focus();
  }

  // Accessors for public property currentClue
  get currentClue() {
    return this.#currentClue;
  }
  set currentClue(clue) {
    trace(`set currentClue`);
    if (clue !== this.#currentClue) {
      this.#currentClue = clue;
      this.#showActiveClue();
      // TODO: handle multi-segment clue: focus first clue segment cell[0] ?
      const cellElement = this.cellElement(clue.cells[0]);
      CrosswordDOM.#focus(cellElement);
      this.#stateChange("clueSelected");
    }
  }

  // Acccessors for public event publisher onStateChanged
  get onStateChanged() {
    return this.#onStateChanged;
  }
  set onStateChanged(eventHandler) {
    this.#onStateChanged = eventHandler;
  }

  #currentClueChanged(eventCell) {
    const across = eventCell.acrossClue;
    const down = eventCell.downClue;
    let context;
    const previousClue = this.#currentClue;

    //  If we have clicked somewhere which is part of the current clue, we
    //  will not need to change it (we won't toggle either).
    if (
      this.#currentClue &&
      (this.#currentClue === across || this.#currentClue === down)
    ) {
      context = "in CurrentClue";
    } else if ((across && !down) || (!across && down)) {
      //  If we have an across clue XOR a down clue, pick the one we have.
      this.#currentClue = across || down;
      context = `${this.#currentClue === across ? "across" : "down"} (xor)`;
    } else if (
      across &&
      this.#currentClue &&
      (across === this.#currentClue.previousClueSegment ||
        across === this.nextClueSegment)
    ) {
      //  We've got across. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      this.#currentClue = across;
      context = "across (multi-segment)";
    } else if (
      down &&
      this.#currentClue &&
      (down === this.#currentClue.previousClueSegment ||
        down === this.nextClueSegment)
    ) {
      //  We've got down. If we are moving between clue segments,
      //  prefer to choose the next/previous segment...
      this.#currentClue = down;
      context = "down (multi-segment)";
    } else {
      //  ...otherwise, Prefer across, unless we're on the first letter of a down clue only
      this.#currentClue =
        eventCell.downClueLetterIndex === 0 &&
        eventCell.acrossClueLetterIndex !== 0
          ? down
          : across;
      context = `${
        this.#currentClue === across ? "across" : "down"
      } (first letter of down only or default across)`;
    }

    trace(`currentClueChanged: ${context}`);
    return this.#currentClue !== previousClue;
  }

  //  Completely cleans up the crossword.
  destroy() {
    //  Clear the map, DOM and state change handler.
    this.#cellMap.removeCrosswordCells(this.#crosswordModel);
    this.#domParentElement.removeChild(this.#crosswordGridElement);
    this.#window.removeEventListener("resize", this.#onWindowResize);
    this.onStateChanged = null;
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
      clueLabel.className = "cwcluelabel";
      clueLabel.innerHTML = cell.clueLabel;
      cellElement.appendChild(clueLabel);
    }

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
        this.#showActiveClue();
        this.#stateChange("clueSelected");
      }
    });

    //  Listen for keydown events.
    cellElement.addEventListener("keydown", (event) => {
      trace(`event:keydown keycode=${event.keyCode}`);

      //  Get the cell element and cell data.
      const eventCell = crosswordDom.cell(event.target.parentNode);
      const { model } = eventCell;
      let clue = crosswordDom.currentClue;

      if (event.keyCode === 8) {
        // BACKSPACE
        //  We don't want default behaviour.
        event.preventDefault();
        // Fill cell with SPACE
        setCellContent(event, " ");

        const currentIndex =
          eventCell.acrossClue === clue
            ? eventCell.acrossClueLetterIndex
            : eventCell.downClueLetterIndex;
        trace(`BACKSPACE: current cell index: ${currentIndex}`);
        const previousIndex = currentIndex - 1;

        if (previousIndex >= 0) {
          // Move to previous character
          trace(`Focussing previous cell index: ${previousIndex}`);
          const cell = clue.cells[previousIndex];
          CrosswordDOM.#focus(cell.cellElement);
        } else if (previousIndex === -1 && clue.previousClueSegment) {
          //  If we are at the start of the clue and we have a previous segment, select it.
          trace("Focussing previous segment last cell");
          const cell = last(clue.previousClueSegment.cells);
          CrosswordDOM.#focus(cell.cellElement);
        }
      } else if (event.keyCode === 9) {
        // TAB
        //  We don't want default behaviour.
        event.preventDefault();
        trace("TAB");

        // get anchor segment of multi-segment clue
        while (clue.previousClueSegment) {
          clue = clue.previousClueSegment;
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
              //  shift-tab selects previous clue
              if (i > 0) {
                // selects previous clue in same direction if not the first clue
                newClue = searchClues[i - 1];
              } else {
                // on first clue, wrap to last clue in other direction
                newClue = clue.isAcross
                  ? model.downClues[model.downClues.length - 1]
                  : model.acrossClues[model.acrossClues.length - 1];
              }
            } else if (i < searchClues.length - 1) {
              // tab selects next clue in same direction if not the last clue
              newClue = searchClues[i + 1];
            } else {
              // on last clue, tab wraps to first clue in other direction
              newClue = clue.isAcross
                ? model.downClues[0]
                : model.acrossClues[0];
            }

            //  Select the new clue.
            crosswordDom.currentClue = newClue;
            break;
          }
        }
      } else if (event.keyCode === 13) {
        // ENTER
        //  We don't want default behaviour.
        event.preventDefault();
        trace("ENTER");

        //  If we are in a eventCell with an across clue AND down clue, swap the
        //  selected one.
        if (eventCell.acrossClue && eventCell.downClue) {
          // swap clue direction
          crosswordDom.currentClue =
            eventCell.acrossClue === crosswordDom.currentClue
              ? eventCell.downClue
              : eventCell.acrossClue;
          // refocus current cell
          CrosswordDOM.#focus(eventCellElement);
        }
      } else if (event.keyCode === 46) {
        // DELETE
        //  We don't want default behaviour.
        event.preventDefault();
        // Fill cell with SPACE
        setCellContent(event, " ");
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

      // Exclude processing of all keys outside A-Z
      const character = String.fromCharCode(event.keyCode).toLowerCase();
      trace(`character:<${character}>`);

      if (legalCharacters.test(character)) {
        //  Sets the letter in the current clue cell.
        trace(`Setting content: <${character}>`);
        setCellContent(event, character);
      }

      if (advancingCharacters.test(character)) {
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
          const cell = clue.cells[nextIndex];
          CrosswordDOM.#focus(cell.cellElement);
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
        case 37: // left
          moveLeft(eventCell);
          break;
        case 38: // up
          moveUp(eventCell);
          break;
        case 39: // right
          moveRight(eventCell);
          break;
        case 40: // down
          moveDown(eventCell);
          break;
        case 9: // tab
          // tab handled in keydown event handler
          break;
        //  No action needed for any other keys.
        default:
          break;
      }
    });

    return cellElement;

    function jumpToNextSegment(eventCell) {
      const clue = crosswordDom.currentClue;
      const currentIndex =
        eventCell.acrossClue === clue
          ? eventCell.acrossClueLetterIndex
          : eventCell.downClueLetterIndex;
      trace(`jumpToNextSegment: current cell index: ${currentIndex}`);
      const nextIndex = currentIndex + 1;
      //  If we are at the end of the clue and we have a next segment, select it.
      const jumpable = nextIndex === clue.cells.length && clue.nextClueSegment;
      if (jumpable) {
        trace("Focussing next answer segment cell index 0");
        crosswordDom.currentClue = clue.nextClueSegment;
      }
      return jumpable;
    }

    function jumpToPreviousSegment(eventCell) {
      const clue = crosswordDom.currentClue;
      const currentIndex =
        eventCell.acrossClue === clue
          ? eventCell.acrossClueLetterIndex
          : eventCell.downClueLetterIndex;
      trace(`moveUp: current cell index: ${currentIndex}`);
      const previousIndex = currentIndex - 1;
      //  If we are at the start of the clue and we have a previous segment, select it.
      const jumpable = previousIndex === -1 && clue.previousClueSegment;
      if (jumpable) {
        trace("moveUp: Focussing prev answer segment last cell");
        const cell = last(clue.previousClueSegment.cells);
        CrosswordDOM.#focus(cell.cellElement);
      }
      return jumpable;
    }

    function moveDown(eventCell) {
      const { x, y } = eventCell;
      const { height } = eventCell.model;

      let result = false;

      if (
        eventCell.y + 1 < height &&
        eventCell.model.cells[x][y + 1].light === true
      ) {
        const cell = eventCell.model.cells[x][y + 1];
        const cellElement = crosswordDom.cellElement(cell);
        CrosswordDOM.#focus(cellElement);
        result = true;
      } else {
        // Can we go to next segment in clue?
        result = jumpToNextSegment(eventCell);
      }

      return result;
    }

    function moveRight(eventCell) {
      const { x, y } = eventCell;
      const { width } = eventCell.model;

      let result = false;

      if (
        eventCell.x + 1 < width &&
        eventCell.model.cells[x + 1][y].light === true
      ) {
        const cell = eventCell.model.cells[x + 1][y];
        const cellElement = crosswordDom.cellElement(cell);
        CrosswordDOM.#focus(cellElement);
        result = true;
      } else {
        // Can we go to next segment in clue?
        result = jumpToNextSegment(eventCell);
      }

      return result;
    }

    function moveUp(eventCell) {
      const { x, y } = eventCell;

      let result = false;

      if (eventCell.y > 0 && eventCell.model.cells[x][y - 1].light === true) {
        const cell = eventCell.model.cells[x][y - 1];
        const cellElement = crosswordDom.cellElement(cell);
        CrosswordDOM.#focus(cellElement);
        result = true;
      } else {
        // Can we go to previous segment in clue?
        result = jumpToPreviousSegment(eventCell);
      }

      return result;
    }

    function moveLeft(eventCell) {
      const { x, y } = eventCell;
      let result = false;

      if (eventCell.x > 0 && eventCell.model.cells[x - 1][y].light === true) {
        //  TODO: optimise with children[0]?
        const cell = eventCell.model.cells[x - 1][y];
        const cellElement = crosswordDom.cellElement(cell);
        CrosswordDOM.#focus(cellElement);
        result = true;
      } else {
        // Can we go to previous segment in clue?
        result = jumpToPreviousSegment(eventCell);
      }

      return result;
    }

    function setCellContent(event, character) {
      function setLetter() {
        return (source, index, newLetter) => {
          let sourceNormalised =
            source === null || source === undefined ? "" : source;
          let result = "";
          while (sourceNormalised.length <= index) {
            sourceNormalised += " ";
          }
          const seek = Math.max(index, sourceNormalised.length);
          for (let i = 0; i < seek; i += 1) {
            result += i === index ? newLetter : sourceNormalised[i];
          }
          return result;
        };
      }

      const eventCell = crosswordDom.cell(event.target.parentNode);
      //  eslint-disable-next-line no-param-reassign
      event.target.value = character;

      //  We need to update the answer.
      if (eventCell.acrossClue) {
        eventCell.acrossClue.answer = setLetter(
          eventCell.acrossClue.answer,
          eventCell.acrossClueLetterIndex,
          character,
        );
      }
      if (eventCell.downClue) {
        eventCell.downClue.answer = setLetter(
          eventCell.downClue.answer,
          eventCell.downClueLetterIndex,
          character,
        );
      }
    }
  }

  //  Updates the DOM based on the model, ensuring that the CSS
  //  is correct for the state (i.e. the selected clue).
  #showActiveClue() {
    trace("#showActiveClue");
    //  Clear all clue cells.
    this.#deactivateAllClues();
    this.#activateClue(this.#currentClue);
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

  #deactivateAllClues() {
    this.#crosswordModel.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.light) {
          removeClass(this.inputElement(cell), "active");
        }
      });
    });
  }
}

module.exports = CrosswordDOM;
