## Index <!-- omit from toc -->

- [CrosswordDefinition](#crossworddefinition)
- [Clue](#clue)
  - [Multi-word and multi-segment](#multi-word-and-multi-segment)
  - [Multi-segment clue](#multi-segment-clue)
- [Sample](#sample)

## CrosswordDefinition

The **CrosswordDefinition** is a minimal object in JSON format that defines the
crossword.The JSON file is converted to an analogous JavaScript object when it is loaded by the JavaScript code.

It MUST have the following properties:

- **width**: The width of the crossword _(the number of columns)_.
- **height**: The height of the crossword _(the number of rows)_.
- **acrossClues**: An array of [Clue][1] objects which go _across_ the puzzle.
- **downClues**: An array of [Clue][1] objects which go _down_ the puzzle.

It MAY have the following properties

- **info**: An object containing details about the crossword and its setter.

## Clue

A **Clue** has the following properties:

- **x**: The column number (1-based) of the first letter(cell) in a clue.
- **y**: The row number (1-based) of the first letter in a clue.
- **clue**: The clue text.This structured text is composed of:
  - **number**:
    - The clue number, such as `16.` or for a [multi-segment][3] clue `4,21.`
    - The number MUST be terminated by a period.
  - **text**: The text of the clue, such as `Outside port finally, make fast a vessel – one that's engine driven`
  - **length**: The length of the answer, an array such as `(6)` or for a [multi-word][4] answer `(5,4)`.

### Multi-word and multi-segment

- **Multi-word** answers and **multi-segment** clues are distinct concepts.
- _Mult-word_ answers occupy a _single_ clue on the crossword grid. The clue-word separators may be styled separately to a typical clue-cell separator.
- _Multi-segment_ clues occupy _two or more_ clues on the crossword grid - one clue per segment. Segments MAY also be _multi-word_ answers.

### Multi-segment clue

A **mult-segment** clue:

- A collection of 1+ clues on the crossword grid and in the clue lists.
- Clue segments in the collection need not be sequential.
- Each segment direction is either _across_ or _down_.
- The collection contain 0+ segments of both directions.
- The order of segments in a collection is not constrained.
- The first segment in a multi-segment will be referred to as the **anchor** clue.
- The _number_ property of the _anchor_ clue is an ordered, comma-separated, list of the all the segments in the clue, e.g `4,21.`
  > BUG: There is no guarantee across and down clue numbers are distinct sets with no intersection. Perhaps we should include an `a` or `d` suffix to the clue number where ambiguity exists?
- The _length_ property of _every_ segment clue, including the anchor clue, refers to the length of the answer for _only_ that segment.
- The _length_ property of every segment may indicate a single-word answer or a _multi-word_ answer.

## Sample

A [sample file][2] can be found in the sample folder

[1]: #clue
[2]: ../sample/crosswords/albreich*4.json
[3]: #multi-segment-clue
[4]: #multi-word-and-multi-segment
