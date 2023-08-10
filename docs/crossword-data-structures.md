# Crossword data structures <!-- omit from toc -->

- [crosswordModel](#crosswordmodel)
- [clueModel](#cluemodel)
- [cell](#cell)

## crosswordModel

The **crosswordModel** is the data structure built by the `newCrosswordModel` function found in [`src/crossword-model.mjs`][1], and exported from the **crosswords-js** module ([`src/index.mjs`][2]) as `compileCrossword`.

The data structure:

```js
{
  // CrosswordDefinition.width
  width: number,
  // CrosswordDefinition.height
  height: number,
  // One-dimensional array of clueModels
  acrossClues: array,
  // One-dimensional array of clueModels
  downClues: array,
  // Two-dimensional array of cells:
  // [0..crosswordDefinition.width) columns,
  // [0..crosswordDefinition.height) rows
  cells: array,
};
```

- `acrossClues` and `downClues` are one-dimensional arrays of [**clueModel**][4]s.
- `cells` is a two-dimensional array of [**cells**][3].

## clueModel

The **clueModel** is the data structure built by the `newClueModel` function found in [`src/clue-model.mjs`][5].

The data structure:

```js
{
  // Puzzle solver's upper-cased answer for clue, padded out with spaces
  // for missing characters.
  answer: string,
  // Length of clue segment, or combined length of multi-word clue segment
  // "(6)" -> 6, "(5,3,2)" -> 10
  answerLength: number,
  // Text of answer length, all the text between parentheses, e.g "(6,3)" -> "6,3"
  answerLengthText: string,
  // Array of answer segments, e.g.
  // (5,3,2) => [
  //   {length: 5, terminator: ","},
  //   {length: 3, terminator: ","},
  //   {length: 2, terminator: ""},
  // ]
  answerSegments: array,
  // Array [0..answerLength) of cells
  cells: array,
  // String: numerical component of anchor-segment label
  // "5,3." -> "5", or "5a,3d." -> "5"
  clueLabel: string,
  // White-space-stripped clue text (excludes clue label and answer text)
  // "12. Put to rest in Tintern Abbey (5)" -> "Put to rest in Tintern Abbey"
  clueText: string,
  // String: anchor-segment label
  // "5,3." -> "5", or "5a,3d." -> "5a"
  code: string,
  // Array of tail (non-anchor) segment structures of multi-segment clues
  // empty array for single-segment clue
  // "5a,3d." -> [{ number: 3, direction: "down"}]
  connectedDirectedClues: array,
  // True for an "across" clue, false for a "down" clue
  isAcross: Boolean,
  // Numerical component of anchor-segment label
  // "5,3." -> 5, or "5a,3d." -> 5
  number: number,
  // Upper-cased revealed characters of solution; unrevealed characters are spaces
  revealed: string,
  // Upper-cased and "normalised" puzzle-setter's solution for clue:
  // Non-alphabetic characters are stripped out of solution
  solution: string,
  // Column number for first character of clue in grid [1..crosswordModel.width]
  x: number,
  // Row number for first character of clue in grid [1..crosswordModel.height]
  y: number,
  // Array of connected clueModels for a multi-segment clue, otherwise undefined.

  //// The remaining properties are only defined for multi-segment clues...

  // Ordered array of connected clue-segments (clueModels)
  connectedClues: array,
  // First clue-segment of connected clue-segments,
  parentClue: clueModel,
  // The prior clue-segment for non-anchor-segments, undefined otherwise
  previousClueSegment: clueModel,
  // The next clue-segment for non-tail-segments, undefined otherwise
  nextClueSegment: clueModel,
  // true
  isConnectedClue: Boolean
};
```

## cell

**crosswordModel.cells** is the data structure built by the `buildCellGrid` function found in [`src/clue-model.mjs`][5].

Each _cell_ has the structure:

```js
{
  // The associated crosswordModel data structure
  model: crosswordModel,
  // Cell row index [0..crosswordModel.width)
  x: number,
  // Cell column index [0..crosswordModel.height)
  y: number,

  // For a "clue" cell, aka "light" cell, otherwise undefined
  light: true,

  // For an "across" clue, otherwise undefined
  acrossClue: clueModel,
  acrossClueLetterIndex: number, // [0..acrossClue.length]
  // For the last letter of non-terminal word in a multi-word answer, otherwise undefined
  acrossTerminator: string,

  // For a "down" clue, otherwise undefined
  downClue: clueModel,
  downClueLetterIndex: number, // [0..downClue.length]
  // For the last letter of non-terminal word in a multi-word answer, otherwise undefined
  downTerminator: string,

  // If the clue has an "answer" property, otherwise " " (space).
  answer: clueModel.answer[letterIndex],

  // If the clue has a "solution" property, otherwise " " (space).
  solution: clueModel.solution[letterIndex],

  // For the first letter of a clue only, otherwise undefined
  //"Number" of the clue from the crosswordDefinition (1-based)
  clueLabel: number
};

```

[1]: ../src/crossword-model.mjs
[2]: ../src/index.mjs
[3]: #cell
[4]: #clue
[5]: ../src/clue-model.mjs
