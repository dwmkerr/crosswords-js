import {
  assert,
  compileCrossword,
  Controller,
  trace,
  tracing,
} from "./crosswords.js";

// TODO: Load crossword dynamically form the user's choice.
import crosswordJSON from "./crosswords/ftimes_17095.json";

// Enable console logging for crosswords.js
tracing(true);

// Check for browser context
assert(window != null && document != null, "Not in browser!");

/// / Shortcut functions

const eid = (id) => {
  return document.getElementById(id);
};
// Returns an array of elements
const ecs = (className) => {
  return document.getElementsByClassName(className);
};

// Execute once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  trace("DOM loaded");

  // The DOM elementIds provide the linkage between the HTML and the Controller
  // Compile a crossword
  const crosswordModel = compileCrossword(crosswordJSON);
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

  // Helper function to bind Controller user-event-handler to webpage
  // DOM elementId.
  const bindControllerEventHandlerToId = (eventName, elementId) => {
    const element = eid(elementId);
    if (element) {
      element.addEventListener(
        eventName,
        controller.userEventHandler(elementId),
      );
    }
  };

  // Helper function to bind Controller user-event-handler to webpage
  // DOM element class. Using element class names rather than element Ids
  // allows us to add controller user-event-handler to more than one
  // DOM element
  const bindControllerEventHandlerToClass = (eventName, elementClass) => {
    const elements = ecs(elementClass);
    elements
      .filter((e) => Boolean(e))
      .addEventListener(eventName, controller.userEventHandler(elementClass));
  };

  // Helper function to log controller user event handler execution.
  const addLogListener = (eventName, elementId) => {
    const element = eid(elementId);
    if (element) {
      element.addEventListener(eventName, (event) => {
        trace(`${elementId}:${eventName}`);
      });
    }
  };

  // Bind all the Controller user-event handlers by their ids to the
  // click event of the matching DOM element (ids) in this example application.
  controller.userEventHandlerIds.forEach((id) => {
    addLogListener("click", id);
    bindControllerEventHandlerToId("click", id);
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
  const infoSource = eid("info-source-url");
  infoSource.innerHTML = crosswordJSON.info.title;
  infoSource.setAttribute("href", crosswordJSON.info.source);
  const infoSetter = eid("info-setter-url");
  infoSetter.innerHTML = crosswordJSON.info.setter.title;
  infoSetter.setAttribute("href", crosswordJSON.info.setter.url);

  /// / Respond to crossword completion

  const crosswordSolvedOverlay = eid("crossword-solved-overlay");
  // let closeCompletedDialog = eid("crossword-complete-close");

  controller.addEventsListener(["crosswordSolved"], (clue) => {
    trace("CrosswordSolvedHandler");
    crosswordSolvedOverlay.style.display = "block";
  });
  // Setup crossword completed display UI event handlers
  // When the user types or clicks anywhere outside of the complete dialog,
  // close/hide it
  window.onclick = (event) => {
    crosswordSolvedOverlay.style.display = "none";
    return true;
  };
  window.onkeydown = window.onclick;

  /// / Respond to clue solved

  const clueSolvedNotification = eid("clue-solved-notification");

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
