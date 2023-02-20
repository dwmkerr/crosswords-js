// Configure trace logging
const tracing = false;

// Lightweight helper functions.

function addClass(element, className) {
  element.classList.add(className);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function first(array) {
  // If array is not nullish, return first element
  return array ? array[0] : null;
}

/**
 * replaceStrAt - overlay **str** onto **original** string starting at **index**
 * @param original - the string to be mutated
 * @param index - the index of _original_ to start the overlay
 * @param str - the overlaying text
 * @returns the mutated _original_. Any null or undefined arguments returns _original_.
 * _index_ outside range [0,_original_.length) returns _original_.
 */
function replaceStrAt(original, index, str) {
  return original && index >= 0 && str && original.length > index
    ? `${original.slice(0, index)}${str}${original.slice(index + str.length)}`
    : original;
}

function last(array) {
  // If array is not nullish, return last element
  return array ? array.slice(-1) : null;
}

// 'memoize' pattern implementation
// https://en.wikipedia.org/wiki/Memoization
const memoize = (fn) => {
  let cache = {};
  return (arg) => {
    if (!(arg in cache)) {
      trace("memoize:caching...");
      cache[arg] = fn(arg);
    }
    return cache[arg];
  };
};

function removeClass(element, className) {
  element.classList.remove(className);
}

// Helper function to pad a word <source> as necessary to set
// the letter at <index> to <newLetter>
function setLetter(source, index, newLetter) {
  let result = source === null || source === undefined ? "" : source;
  result = result.padEnd(index + 1, " ");
  return replaceStrAt(result, index, newLetter);
}

function toggleClass(element, className) {
  element.classList.toggle(className);
}

const trace = (message) => {
  if (tracing) console.log(message);
};

module.exports = {
  addClass,
  assert,
  first,
  replaceStrAt,
  last,
  memoize,
  removeClass,
  setLetter,
  toggleClass,
  trace,
};
