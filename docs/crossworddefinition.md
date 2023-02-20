
- [CrosswordDefinition](#crossworddefinition)
- [Clue](#clue)
- [Sample](#sample)


## CrosswordDefinition

The **CrosswordDefinition** is a minimal object in JSON format that defines the
crossword.The JSON file is converted to an analogous JavaScript object when it is loaded by the JavaScript code.

It MUST have the following properties:

- **width**: The width of the crossword *(the number of columns)*.
- **height**: The height of the crossword *(the number of rows)*.
- **acrossClues**: An array of [Clue][1] objects which go *across* the puzzle.
- **downClues**: An array of [Clue][1] objects which go *down* the puzzle.

It MAY have the following properties

- **info**: An object containing details about the crossword and its setter.

## Clue

A **Clue** has the following properties:

- **x**: The column number (1-based) of the first letter(cell) in a clue.
- **y**: The row number (1-based) of the first letter in a clue
- **clue**: The clue text.This structured text is composed of: 
  - **number**: The clue number, such as `16.`
  - **text**: The text of the clue, such as `Outside port finally, make fast a vessel – one that's engine driven`
  - **length**: The length of the answer, an array such as `(6)` or `(5,4)`.

## Sample

A [sample file][2] can be found in the sample folder

[1]: #clue
[2]: ../sample/crosswords/albreich_4.json