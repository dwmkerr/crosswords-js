# CrosswordsJS

[![CircleCI](https://circleci.com/gh/dwmkerr/crosswords-js.svg?style=shield)](https://circleci.com/gh/dwmkerr/crosswords-js) [![codecov](https://codecov.io/gh/dwmkerr/crosswords-js/branch/master/graph/badge.svg)](https://codecov.io/gh/dwmkerr/crosswords-js) [![GuardRails badge](https://badges.guardrails.io/dwmkerr/crosswords-js.svg?token=569f2cc38a148f785f3a38ef0bcf5f5964995d7ca625abfad9956b14bd06ad96&provider=github)](https://dashboard.guardrails.io/default/gh/dwmkerr/crosswords-js)

**IMPORTANT**: This is work in progress! The API may change dramatically as I work out what is most suitable.

Tiny, lightweight crossword for control for the web. Crossword.js is:

* Lightweight
* Fast
* Simple
* Framework Free

Demo: [dwmkerr.github.io/crosswords-js/](https://dwmkerr.github.io/crosswords-js/)

<a href="https://dwmkerr.github.io/crosswords-js/"><img src="./docs/screenshot.png" alt="CrosswordsJS Screenshot" width="480px" /></a>

<!-- vim-markdown-toc GFM -->

* [Quickstart](#quickstart)
* [Developer Guide](#developer-guide)
* [Keyboard Functionality](#keyboard-functionality)
* [Crossword Definition Tips](#crossword-definition-tips)
* [Design Goals](#design-goals)
* [TODO](#todo)

<!-- vim-markdown-toc -->

## Quickstart

Install:

```sh
npm install crosswords-js
```

Include the JavaScript and CSS:

```html
<link href="node_modules/crosswords-js/dist/crosswords.css" rel="stylesheet">
<script src="node_modules/crosswords-js/dist/crosswords.js"></script>
```

To create a crossword, you start with a _Crossword Definition_, which is a simple JSON representation of a crossword:

```js
{
  "width": 15,
  "height": 15,
  "acrossClues": [
    {
      "x": 2, "y": 1,
      "clue": "1. Conspicuous influence exerted by active troops (8,5)"
    },
    {
      "x": 1, "y": 3,
      "clue": "10. A coy sort of miss pointlessly promoting lawlessness (9)"
    }
  ]
}
```

This definition needs to be compiled into a _Crossword Model_. The model is a two dimensional array of cells. This model is used as the input to create the DOM. Compiling the model validates it, making sure that there are no incongruities in the structure (such as overlapping clues, clues which don't fit in the bounds and so on):

```js
//  Load the crosswords.js API and the crossword definition.
const CrosswordsJS = require('crosswords-js');
const crosswordDefintion = require('./my-crossword.json');

//  Compile the crossword.
try {
  const crosswordModel = CrosswordsJS.compileCrossword(crosswordDefinition);
} catch (err) {
  console.log(`Error compiling crossword: ${err}`);
}
```

The model can be used to build the DOM for a crossword:

```js
//  Build the crossword HTML, as a child of the document body element.
var crosswordDom = new CrosswordsJS.CrosswordsDOM(document, crosswordModel, document.body);
```

## Developer Guide

Ensure you are using Node LTS. I recommend using [Node Version Manager](https://github.com/nvm-sh/nvm) for this:

```sh
nvm install --lts
nvm use --lts
```

Check out the code, then run:

```sh
make serve
```

The sample will run at the address [localhost:8080](http://localhost:3000/).

Run the tests with:

```sh
npm test
```

## Keyboard Functionality

- Left/Right/Up/Down: Move (if possible) to the cell in the direction specified.
- Space: Move to the next cell in the focused clue, if one exists.
- Backspace: Move to the previous cell in the focused clue, if one exists.
- Tab: Move to the first cell of the next clue, 'wrapping' to the first clue.
- A-Z: Enter the character. Not locale aware!
- Enter: Switch between across and down.

## Crossword Definition Tips

**How do I create a clue which spans multiple parts of a crossword?**

This is a little fiddly. I have tried to ensure the syntax is as close to what a reader would see in a printed crossword to make this as clear as possible. Here is an example:

```
{
  "downClues": [{
    "x": 6, "y": 1
    "clue": "4,21. The king of 7, this general axed threat strategically (9)"
  }],
  "acrossClues": [{
    "x": 1, "y": 11,
    "clue": "21 See 4 (3,5)"
  }]
}
```

Note that the _answer structure_ (which would be `(9,3,5)` in a linear clue) has separated. However, the crossword will render the full answer structure for the first clue (and nothing for the others).

An example of a crossword with many non-linear clues is at: https://www.theguardian.com/crosswords/cryptic/28038 - I have used this crossword for testing (but not included the definition in the codebase as I don't have permissions to distribute it).

## Design Goals

This project is currently a work in progress. The overall design goals are:

1. This should be _agnostic_ to the type of crossword. It shouldn't depend on any proprietary formats or structures used by specific publications.
2. This should be _accessible_, and show how to make interactive content which is inclusive and supports modern accessibility patterns.
3. This project should be _simple to use_, without requiring a lot of third party dependencies or knowledge.

## TODO

This is a scattergun list of things to work on, once a good chunk of these have been done the larger bits can be moved to GitHub Issues:

- [x] fix: the border on word separators slightly offsets the rendering of the grid
- [ ] feat(accessibility): get screenreader requirements
- [ ] refactor: Simplify the static site by removing Angular and Bootstrap, keeping everything as lean and clean as possible.
- [ ] refactor: finish refactoring classes to simple functions (compileCrossword, createDOM etc)
- [ ] feat: support clues which span non-contiguous ranges (such as large clues with go both across and down).
- [ ] feat: simplify the crossword model by using `a` or `d` for `across` or `down` in the clue text (meaning we don't have to have two arrays of clues)
- [ ] feat: allow italics with underscores, or bold with stars (i.e. very basic markdown)...
- [ ] feat: clicking the first letter of a clue which is part of another clue should allow for a toggle between directions
- [ ] todo: document the clue structure
- [ ] refactor: re-theme site to a clean black and white serif style, more like a newspaper
