# CrosswordsJS

[![Greenkeeper badge](https://badges.greenkeeper.io/dwmkerr/crosswords-js.svg)](https://greenkeeper.io/)

**IMPORTANT**: This is work in progress! The API may change dramatically
as I work out what is most suitable.

Tiny, lightweight crossword for control for the web. This component makes it easy
to include a crossword in a web page. CrosswordsJS is:

* Very lightweight
* Fast
* Simple
* Framework Free

## Usage

Install with bower:

```bash
bower install crosswords-js
```

Include the JavaScript and CSS:

```html
<link href="bower_components/crosswords-js/crosswords.css" rel="stylesheet">
<script src="bower_copmonents/crosswords-js/crosswords.js"></script>

```

The public API is exposed on a module named `CrosswordsJS`. There are two classes
for working with crosswords. The first creates a `Crossword` object from a [Crossword
Definition](docs/crossworddefinition.md).

```js
var crossword = new CrosswordsJS.Crossword(definition);
```

The crossword returned is fully validated and has a model which contains cells.
This object can be used to build the actual DOM for a crossword:

```js
var crosswordDom = new CrosswordsJS.CrosswordDOM(crossword, document.body);
```

### Coding

Check out the code, then:

```
npm install
bower install
gulp
```

The samples will run at the address [localhost:3000](http://localhost:3000/). Tests run
when the code changes.

#### Working with Tests

Tests are automatically run in PhantomJS as you code. The following gulp commands
can also be used:

 * `gulp test`: Runs the tests once in PhantomJS.
 * `gulp test-debug`: Runs the tests in Chrome, keeping the window open and reloading
    when any changes. Useful for debugging tests.

### Keyboard Functionality

Left/Right/Up/Down: Move (if possible) to the cell in the direction specified.
Space: Move to the next cell in the focused clue, if one exists.
Backspace: Move to the previous cell in the focused clue, if one exists.
Tab: Move to the first cell of the next clue, 'wrapping' to the first clue.
A-Z: Enter the character. Not locale aware!
Enter: Switch between across and down.
webdriver-manager update