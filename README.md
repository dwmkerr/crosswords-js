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

### TODO

 * DONE: Typing a letter overwrites the letter
 * DONE: Typing a letter moves to the next available letter
 * DONE: Selecting a cell focuses the clue
 * DONE: tab selects the next clue
 * shift tab selects previous clue
 * selecting a cell with a down clue using the mouse prefers
   the down clue if it's the starting cell
 * DONE: enter changes orientation if possible
 * State reported in demo
 * DONE: Fix defocus bug
 * don't use cdns (shit when poor connectivity)
 * Better AngularJS based sample app
 * Styling on right and bottom edges is wrong.
 * Support select clue in sample app
 * DONE: Side by side across and down clues in sample app.
 * Numbers shouldn't be in the titles of clues.
 
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