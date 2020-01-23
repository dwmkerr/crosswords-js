//  Lightweight helper functions.
export function removeClass(element, className) {
  const expression = new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g');
  element.className = element.className.replace(expression, '');
}

export function addClass(element, className) {
  element.className += ` ${className}`;
}
