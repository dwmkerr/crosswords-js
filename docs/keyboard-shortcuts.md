# Crossword grid keyboard shortcuts <!-- omit from toc -->

- [Overriding keyboard shortcuts](#overriding-keyboard-shortcuts)
- [Default shortcuts - The Guardian](#default-shortcuts---the-guardian)
  - [Problems](#problems)
- [Alternative shortcuts - The Age and Sydney Morning Herald (Australia)](#alternative-shortcuts---the-age-and-sydney-morning-herald-australia)
  - [Problems](#problems-1)

## Overriding keyboard shortcuts

Keyboard shortcuts can be [customised][3] to suit your preferences.

## Default shortcuts - [The Guardian][2]

- ARROW KEYS: Move (if possible) to the cell in the direction specified.
- SPACEBAR: Move to the next cell in the focused clue, if one exists.
  - SHIFT+SPACEBAR reverses the direction - move 'backwards'.
    - _This is non-Guardian functionality_
- DELETE: Delete the current cell.
- BACKSPACE: Delete the current cell, and move to the previous cell in the focused clue, if one exists.
- TAB: Move to the first cell of the next clue, 'wrapping' to the first clue in the opposite direction.
  - SHIFT+TAB reverses the direction - move 'backwards'.
- A-Z: Enter the character and advance to next character in clue. Not locale aware!
- ENTER: Switch between across and down at clue intersections.
  - _This is non-Guardian functionality_

### Problems

- Clue list cannot be selected via the keyboard.
- No keyboard navigation within the clue list.
- Arrow key movement is bounded to current clue - by design? The TAB is used to navigate _between_ clues. Change of direction/clue is possible at crossing clue intersection via the ENTER key.

## Alternative shortcuts - Nine - publishers of [The Age][1] and [Sydney Morning Herald][4] (Australia)

- ARROW KEYS navigate the crossword squares.
  - Dark squares are skipped
  - ARROW KEYS do not wrap to beginning/end when a crossword border is reached.
- ENTER cycles through the clues in the board
  - (use SHIFT-ENTER to cycle in reverse).
- TAB selects the clue list and then highlights each clue.
  - Use SHIFT-TAB to cycle in reverse
  - Use ENTER to return to the crossword grid.The currently highlighted clue will be selected in the crossword grid.
  <!-- TODO: Confirm the actions below -->
- SPACEBAR, DELETE and BACKSPACE all delete the selected square and move to the previous one.

### Problems

- No way to switch between across and down in the grid.

[1]: https://www.theage.com.au/puzzles/crosswords/
[2]: https://www.theguardian.com/crosswords/
[3]: ./module-api.md#3-changing-keyboard-shortcuts
[4]: https://www.smh.com.au/puzzles/crosswords/
