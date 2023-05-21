import {
  assert,
  compileCrossword,
  Controller,
  trace,
  tracing,
} from "./crosswords.js";

// ViteJS will compile to CSS
import "../style/crosswords.less";

// TODO: Load crossword dynamically form the user's choice.
import crosswordJSON from "./crosswords/ftimes_17095.json";

// Enable console logging
tracing(true);

// Check for browser context
assert(window != null && document != null, "Not in browser!");

// Execute once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  trace("DOM loaded");

  // shortcut function
  const eid = (id) => {
    return document.getElementById(id);
  };

  // Helper function to bind Controller event listener function to webpage
  // DOM elementId.
  const addControllerListener = (eventName, elementId) => {
    const element = eid(elementId);
    if (element) {
      element.addEventListener(
        eventName,
        controller.elementEventHandler(elementId),
      );
    }
  };

  // Helper function to add logging of event handler.
  const addLogListener = (eventName, elementId) => {
    const element = eid(elementId);
    if (element) {
      element.addEventListener(eventName, (event) => {
        trace(`${elementId}:${eventName}`);
      });
    }
  };

  // The DOM elementIds provide the linkage between the HTML and the Controller
  // Compile a crossword
  const crosswordModel = compileCrossword(crosswordJSON);
  // Locate the parent element for the crossword-grid
  const crosswordGridParent = eid("crossword-grid-wrapper");
  trace(`crosswordGridParent: ${crosswordGridParent}`);
  const crosswordCluesParent = eid("crossword-clues-wrapper");
  trace(`crosswordCluesParent: ${crosswordCluesParent}`);
  // Create the Controller and load the crossword grid into the web page.
  const controller = new Controller(
    crosswordModel,
    crosswordGridParent,
    crosswordCluesParent,
  );

  // event listeners. The elementIds are originally defined in the
  // CrosswordController class. Assign the ids to the DOM element events
  // (e.g. button click events in this example) where the associated behaviour
  // is expected.

  // All available event handers
  const apiElementIds = [
    // Reveal solution for current letter in answer. All revealed cells have
    // distinct styling which remains for the duration of the puzzle.
    // Public shaming is strictly enforced!
    "reveal-cell",
    // Remove incorrect letters in the answer after testing.
    "clean-clue",
    // Clear out the answer for the current clue
    "reset-clue",
    // Reveal solution for current clue
    "reveal-clue",
    // Test the current clue answer against the solution. Incorrect letters
    // have distinct styling which is removed when 'cleared' or a new letter
    // entered in the cell.
    "test-clue",
    // Clear out all incorrect letters in the entire crossword
    "clean-crossword",
    // Clear out the entire crossword
    "reset-crossword",
    // Reveal solutions for the entire crossword.
    "reveal-crossword",
    // Test the answers for the entire against the solutions
    "test-crossword",
  ];

  // Bind all the Controller event listeners to the click event of the element
  // (ids) in the apiElementIds array above.
  apiElementIds.forEach((id) => {
    addLogListener("click", id);
    addControllerListener("click", id);
  });

  const currentClueLabel = eid("current-clue-label");
  const currentClueText = eid("current-clue-text");
  // Initialise content of #current-clue
  const cc = controller.currentClue;
  currentClueLabel.innerHTML = cc.clueLabel;
  currentClueText.innerHTML = `${cc.clueText} ${cc.answerLengthText}`;
  // Update content of #current-clue when current clue changes
  controller.addEventListener("clueSelected", (clue) => {
    currentClueLabel.innerHTML = clue.clueLabel;
    currentClueText.innerHTML = `${clue.clueText} ${clue.answerLengthText}`;
  });

  // Populate title block with crossword info
  let infoSource = eid("info-source-url");
  infoSource.innerHTML = crosswordJSON.info.title;
  infoSource.setAttribute("href", crosswordJSON.info.source);
  let infoSetter = eid("info-setter-url");
  infoSetter.innerHTML = crosswordJSON.info.setter.title;
  infoSetter.setAttribute("href", crosswordJSON.info.setter.url);
});
