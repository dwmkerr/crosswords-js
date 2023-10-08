import {
  CrosswordController as Controller,
  newCrosswordController,
} from "../src/crossword-controller.mjs";
import {
  newCrosswordModel as compileCrossword,
  convertSourceFileToDefinition,
  newCrosswordDefinition,
} from "../src/crossword-model.mjs";
import { assert, ecs, eid, trace, tracing } from "../src/helpers.mjs";

const helpers = {
  assert, // Validate function arguments and entry conditions
  ecs, // DOM helper, wrapper for document.getElementByClass()
  eid, // DOM helper, wrapper for document.getElementById()
  trace, // Log information, warnings and errors to the console
  tracing, // Console logging toggle - pass boolean 'true' to emit messages to the console.
};

export {
  newCrosswordDefinition, // create a new CrosswordDefinition input and validate its structure.
  convertSourceFileToDefinition, // Create a CrosswordDefinition from a filesystem path to a crossword source file (.json, .yml).
  // NOTE: This function accesses the local file system, and is therefore typically limited to server-side code.
  compileCrossword, // Used by puzzle setters to verify the conformance of a crosswordDefinition
  newCrosswordController, // Create a CrosswordController object - the central object in the module.
  Controller, //Legacy export. Use newCrosswordController() for all new projects.
  helpers, // A collection of non-essential utilities for argument validation, console-logging and DOM element retrieval
};
