// Configure trace logging
const tracing = true;

// Lightweight helper functions.

/**
 * **addClass** - add a [CSS](https://en.wikipedia.org/wiki/CSS) class to a
 * [DOM](https://en.wikipedia.org/wiki/Document_Object_Model) element.
 * @param {*} element the element (object reference)
 * @param {*} className the class to add (string)
 */
function addClass(element, className) {
  element.classList.add(className);
}

/**
 * **assert** - logical constraint testing
 * @param condition - test expression (boolean)
 * @param message - (string) recorded on test failure - _condition_ evaluates to `false`.
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

/**
 * **first** - get the first element of an array
 * @param {*} array
 * @returns the first element of _array_ or null for empty,undefined or null array
 */
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

/**
 * **last** - get the last element of an array
 * @param {*} array
 * @returns the last element of _array_ or null for empty,undefined or null array
 */
function last(array) {
  // If array is not nullish, return last element
  return array ? array.slice(-1) : null;
}

/**
 * **memoize** - wrap an arbitrary, single-argument,
 * [idempotent](https://en.wikipedia.org/wiki/Idempotence)
 * function with result-caching.
 * Useful for [_expensive_](https://en.wikipedia.org/wiki/Analysis_of_algorithms) functions.
 * @param {*} fn the function to be [memoized](https://en.wikipedia.org/wiki/Memoization)
 * @returns a reference to the wrapped function. Assign this reference to a variable
 * and invoke in the same manner as a function.
 */
const memoize = (fn) => {
  // A hopefully unique object property name/key!
  const id = "id_Z?7kQ;x8j!";
  let cache = {};
  return (arg) => {
    if (!arg[id]) {
      // Attach a random id property to this object
      //  eslint-disable-next-line no-param-reassign
      arg[id] = Math.random().toString(16).slice(2);
    }

    if (!(arg[id] in cache)) {
      cache[arg[id]] = fn(arg);
      trace(`memoize:caching id ${arg[id]}`);
    }

    return cache[arg[id]];
  };
};

/**
 * **removeClass** - remove a [CSS](https://en.wikipedia.org/wiki/CSS) class from a
 * [DOM](https://en.wikipedia.org/wiki/Document_Object_Model) element.
 * @param {*} element the element (object reference)
 * @param {*} className the class to add (string)
 */
function removeClass(element, className) {
  element.classList.remove(className);
}

/**
 * setLetter - Set the _source_ letter at _index_ to _newLetter_. Pad _source_ if required.
 * @param {*} source string to be modified
 * @param {*} index target position in _source_
 * @param {*} newLetter replacement letter
 * @returns
 */
function setLetter(source, index, newLetter) {
  let result = source === null || source === undefined ? "" : source;
  result = result.padEnd(index + 1, " ");
  return replaceStrAt(result, index, newLetter);
}

/**
 * **toggleClass** - _toggle_(add/remove) a [CSS](https://en.wikipedia.org/wiki/CSS) class on a
 * [DOM](https://en.wikipedia.org/wiki/Document_Object_Model) element.
 * @param {*} element the element (object reference)
 * @param {*} className the class to add (string)
 */
function toggleClass(element, className) {
  element.classList.toggle(className);
}

/**
 * toHexString - convert an object to a hexadecimal string
 * @param {} obj - object to be converted
 * @returns string of hexadecimal digits
 */
const toHexString = (obj) => {
  // Fails for circular objects
  return (
    "0x" +
    [...JSON.stringify(obj)]
      .map((c, i) => str.charCodeAt(i).toString(16))
      .join("")
  );
};

/**
 * trace - console logging
 * @param message - string to be logged
 */
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
