# CrosswordsJS

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

The public API is exposed on a module named `CrosswordsJS`. The one-and-only function
is `buildCrossword`:

```js
var crossword = CrosswordsJS.buildCrossword({
  element: document.body,
  crosswordDefinition: definition
});

`buildCrossword` options are:

 * `element`: Required. Defines the element which will contain the crossword DOM.
 * `crosswordDefinition`. Required. An object that defines the crossword (dimensions, clues etc).
   More details are available in the [docs](docs/) under [The Crossword Definition Object](docs/crossworddefinition.md).

`buildCrossword` returns an object that allows you to interact with the crossword programmatically. See [The Crossword Object](docs/crosswordobject.md) for more details.

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