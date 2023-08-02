# Controller application programming interface (API)

Refer to the [Quickstart][1] section for instructions on adding the **crosswords-js** package to your [Node.js][2] project

## Design overview

The design of **crosswords-js** follows the [Model-view-controller (MVC) design pattern][4]. The naming of files and code artifacts follow from this pattern.

The package exposes:
- A `CrosswordModel` object, which is the **model** in the MVC pattern.
- A `CrosswordController` class to create a **controller** object.
- **Views** are surfaced as properties of the constructed **controller** object.
- Helper functions which are useful aids for developers, but not essential.

### Model construction

The **crosswordModel** object is returned from a call to
```js
function compileCrossword(jsonCrossword)
```
which is an alias for 
```js
function newCrosswordModel(jsonCrossword)
```
found in [`src/crosswordmodel.mjs`][5] in the module source code.

`jsonCrossword` is a JavaScript `Object`, created by importing a JSON representation of a [**CrosswordDefinition**][]

### Controller construction

As a package user, you will typically interact with the `controller` to programmatically manipulate and monitor the **crosswordGridView** - the _crossword grid_ [DOM][3] element.
### Views

```js
// The object behind the crossword grid DOM element 
controller.crosswordGridView
// The object behind the optional crossword clues DOM element
controller.crosswordCluesView
```



## Creating the controller



The constructor for 
7. And pass the `model`, `gridParent` and `viewParent` elements into the **Controller** constructor:

   ```js
   let controller = new Controller(model, gridParent, cluesParent);
   ```

   This binds the crossword **gridView** anf **cluesView** into the webpage [DOM][20].

## User Event Handlers

The `controller` exposes methods which can be used to respond to user-generated events. 
For example, they can be used as DOM element event handlers such as a button click.

| Method name           | Method ID            | Description                                                                   |
| --------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `testCurrentClue()`   | `"test-clue"`        | Check the current **clue** _answer_ against the _solution_.                   |
| `cleanCurrentClue()`  | `"clean-clue"`       | Clear incorrect letters in the answer for the current **clue** after testing. |
| `revealCurrentCell()` | `"reveal-cell"`      | Reveal the current **letter** only, in the _answer_ for the current **clue**. |
| `revealCurrentClue()` | `"reveal-clue"`      | Reveal the entire _solution_ for the current **clue**.                        |
| `resetCurrentClue()`  | `"reset-clue"`       | Clear out the _answer_ for the current **clue**.                              |
| `testCrossword()`     | `"test-crossword"`   | Check **all** the _answers_ against the _solutions_.                          |
| `cleanCrossword()`    | `"clean-crossword"`  | Clear incorrect letters for the entire **crossword** after testing.           |
| `revealCrossword()`   | `"reveal-crossword"` | Reveal the solutions for the entire **crossword**.                            |
| `resetCrossword()`    | `"reset-crossword"`  | Clear **all** the _answers_ across the entire **crossword**.                  |

 * Incorrect letters revealed by _testing_ have distinct styling, which is removed when a new letter is entered or the cell is _cleaned_ or _reset_.
 * Revealed cells have distinct styling which remains for the duration of the puzzle. _Public shaming is strictly enforced!_



The event handlers can be called explicitly in code, or bound to DOM elements with `id` or `class` attributes that match the method IDs in th table above.


## Comtroller Events

The `controller` also publishes a collection of events reflecting changes in internal state.

| Event               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cellRevealed`      | The current _letter_ in the current _clue_ has been _revealed_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `clueCleaned`       | The current _clue_ has been _cleaned_ - all incorrect letters cleared.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `clueReset`         | The current _clue_ has been _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `clueRevealed`      | The current _clue_ has been _revealed_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `clueSelected`      | A new _clue_ has been _selected_. This can be in response to keyboard or mouse/touch events. A new clue can be selected in the **crosswordGridView** or the **crosswordCluesView** DOM elements. The new (_current_) clue has distinct styling and is automatically synchronised between the **crosswordGridView** and the **crosswordCluesView**. Moving to, or selecting, a different _cell_ in the _current_ clue does not generate this event. If a _cell_ intersects two _clues_ (an _across_ and a _down_ clue), a second selection of the cell will toggle the _current_ clue between the _across_ and _down_ clues and the `clueSelected` event will be emitted. |
| `clueSolved`        | Follows a `clueTested` event when the _current clue_ _answer_ is correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `clueTested`        | The current _clue_ has been _tested_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `crosswordCleaned`  | The _crossword_ has been _cleaned_ - all incorrect letters _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `crosswordReset`    | The entire _crossword_ has been _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `crosswordRevealed` | The entire _crossword_ has been _revealed_. A `crosswordSolved` event is **not** subsequently emitted in this case.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `crosswordSolved`   | The entire _crossword_ has been _solved_. This event occurs when all clues have complete and correct answers. This will occur automatically when the last cell is filled and all clues are complete and correctly answered.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `crosswordTested`   | The entire _crossword_ has been _tested_. A `crosswordSolved` event is emitted if all answers are complete and correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

[1]: ../README.md#quickstart
[2]: https://nodejs.org/
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
[4]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
[5]: ../src/crossword-model.mjs