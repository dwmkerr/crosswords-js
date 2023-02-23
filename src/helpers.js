//  Lightweight helper functions.
function removeClass(element, className) {
  const expression = new RegExp(`(?:^|\\s)${className}(?!\\S)`, "g");
  element.className = element.className.replace(expression, "");
}

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
module.exports = {
  removeClass,
  addClass,
  first,
  last,
};
