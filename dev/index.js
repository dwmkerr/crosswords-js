import {
  assert,
  compileCrossword,
  Controller,
  trace,
  tracing,
} from "./crosswords.js";

// import { assert, trace, tracing } from "../src/helpers.mjs";

// ViteJS will compile to CSS
import "../src/crosswords.less";

// hack: this should be done after DOM loaded in window
import crosswordJSON from "./crosswords/ftimes_17095.json";

// Enable console logging
tracing(true);

// Check for browser context
assert(window != null && document != null, "Not in browser!");

// Execute once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  trace("DOM loaded");
  const model = compileCrossword(crosswordJSON);
  const parent = document.getElementById("crossword1");
  const controller = new Controller(model, parent);

  const addControllerListener = (eventName, elementId) => {
    document
      .getElementById(elementId)
      .addEventListener(eventName, controller.elementEventHandler(elementId));
  };

  const addLogListener = (eventName, elementId) => {
    document.getElementById(elementId).addEventListener(eventName, (event) => {
      trace(`${elementId}:${eventName}`);
    });
  };

  // The elementIds provide the linkage between the HTML and the controller API
  // The elementIds are originally defined in the CrosswordController class
  // Give the ids to the elements where the associated behaviour is expected.
  const apiElementIds = [
    "reveal-cell",
    "clean-clue",
    "reset-clue",
    "reveal-clue",
    "test-clue",
    "clean-crossword",
    "reset-crossword",
    "reveal-crossword",
    "test-crossword",
  ];

  apiElementIds.forEach((id) => {
    addLogListener("click", id);
    addControllerListener("click", id);
  });
});
