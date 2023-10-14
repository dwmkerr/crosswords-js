# Crossword domain concepts <!-- omit from toc -->

- [Glossary](#glossary)
- [Crossword source](#crossword-source)
- [Crossword definition](#crossword-definition)
  - [Properties](#properties)
  - [Clue segment](#clue-segment)
    - [List separators](#list-separators)
  - [Multi-word segments and multi-segment clues](#multi-word-segments-and-multi-segment-clues)
    - [Multi-word segment](#multi-word-segment)
    - [Multi-segment clue](#multi-segment-clue)
- [Sample crosswords](#sample-crosswords)

## Glossary

- A **crossword** is a puzzle compiled by a puzzle **setter** and solved by a puzzle **solver**.
  - A _crossword_ comprises two visual elements:
    - the crossword **grid** - a **cell** grid containing vertical and horizontal **clue segments**.
    - the crossword **clue-block** - the _clues_, partitioned into **across** (horizontal) and **down** (vertical) numerically ordered _clue segment_ lists.
  - A crossword is _imported_ or _parsed_...
    - _from_ the [**crossword source**][17], a textual representation of the crossword puzzle in a structured text format such as [JSON][6] or [YAML][7]
    - _into_ a [**crossword definition**][16], a data-only JavaScript `Object` which is a literal translation of the _crossword source_ file.
- A **clue** comprises one or more _clue segments_.
- A **clue segment** is a _contiguous_, horizontal (across) or vertical (down) _uni-directional_ collection of light-coloured _cells_ on the _crossword grid_. The clue segment appears in the _clue-block_ partition matching the direction of the clue segment in the _grid_, i.e. across or down.
- A _clue segment_ contains one or more whole **words**.
- A _clue segment_ may have a **solution** set by the _puzzle setter_, and a complete or partial **answer**, as entered by the _puzzle solver_.
- A [multi-segment][3] clue comprises two or more _clue segments_. There are no constraints on the clue-list-declared order or direction of the clue segments.
- The **head** segment is the (syntactic) _first_ segment of a _multi-segment_ clue. This segment contains the leading **word/words** of the **phrase** spread over the multiple segments.
- A [multi-word][15] clue segment contains _two_ or more whole _words_.
- Hyphenated words, words with embedded commas, and acronyms are all considered _multi-words_ in the clue _length_ property described [below][1].

## Crossword source

The **crossword source** is the puzzle compiled by the puzzle _setter_. More formally, it is a textual representation of a _crossword_, in a structured text format such as [JSON][6] or [YAML][7]. A _crossword source_ must be converted to a [crossword definition][16] before being displayed by this module.

- [Here][8] is a _crossword source_ in JSON and [there][9] is a YAML one.
- The [JavaScript][18] language supports implicit conversion of JSON documents to JavaScript objects via the `import` keyword.

```js
import crosswordDefinition from 'path/to/crossword-source.json';
```

- YAML documents are easier for humans to create and edit, but must be explicitly converted to a [crossword definition][16]. This is straightforward utilising the [yaml][26] Node module:

```js
// A Node project using crosswords-js...
import { newCrosswordDefinition } from 'crosswords-js';
const crosswordDefinition = newCrosswordDefinition(
  'application/yaml',
  documentText,
);

// Using simple JavaScript...
import YAML from 'yaml';
const crosswordDefinition = YAML.parse(documentText);
```

## Crossword definition

A **crossword definition** is a JavaScript `Object`, created by implicitly or explicitly _parsing_ the [crossword source][17].

A _crosswordDefinition_ object can be created _implicitly_ by importing a JSON file...

```js
// Server-side code
import crosswordDefinition from 'data/ftimes_17095.json';
```

...or _explicitly_ parsing a JSON or YAML file by calling the `convertSourceFileToDefinition` function, passing the file MIME type and a system file path as the argument.

```js
import { convertSourceFileToDefinition } from 'crosswords-js';

// JSON example
const crosswordDefinition = convertSourceFileToDefinition(
  'application/json',
  '../data/ftimes_17095.json',
);

// YAML example
const crosswordDefinition = convertSourceFileToDefinition(
  'application/yaml',
  '../data/ftimes_17095.yml',
);
```

> To load an **arbitrary** file selected by the [puzzle solver][27] or _user_, a different approach must be used. File-system access is limited by the browser security model, and file system paths cannot be used to identify a file.
>
> For a [FileReader][13]-based example, refer to the `loadCrosswordPuzzle` function in [`dev/index.js`][12]

### Properties

A _crossword definition_ **MUST** have the following properties:

- `document:` An _object_ containing details about the format of the document.

  - `mimetype: application/vnd.js-crossword` (proposed [MIME type][21])
  - `version: 1.0` ([semantic `version`][20] string)

- `width:` The width of the crossword _(the number of columns)_.
- `height:` The height of the crossword _(the number of rows)_.
- `acrossClues`: An array of [_clue segment_][1] _objects_ which go _across_ the puzzle.
  - [**clue segment**][1]
  - [**clue segment**][1]...
- `downClues`: An array of [_clue segment_][1] _objects_ which go _down_ the puzzle.
  - [**clue segment**][1]
  - [**clue segment**][1]

A _crossword definition_ **SHOULD** have the following properties:

- `source`: An _object_ containing provenance information for the crossword puzzle.
  - `title:` The name of the original crossword puzzle.
  - `url:` The [URL][19] for the original crossword puzzle.
- `setter:` An _object_ containing information about the puzzle _setter_.
  - `title:` The name of the puzzle _setter_.
  - `url:` The [URL][19] for the puzzle _setter_ (for example, their homepage).

### Clue segment

A _clue segment_ **MUST** have the following properties:

- `x:` The column number (1-based) of the first letter(cell) of a clue segment.
- `y:` The row number (1-based) of the first letter of a clue segment.
- `clue:` The entire text of the clue segment. This structured text follows the pattern:

  - _`LabelText`_ **`.`** _`ClueText`_ **`(`** _`LengthText`_ **`)`**
    - Some examples:
      - `6. Province is to take up weapons again, changing sides (5)`
      - `16. Outside port finally, make fast a vessel – one that's engine driven (5,4)`
      - `4,21. The king of 7, this general axed threat strategically (9)`
    - Whitespace is allowed anywhere in the _clue_.
    - _`LabelText`_
      - The clue's _number_ or _id_, such as `16` , `16a` or `16d` for a _single-segment_ clue.
        - A _number_ is the numeric value displayed in the clue's description, and in the corner of the first clue cell in the crossword grid.
        - An _id_ is the combination of the _number_ and a direction indicator: `a` for across, `d` for down. For example, `21a` for 21-across, `4d` for 4-down.
      - For the _head_ segment of a [multi-segment][3] clue, a separated, ordered list of all the linked segment _number/ids_, for example `4,21` or `4d,21a`
      - For the _tail_ segments of a _multi-segment_ clue, the clue segment _number/id_, such as `21` , `21a` or `21d`
      - In all cases, _`LabelText`_ **MUST** be followed by a period (`.`).
    - _`ClueText`_
      - The clue's _text_, which is the language content of the clue, such as `Outside port finally, make fast a vessel – one that's engine driven`
      - There are no exclusions in the usable character set.
        - The limiting characters for _`LabelText`_ and _`LengthText`_ - parentheses (`()`) and period (`.`), are **allowed** inside the clue's _text_.
    - _`LengthText`_
      - The clue's _length_, which is the number of cells for the clue segment on the crossword grid.
      - For a single-word segment, for example `6`
      - For a [multi-word][15] clue segment, a separated list of word lengths, for example `5,4`
      - For a [multi-segment][3] clue, the _length_ refers to the **current** segment only, not the combined length of all the clue segments.
      - In all cases, _`LengthText`_ **MUST** be enclosed in parentheses `()`

A _clue segment_ **SHOULD** have the following property:

- `solution:` The puzzle setter's solution text for the clue. This string may contain spaces and/or punctuation. All non-alphabetical characters will be stripped upon loading into the `clueModel`. The length of this _normalised_ (stripped) **solution** must match the numerical total of the **clue.length** above.

A _clue segment_ **MAY** have the following properties:

- `answer:` The puzzle solver's attempt or partial attempt at the **solution**. Missing letters are represented as spaces. It must have a length matching the _normalised_ **solution** length, i.e. the numerical total of the **clue.length** above
- `revealed:` The application-revealed characters in the **answer** above. Unrevealed characters are represented as spaces. It must have a length matching the _normalised_ **solution** length, i.e. the numerical total of the **clue.length** above.

```json
// Single-word clue JSON

{
  "x": 2,
  "y": 1,
  "clue": "2. Auntie hit boiling asphalt (9)",
  "solution": "uintahite"
}
```

#### List separators

_List separators_, unsurprisingly, separate items in a list. Commas (`,`) have been used as the list _separator_ in the examples in the previous section.
Formally, a _list separator_ is a sequence of 1 or more characters that satisfy the following conditions:

- The **excluded** characters are:
  - alphanumeric (`a-z`, and `0-9`)
  - clue _text_ section terminators:
    - periods (`.`) within the _`LabelText`_
    - parentheses (`()`) within the _`LengthText`_.

### Multi-word segments and multi-segment clues

- [**Multi-word**][15] segments and [**multi-segment**][3] clues are _distinct_ concepts.
- A **clue** can be a _single-segment_ clue or a _multi-segment_ clue.
- A **clue segment** can be a _single-word_ segment or a _multi-word_ segment.
- By corollary, a _multi-segment_ clue is a **collection** of two or more _single-word_ and/or _multi-word_ segments.

#### Multi-word segment

**Multi-word** segments occupy a **single clue segment** on the crossword grid. The _clue-word-**separators**_ are styled differently to a typical _clue-cell-**separator**_.

```json
// Multi-word clue JSON

{
  "x": 10,
  "y": 7,
  "clue": "16. Outside port finally, make fast a vessel – one that's engine driven (5,4)"
}
```

#### Multi-segment clue

**Multi-segment** clues occupy **two or more clue segments** on the crossword grid - one grid segment per clue segment. Each or any of the clue segments _may also_ be _multi-word_ clue segments.

A **multi-segment** clue: ([Example][10]: 4-down)

- A **collection** of 2+ _clue segments_ on the crossword grid and 2+ _clue segments_ in the clue lists.
- Each _clue segment_ direction is either _across_ or _down_, not both.
- A clue contain 0+ segments of both directions (i.e. _across_ or _down_, or both _across_ and _down_).
- The **first segment** in a _multi-segment clue_ will be referred to as the **head segment**.
- The _clue number_ part of the _head segment_ is an ordered, comma-separated, list of all the segments in the clue. In the example:
  - In the puzzle setter's _crosswordSource_: `4,21.`
  - In the webpage _clue-block_: `4,21.`
  - In the compiled _crosswordModel_: `4d,21a`
- The _length_ property of _every_ clue segment, including the head segment, refers to the length of the answer for _only_ that segment.
- The _length_ property of every segment may indicate a single-word answer or a _multi-word_ answer.
- In the example:
  - In the puzzle setter's _crosswordSource_: `(3,5)`
  - In the webpage _clue-block_: `(9,3,5)`
    - _note the concatenated segment lengths_

```json
// Multi-segment clue JSON

// Head (first) segment (single-word)
{
      "x": 6, "y": 1,
      "clue": "4,21. The king of 7, this general axed threat strategically (9)"
},
...
// Second segment (multi-word)
{
  "x": 1, "y": 11,
  "clue": "21. See 4-down (3,5)"
}
```

## Sample crosswords

| Name      | Formatted files       | Features                                                                                                                                                                                                                           |
| --------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ftimes    | [JSON][8] [YAML][9]   | Upper-case solutions, multi-word clues and some answers.                                                                                                                                                                           |
| alberich  | [JSON][10] [YAML][23] | Lower-case solutions, multi-word clues, multi-segment clues, _italicised_ clue text, parentheses in clue text.                                                                                                                     |
| quiptic   | [JSON][11] [YAML][24] | Minimal solutions, multi-word clues.                                                                                                                                                                                               |
| daquick   | [JSON][22] [YAML][25] | Upper-case solutions, multi-word clues, multi-segment clues, 'id' labels (13a, 23a). The first two across clues are tail segments for two different clues - a great test for opening a crossword on the first across head segment! |
| bletchley | [JSON][29] [YAML][28] | multi-word clues, 13x13 grid                                                                                                                                                                                                       |

[1]: #clue-segment
[2]: ../sample/crosswords/alberich_4.json
[3]: #multi-segment-clue
[4]: #multi-word-and-multi-segment
[5]: ../sample/crosswords/guardian_quiptic_89.json
[6]: https://www.w3schools.com/whatis/whatis_json.asp
[7]: https://www.redhat.com/en/topics/automation/what-is-yaml
[8]: ../data/ftimes_17095.json
[9]: ../data/ftimes_17095.yml
[10]: ../data/alberich_4.json
[11]: ../data/quiptic_89.json
[12]: ../dev/index.js
[13]: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
[14]: https://developer.mozilla.org/en-US/docs/Web/Security#security_services_provided_by_browsers
[15]: #multi-word-segment
[16]: #crossword-definition
[17]: #crossword-source
[18]: https://developer.mozilla.org/en-US/docs/Web/javascript
[19]: https://developer.mozilla.org/en-US/docs/Glossary/URL
[20]: https://semver.org/
[21]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
[22]: ../data/da_quick_20230818.json
[23]: ../data/alberich_4.yml
[24]: ../data/quiptic_89.yml
[25]: ../data/da_quick_20230818.yml
[26]: https://www.npmjs.com/package/yaml
[27]: #glossary
[28]: ../data/bletchley_001.yml
[29]: ../data/bletchley_001.json
