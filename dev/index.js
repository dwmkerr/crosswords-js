import {
  assert,
  compileCrossword,
  Controller,
  eid,
  trace,
  tracing,
} from "./crosswords.js";

// TODO: Load crossword dynamically form the user's choice.
import crosswordDefinition from "../data/ftimes_17095.json";

// Enable console logging for crosswords.js
tracing(true);

// Check for browser context
assert(window != null && document != null, "Not in browser!");

// Execute once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  trace("DOM loaded");

  // The DOM elementIds provide the linkage between the HTML and the Controller
  // Compile a crossword
  const crosswordModel = compileCrossword(crosswordDefinition);
  // Locate the parent element for the crossword-grid
  const crosswordGridParent = eid("crossword-grid-placeholder");
  trace(`crosswordGridParent: ${crosswordGridParent}`);
  const crosswordCluesParent = eid("crossword-clues-placeholder");
  trace(`crosswordCluesParent: ${crosswordCluesParent}`);
  // Create the Controller and load the crossword grid into the web page.
  const controller = new Controller(
    crosswordModel,
    crosswordGridParent,
    crosswordCluesParent,
  );

  // User-event handlers. The handlers are defined in the
  // CrosswordController class. Assign the handler ids as DOM element ids
  // (e.g. button click events in this example) where the associated behaviour
  // is desired.

  // Helper function to log controller user event handler execution.
  const addLogListener = (elementId, eventName, dom = document) => {
    const element = eid(elementId, dom);
    if (element) {
      element.addEventListener(eventName, (event) => {
        trace(`event=${elementId}:${eventName}`);
      });
    }
  };

  // Bind all the Controller user-event handlers by their ids to the
  // click event of the matching DOM element (ids) in this example application.
  // defaults:
  // elementIds = controller.userEventHandlerIds,
  // eventName = "click",
  // dom = document,
  controller.bindEventHandlersToIds();

  // Add a log event for all event handler calls on event "click"
  controller.userEventHandlerIds.forEach((id) => {
    addLogListener(id, "click");
  });

  // Wire up current-clue elements

  const currentClueLabel = eid("current-clue-label");
  const currentClueText = eid("current-clue-text");
  // Initialise content of #current-clue
  const cc = controller.currentClue;
  currentClueLabel.innerHTML = cc.clueLabel;
  currentClueText.innerHTML = `${cc.clueText} ${cc.answerLengthText}`;
  // Update content of #current-clue when current clue changes
  controller.addEventsListener(["clueSelected"], (clue) => {
    currentClueLabel.innerHTML = clue.clueLabel;
    currentClueText.innerHTML = `${clue.clueText} ${clue.answerLengthText}`;
  });

  // Populate title block with crossword info
  let infoSource = eid("info-source-url");
  infoSource.innerHTML = crosswordDefinition.info.title;
  infoSource.setAttribute("href", crosswordDefinition.info.source);
  let infoSetter = eid("info-setter-url");
  infoSetter.innerHTML = crosswordDefinition.info.setter.title;
  infoSetter.setAttribute("href", crosswordDefinition.info.setter.url);

  //// Respond to crossword completion

  let crosswordSolvedOverlay = eid("crossword-solved-overlay");

  controller.addEventsListener(["crosswordSolved"], (clue) => {
    trace("CrosswordSolvedHandler");
    // show the crossword-complete dialog
    crosswordSolvedOverlay.style.display = "block";
  });

  // Setup crossword completed display UI event handlers

  window.onclick = (event) => {
    // Hide the crossword-complete dialog When the user clicks anywhere.
    crosswordSolvedOverlay.style.display = "none";
    // Percolate the event
    return true;
  };
  // When the user types, close/hide it
  window.onkeydown = window.onclick;

  //// Respond to clue solved

  let clueSolvedNotification = eid("clue-solved-notification");

  // show notification message and then fade out automatically
  // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Tips
  controller.addEventsListener(["clueSolved"], (clue) => {
    trace("clueSolvedHandler");
    // Make notification visible - hidden initially.
    clueSolvedNotification.style.display = "block";
    requestAnimationFrame((time) => {
      clueSolvedNotification.className = "";
      requestAnimationFrame((time) => {
        clueSolvedNotification.className = "fade-out";
      });
    });
  });
});
