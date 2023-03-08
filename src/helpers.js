// Configure trace logging
const tracing = true;

//  Lightweight helper functions.

function addClass(element, className) {
  element.className += ` ${className}`;
}

function first(array) {
  // If array is not nullish, return first element
  return array ? array[0] : null;
}

function last(array) {
  // If array is not nullish, return last element
  return array ? array.at(-1) : null;
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
  const expression = new RegExp(`(?:^|\\s)${className}(?!\\S)`, "g");
  element.className = element.className.replace(expression, "");
}

const trace = (message) => {
  if (tracing) console.log(message);
};

module.exports = {
  addClass,
  first,
  last,
  memoize,
  removeClass,
  trace,
};
