# CrosswordsJS

[![CircleCI](https://circleci.com/gh/dwmkerr/crosswords-js.svg?style=shield)](https://circleci.com/gh/dwmkerr/crosswords-js) [![codecov](https://codecov.io/gh/dwmkerr/crosswords-js/branch/master/graph/badge.svg)](https://codecov.io/gh/dwmkerr/crosswords-js)

**IMPORTANT**: This is work in progress! The API may change dramatically as I work out what is most suitable. It is also being heavily refactored after not being worked on for a few years.

Tiny, lightweight crossword for control for the web. This component makes it easy
to include a crossword in a web page. CrosswordsJS is:

* Very lightweight
* Fast
* Simple
* Framework Free

See it in action at [dwmkerr.github.io/crosswords-js/](https://dwmkerr.github.io/crosswords-js/)!

<a href="https://dwmkerr.github.io/crosswords-js/"><img src="./docs/screenshot.png" alt="CrosswordsJS Screenshot" width="480px" /></a>

<!-- vim-markdown-toc GFM -->

* [Usage](#usage)
    * [Coding](#coding)
    * [Keyboard Functionality](#keyboard-functionality)
* [Design Goals](#design-goals)
* [TODO](#todo)

<!-- vim-markdown-toc -->

## Usage

Install:

```sh
npm install crosswords-js
```

Include the JavaScript and CSS:

```html
<link href="node_modules/crosswords-js/dist/crosswords.css" rel="stylesheet">
<script src="node_modules/crosswords-js/dist/crosswords.js"></script>
```

The public API is exposed on a module named `CrosswordsJS`. There are two classes for working with crosswords. The first creates a `Crossword` object from a [Crossword Definition](docs/crossworddefinition.md).

```js
var crossword = new CrosswordsJS.Crossword(definition);
```

The crossword returned is fully validated and has a model which contains cells.
This object can be used to build the actual DOM for a crossword:

```js
var crosswordDom = new CrosswordsJS.CrosswordDOM(crossword, document.body);
```

### Coding

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

### Keyboard Functionality

- Left/Right/Up/Down: Move (if possible) to the cell in the direction specified.
- Space: Move to the next cell in the focused clue, if one exists.
- Backspace: Move to the previous cell in the focused clue, if one exists.
- Tab: Move to the first cell of the next clue, 'wrapping' to the first clue.
- A-Z: Enter the character. Not locale aware!
- Enter: Switch between across and down.

## Design Goals

This project is currently a work in progress. The overall design goals are:

1. This should be _agnostic_ to the type of crossword. It shouldn't depend on any proprietary formats or structures used by specific publications.
2. This should be _accessible_, and show how to make interactive content which is inclusive and supports modern accessibility patterns.
3. This project should be _simple to us_, without requiring a lot of third party dependencies or knowledge.

## TODO

This is a scattergun list of things to work on, once a good chunk of these have been done the larger bits can be moved to GitHub Issues:

- [ ] refactor: Simplify the static site by removing Angular and Bootstrap, keeping everything as lean and clean as possible.
