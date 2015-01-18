# Crossword.js

Tiny, lightweight crossword for control for the web.

### Desgin Goals

* No frameworks
* Fast
* Lightweight
* Any device

Crossword Definition -> buildModel -> Crossword Model
Crossword Model -> buildCrossword -> Crossword ?


### Tips and Tricks

 * Run the karma tests by installing the karma-cli.
   ```
   npm install -g karma-cli
   karma todo
   ```

### TODO

 * DONE: Typing a letter overwrites the letter
 * DONE: Typing a letter moves to the next available letter
 * DONE: Selecting a cell focuses the clue
 * tab selects the next clue
 * selecting a cell with a down clue using the mouse prefers
   the down clue if it's the starting cell
 * enter changes orientation if possible
 * State reported in demo
 * DONE: Fix defocus bug
 * don't use cdns (shit when poor connectivity)

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

### Keyboard Functionality

Left/Right/Up/Down: Move (if possible) to the cell in the direction specified.
Space: Move to the next cell in the focused clue, if one exists.
Backspace: Move to the previous cell in the focused clue, if one exists.
Tab: Move to the first cell of the next clue, 'wrapping' to the first clue.
A-Z: Enter the character. Not locale aware!
Enter: Switch between across and down.