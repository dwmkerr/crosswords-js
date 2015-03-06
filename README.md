# Crossword.js

Tiny, lightweight crossword for control for the web.

**Work in progress!**

### Desgin Goals

* No frameworks
* Fast
* Lightweight
* Any device

### Coding

Check out the code, then:

```
npm install
bower install
gulp
```

The samples will run at the address [localhost:3000](http://localhost:3000/). Tests run
when the code changes.

#### The Crossword Definition

The Crossword Definition is a minimal object that defines the
crossword. It should have the following properties:

crosswordDefinition.width: The width of the crossword.
crosswordDefinition.height: The hight of the crossword.
crosswordDefinition.acrossClues: The clues which go across.
crosswordDefinition.downClues: The clues which go down.

Clues have the following fields:

clue.number: The clue number.
clue.length: The length, an array such as [6] or [4,2].
clue.clue: The actual clue text.

### The Crossword Model

The Crossword Model is the object built by the main `crossword` function.

### State Changed Messages

`clueSelected`: Fired when the selected clue is changed.


### Keyboard Functionality

Left/Right/Up/Down: Move (if possible) to the cell in the direction specified.
Space: Move to the next cell in the focused clue, if one exists.
Backspace: Move to the previous cell in the focused clue, if one exists.
Tab: Move to the first cell of the next clue, 'wrapping' to the first clue.
A-Z: Enter the character. Not locale aware!
Enter: Switch between across and down.
webdriver-manager update