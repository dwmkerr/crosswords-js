# Crossword grid keyboard shortcuts <!-- omit from toc -->

- [Default - The Guardian](#default---the-guardian)
  - [Problems](#problems)
- [The Age (Melbourne, Australia)](#the-age-melbourne-australia)
  - [Problems](#problems-1)

## Default - [The Guardian][2]

- ARROW KEYS: Move (if possible) to the cell in the direction specified.
- SPACEBAR: Move to the next cell in the focused clue, if one exists.
- DELETE: Delete the current cell.
- BACKSPACE: Delete the current cell, and move to the previous cell in the focused clue, if one exists.
- TAB: Move to the first cell of the next clue, 'wrapping' to the first clue.
  - SHIFT-TAB reverses the direction
- A-Z: Enter the character and advance to next character in clue. Not locale aware!
- ENTER: Switch between across and down at clue intersections.
  - _This is non-Guardian functionality_

### Problems

- Clue list cannot be selected via the keyboard.
- No keyboard navigation within the clue list.
- Arrow key movement is bounded to current clue - by design? Tab used to navigate _between_ clues. Change of direction/clue is possible at crossing clue intersection.

## [The Age][1] (Melbourne, Australia)

- ARROW KEYS navigate the crossword squares.
  - Dark squares are skipped
  - ARROW KEYS do not wrap to beginning/end when a crossword border is reached.
- ENTER cycles through the clues in the board
  - (use SHIFT-ENTER to cycle in reverse).
- TAB selects the clue list and then highlights each clue.
  - Use SHIFT-TAB to cycle in reverse
  - Use ENTER to return to the crossword grid.The currently highlighted clue will be selected in the crossword grid.
- SPACEBAR, DELETE and BACKSPACE all delete the selected square and move to the previous one.

### Problems

- No way to switch between across and down in the grid.

[1]: https://www.theage.com.au/puzzles/crosswords/
[2]: https://www.theguardian.com/crosswords/
