## Index <!-- omit from toc -->

- [crosswordDefinition](#crossworddefinition)
- [Clue](#clue)
- [Multi-word and multi-segment clues](#multi-word-and-multi-segment-clues)
  - [Multi-word clue](#multi-word-clue)
  - [Multi-segment clue](#multi-segment-clue)
- [Samples](#samples)

## crosswordDefinition

The **crosswordDefinition** is a simple JavaScript `Object`, typically  created by _parsing_ a [JSON][6] representation of the crossword clues and metadata. Other representations such as [YAML][7] can be used.

[Here][8] is a JSON crossword definition and [there][9] is a YAML crossword definition. YAML definitions are easier to manually edit. 

The **crosswordDefinition** object can be created _implicitly_ by importing a JSON file
```js
import crosswordDefinition from "./crosswords/ftimes_17095.json";
```
or _explicitly_ by calling the `JSON.parse()` function, passing a JSON-formatted `string` as the argument.
```js
import { readFileSync } from 'fs';

try {  
    var json = readFileSync("./crosswords/ftimes_17095.json", 'utf8');
} catch(e) {
    console.log('Error:', e.stack);

const crosswordDefinition = JSON.parse(json.toString()) 
```
A JSON file is converted to an analogous JavaScript object when it is loaded by the JavaScript code.

It MUST have the following properties:

- **width**: The width of the crossword _(the number of columns)_.
- **height**: The height of the crossword _(the number of rows)_.
- **acrossClues**: An array of [Clue][1] objects which go _across_ the puzzle.
- **downClues**: An array of [Clue][1] objects which go _down_ the puzzle.

It MAY have the following properties

- **info**: An object containing details about the crossword and its setter.

## Clue

A **Clue** in JSON format MUST have the following properties:

- **x**: The column number (1-based) of the first letter(cell) in a clue.
- **y**: The row number (1-based) of the first letter in a clue.
- **clue**: The clue text.This structured text is composed of:
  - **number**:
    - The clue number, such as `16.` or for a [multi-segment][3] clue `4,21.`
    - The number MUST be terminated by a period.
  - **text**: The text of the clue, such as `Outside port finally, make fast a vessel – one that's engine driven`
  - **length**: The length of the answer, an array such as `(6)` or for a [multi-word][4] answer `(5,4)`.

A **Clue** in JSON format MAY have the following properties:

- **solution**: The solution text for the clue. This is a simple string without spaces or punctuation.

```json
// Single-word clue JSON

{
  "x": 2,
  "y": 1,
  "clue": "2. Auntie hit boiling asphalt (9)",
  "solution": "uintahite"
}
```

## Multi-word and multi-segment clues

**Multi-word** clues and **multi-segment** clues are distinct concepts.

### Multi-word clue

**Multi-word** clues occupy a **single clue segment** on the crossword grid. The _clue-word-separators_ are styled distinctly to a typical _clue-cell-separator_.

```json
// Multi-word clue JSON

{
  "x": 10,
  "y": 7,
  "clue": "16. Outside port finally, make fast a vessel – one that's engine driven (5,4)"
}
```

### Multi-segment clue

**Multi-segment** clues occupy **two or more clue segments** on the crossword grid - one grid segment per clue segment. Clue segments _may also_ be _multi-word_ clues.

A **multi-segment** clue:

- A collection of 2+ clue segments on the crossword grid and 2+ clues in the clue lists.
- Clue segments in the collection need not be sequential.
- Each clue segment direction is either _across_ or _down_, not both.
- The clue segment collection contain 0+ segments of both directions (_across_ and _down_).
- The order of segments in a collection is not constrained.
- The **first segment** in a _multi-segment clue_ will be referred to as the **anchor segment**.
- The _number_ property of the _anchor_ clue is an ordered, comma-separated, list of the all the segments in the clue, e.g `4,21.`
  > BUG?: There is no guarantee across and down clue numbers are distinct sets with no intersection. Perhaps we should include an `a` or `d` suffix to the clue number where ambiguity exists?
- The _length_ property of _every_ segment clue, including the anchor clue, refers to the length of the answer for _only_ that segment.
- The _length_ property of every segment may indicate a single-word answer or a _multi-word_ answer.

```json
// Multi-segment clue JSON

// Anchor (first) segment (single-word)
{
      "x": 6, "y": 1,
      "clue": "4,21. The king of 7, this general axed threat strategically (9)"
},
...
// Second segment (multi-word)
{
  "x": 1, "y": 11,
  "clue": "21. See 4 (3,5)"
}
```

## Samples

Two [sample][2] [files][5] can be found in the sample folder

[1]: #clue
[2]: ../sample/crosswords/alberich_4.json
[3]: #multi-segment-clue
[4]: #multi-word-and-multi-segment
[5]: ../sample/crosswords/guardian_quiptic_89.json
[6]: https://www.w3schools.com/whatis/whatis_json.asp
[7]: https://www.redhat.com/en/topics/automation/what-is-yaml
[8]: ../dev/crosswords/ftimes_17095.json
[9]: ../dev/crosswords/ftimes_17095.yml