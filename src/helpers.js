//  Lightweight helper functions.
function removeClass(element, className) {
  const expression = new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g');
  element.className = element.className.replace(expression, '');
}

function addClass(element, className) {
  element.className += ` ${className}`;
}

module.exports = {
  removeClass,
  addClass,
};
