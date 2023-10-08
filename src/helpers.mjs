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
function addClasses(element, classNames) {
  classNames.forEach((cn) => {
    element.classList.add(cn);
  });
}

/**
 * **assert** - logical constraint testing
 * @param condition - test expression (boolean)
 * @param message - (string) recorded on test failure - _condition_ evaluates to `false`.
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

//// Shortcut functions

const eid = (elementId, dom = document) => {
  return dom.getElementById(elementId);
};

// Returns an array of elements
const ecs = (elementClass, dom = document) => {
  return dom.getElementsByClassName(elementClass);
};

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
 * @param index - the index of _original_ to start the overlay. Negative values supported like `string.slice()`.
 * @param str - the overlaying text
 * @returns the mutated _original_. Any null or undefined arguments returns _original_.
 * _index_ outside range [0,_original_.length) returns _original_.
 */
function replaceStrAt(original, index, str) {
  let result = original;
  if (original && index != null && str) {
    let pos = parseInt(index, 10);
    if (pos < 0) {
      // Normalise negative index values
      pos = original.length + pos;
    }
    if (pos >= 0 && original.length > pos) {
      result = `${original.slice(0, pos)}${str}${original.slice(
        pos + str.length,
      )}`;
    }
  }
  return result;
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
  const id = 'id_Z?7kQ;x8j!';
  const cache = {};
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
  let result = source === null || source === undefined ? '' : source;
  result = result.padEnd(index + 1, ' ');
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
  return `0x${[...JSON.stringify(obj)]
    .map((c, i) => str.charCodeAt(i).toString(16))
    .join('')}`;
};

// module scope variable to toggle log tracing
let tracingEnabled = false;

/**
 * **tracing** - enable or disable console logging
 * @param {*} enabled logging is on/off
 */
const tracing = (enabled) => {
  tracingEnabled = enabled;
};

/**
 * trace - console logging
 * @param action - 'log', 'warn' or 'error'. Default is 'log'
 * @param message - string to be logged
 */
const trace = (message, action = 'log') => {
  if (tracingEnabled) {
    assert(
      ['log', 'warn', 'error'].includes(action),
      `Unsupported action'${action}'.`,
    );
    console[action](message);
  }
};

// https://dev.to/adancarrasco/implementing-pub-sub-in-javascript-3l2e
// Topics should only be modified from the eventRouter itself (return value of newPubSub)
const newPubSub = () => {
  const topics = {};
  const hOP = topics.hasOwnProperty;

  return {
    publish: (topic, info) => {
      // No topics
      if (!hOP.call(topics, topic)) return;

      // Emit the message to any of the receivers
      topics[topic].forEach((item) => {
        // Send any arguments if specified
        item(info !== undefined ? info : {});
      });
    },
    subscribe: (topic, callback) => {
      // Create the array of topics if not initialized yet
      if (!hOP.call(topics, topic)) topics[topic] = [];

      // We define the index where this receiver is stored in the topics array
      const index = topics[topic].push(callback) - 1;

      // When we subscribe we return an object to later remove the subscription
      return {
        remove: () => {
          delete topics[topic][index];
        },
      };
    },
  };
};

function newEnum(values) {
  const enumeration = {};
  for (const val of values) {
    enumeration[val] = val;
  }
  return Object.freeze(enumeration);
}

export {
  addClass,
  addClasses,
  assert,
  ecs,
  eid,
  first,
  last,
  memoize,
  newPubSub,
  removeClass,
  replaceStrAt,
  setLetter,
  toggleClass,
  toHexString,
  trace,
  tracing,
};
