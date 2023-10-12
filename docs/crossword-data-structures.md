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

For _multi-segment_ clues, the _clueModel_ is modified by the `newCrosswordModel` function found in [`src/crossword-model.mjs`][1]

The data structure:

```js
{
  // Puzzle solver's upper-cased answer for clue, padded out with spaces
  // for missing characters.
  answer: string,

  // Array[segmentLength] of cells
  // Note, JavaScript Array indexes run from '0' to 'segmentLength - 1'
  cells: array,

  // Unique identifier string for clue. Direction-qualified head segment
  // "5,3." -> "5a", or "5a,3d." -> "5a"
  clueId: string,

  // White-space-stripped clue text (excludes clue label and answer text)
  // "12. Put to rest in Tintern Abbey (5)" -> "Put to rest in Tintern Abbey"
  clueText: string,

  // Numerical component of head-segment label
  // "5,3." -> 5, or "5a,3d." -> 5
  // Used for clue label in cell grid
  headNumber: number,

  // First clue-segment for all segments multi-segment-segments
  // This is self-referential for head clue-segments and simple, one-segment
  // clues. Assigned in newCrosswordModel()
  headSegment: clueModel,

  // True for an "across" clue, false for a "down" clue
  isAcross: Boolean,

  // The display label for the clue "number" - as seen in the clue-block HTML
  // element. Note that the required trailing period(.) from the crossword
  // source has been stripped.
  // "5." -> "5", or "5,3." -> "5,3", or "5a,3d." -> "5,3"
  labelText: string,

  // All the text, including parentheses in clue "length", e.g "(6,3)"
  // Reset to the empty string ("") for tail segments of a multi-segment string
  // in newCrosswordModel().
  lengthText: string,

  // Upper-cased revealed characters of solution.
  // Unrevealed characters are represented by space characters (ASCII #32)
  revealed: string,

  // Length (number of grid characters) for the clue segment, or combined
  // length of a multi-word clue segment
  // "(6)" -> 6, "(5,3,2)" -> 10
  segmentLength: number,

  // Upper-cased and "normalised" puzzle-setter's solution for the
  // clue-segment. Non-alphabetic characters in the crossword source are
  // stripped out of the solution
  solution: string,

  // Ordered array of non-head clue-segments (clueModels)
  // Non-empty for the head segment of a multi-segment clue
  // Empty for simple (single-segment) clues and tail segments of multi-segment
  // clues. Assigned in newCrosswordModel()
  tailSegments: array,

  // Array of tail segment structures of multi-segment clues
  // Empty array for single-segment clue and tail segments of multi-segment clues
  // "5a,3d." -> [{ headNumber: 3, direction: "down"}]
  tailDescriptors: array,

  // Emits a unique identifier for the clue "(clueId)", for example "(16a)"
  // This is automatically invoked whenever a string version of the clue is required.
  toString(),

  // Array of word lengths of clue segment.
  // A one-element array for a single-word clue segment.
  wordLengths: array,

  // Display column number for the first character of the clue segment in the grid.
  // Note that this is one-based, and taken verbatim from the crossword source.
  // Range: [1..crosswordModel.width]
  x: number,

  // Display row number for the first character of the clue segment in the grid.
  // Note that this is one-based, and taken verbatim from the crossword source.
  // Range: [1..crosswordModel.height]
  y: number,
```

> The remaining properties are only defined for multi-segment clues...

```js
  // The prior clue-segment for tail-segments, undefined otherwise.
  // Assigned in newCrosswordModel().
  // (5) => (undefined)
  // (5,3,2) => (undefined, 5, 3)
  previousClueSegment: clueModel,

  // The next clue-segment for non-terminal segments, undefined otherwise.
  // Assigned in newCrosswordModel().
  // (5) => (undefined)
  // (5,3,2) => (3, 2, undefined)
  nextClueSegment: clueModel
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

  // Emits a unique id string for the cell "(x,y)", for example "(3,2)"
  // This is automatically invoked where a string version of the cell is required.
  toString(),
```

> For an "across" clue only, otherwise undefined

```js
    acrossClue: clueModel,
    acrossClueLetterIndex: number, // [0..acrossClue.length)
    // For the last letter of non-terminal word in a multi-word answer, otherwise undefined
    acrossTerminator: true,
```

> For a "down" clue only, otherwise undefined

```js
    downClue: clueModel,
    downClueLetterIndex: number, // [0..downClue.length)
    // For the last letter of non-terminal word in a multi-word answer, otherwise undefined
    downTerminator: true,
```

All clues...

```js
// If the clue has an "answer" property, otherwise " " (space).
  answer: clueModel.answer[letterIndex],

  // If the clue has a "solution" property, otherwise " " (space).
  solution: clueModel.solution[letterIndex],

  // For the first letter of a clue only, otherwise undefined
  //"headNumber" of the clueModel (1-based)
  labelText: number
};
```

[1]: ../src/crossword-model.mjs
[2]: ../src/index.mjs
[3]: #cell
[4]: #clue
[5]: ../src/clue-model.mjs
