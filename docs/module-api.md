# crosswords-js application programming interface (API) <!-- omit from toc -->

- [Overview](#overview)
- [Model construction](#model-construction)
- [Controller construction](#controller-construction)
- [Views](#views)
  - [The `crosswordGridView` structure](#the-crosswordgridview-structure)
  - [The `crosswordCluesView` structure](#the-crosswordcluesview-structure)
- [User Event Handlers](#user-event-handlers)
- [Controller Events](#controller-events)

Refer to the [Quickstart][1] section for instructions on adding the **crosswords-js** package to your [Node.js][2] project

## Overview

The design of **crosswords-js** follows the [Model-view-controller (MVC) design pattern][4]. The naming of files and code artifacts follow from this pattern.

The package exposes:

- A `CrosswordModel` data structure, which is the **model** in the MVC pattern.
- A `CrosswordController` class to create the MVC **controller** object, which surfaces **views** as object properties.
- Helper functions which are useful aids for developers, but not essential.

As a module user, you will typically interact with the **crosswordController** to programmatically manipulate and monitor:

- the **crosswordGridView** - the crossword **grid** [DOM][3] element.
- the **crosswordCluesView** - the crossword **clues** DOM element.

## Model construction

The **crosswordModel** object is created via:

```js
const model = compileCrossword(crosswordDefinition);
```

which is an alias for

```js
function newCrosswordModel(crosswordDefinition)
```

found in [`src/crossword-model.mjs`][5] in the module source code.

`crosswordDefinition` is a JavaScript `Object`, created by importing or parsing a [**crosswordDefinition**][6] file in a structured-text format such as JSON or YAML.

## Controller construction

Firstly get the DOM elements which will be the parents for the crossword _grid_ and _clues_ blocks:

> For example, if we have placeholder `div` elements somewhere in our webpage:
>
> - **gridView** element location...
>
> ```html
> ...
> <div id="crossword-grid-placeholder" />
> ...
> ```
>
> - Optional **cluesView** element location...
>
> ```html
> ...
> <div id="crossword-clues-placeholder" />
> ...
> ```
>
> We locate the elements via the webpage [DOM][3] global variable `document`:
>
> ```js
> const gridParent = document.getElementById('crossword-grid-placeholder');
> const cluesParent = document.getElementById('crossword-clues-placeholder');
> ```

Create a **crosswordController** object by passing the `model` and the `gridParent` and `cluesParent` DOM elements into the constructor:

```js
// cluesParent is an optional argument. Omit it if you don't want to use the cluesView element
const controller = new Controller(model, gridParent, cluesParent);
```

which is an alias for the `CrosswordController` constructor

```js
constructor(crosswordModel, domGridParentElement, domCluesParentElement);
```

found in [`src/crossword-controller.mjs`][7] in the module source code.

This binds the crossword **gridView** and **cluesView** into the webpage [DOM][3].

## Views

The **crosswordGridView** and **crosswordCluesView** are surfaced as properties of the _crosswordController_ object. These are the corresponding root DOM elements for the crossword grid and crossword clues.

```js
// The object behind the crossword grid DOM element
controller.crosswordGridView;

// The object behind the optional crossword clues DOM element
controller.crosswordCluesView;
```

### The `crosswordGridView` structure

- The `crossword-grid` _div_ element is a flat container of `crossword-cell` _div_ elements.
- The **grid** contains `crosswordModel.height * crosswordModel.width` **cell** elements.
- Grid **rows** are _visually_ delimited using the [CSS Grid][10] layout in the [`style/crosswords.less`][11] stylesheet.
- **Cell** elements are listed in [row-major][9] order (row-by-row) within the **grid**.
- The **currentClue** is visually identified by toggling the `active` class on the the **cell** elements
- The **currentCell** is visually identified by toggling the `highlighted` class on the the **cell** element.
- The `cwcell-revealed` and `cwcell-incorrect` _div_ elements are exposed/hidden by toggling the `hidden` class on the element

_Duplicate cell types have been removed for clarity_

```html
<div class="crossword-grid">
  <!-- labelled clue cell -->
  <div class="cwcell light">
    <input maxlength="1" class="" />
    <div class="cwclue-label">1</div>
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- unlabelled clue cell -->
  <div class="cwcell light">
    <input maxlength="1" />
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- dark grid cell -->
  <div class="cwcell dark"></div>
  <!-- cell in the current clue -->
  <div class="cwcell light">
    <input maxlength="1" class="active" />
    <div class="cwclue-label">4</div>
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- current cell  -->
  <div class="cwcell light">
    <input maxlength="1" class="active highlighted" />
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- cell with across word separator -->
  <!-- cell with across word separator -->
  <div class="cwcell light">
    <input maxlength="1" class="cw-across-word-separator" />
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- cell with down word separator -->
  <div class="cwcell light">
    <input maxlength="1" class="cw-down-word-separator" />
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- revealed cell -->
  <div class="cwcell light">
    <input maxlength="1" class="" />
    <div class="cwcell-revealed"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- incorrect cell -->
  <div class="cwcell light">
    <input maxlength="1" class="active highlighted" />
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect"></div>
  </div>
</div>
```

### The `crosswordCluesView` structure

- The `crossword-clues` _div_ element is a flat container of two `crossword-clue-block` _div_ elements
  - the `crossword-across-clues` **clueBlock** element
  - the `crossword-down-clues` **clueBlock** element
- The **clueBlock** elements contain a `crossword-clue-block-title` _paragraph_ (`p`) element, followed by a list of `crossword-clue` _div_ elements
- The **crosswordCluesView** is _visually_ laid out using [CSS Flexbox][12] in the [`style/crosswords.less`][11] stylesheet.

_Duplicate cell types have been removed for clarity_

```html
<div class="crossword-clues">
  <!-- across clues block -->
  <div class="crossword-clue-block" id="crossword-across-clues">
    <!-- across clues title -->
    <p class="crossword-clue-block-title">Across</p>
    <!-- typical clue -->
    <div class="crossword-clue">
      <span class="crossword-clue-label">1.</span>
      <span class="crossword-clue-text">
        Married woman shows animosity (6)
      </span>
    </div>
    <!-- current clue -->
    <div class="crossword-clue current-clue-segment">
      <span class="crossword-clue-label">4.</span>
      <span class="crossword-clue-text">
        One's held back by a stout grating (8)
      </span>
    </div>
  </div>
  <!-- down clues block -->
  <div class="crossword-clue-block" id="crossword-down-clues">
    <!-- down clues title -->
    <p class="crossword-clue-block-title">Down</p>
    <!-- typical clue -->
    <div class="crossword-clue">
      <span class="crossword-clue-label">1.</span>
      <span class="crossword-clue-text">
        Ordered risotto after introduction to Minnie Driver (8)
      </span>
    </div>
  </div>
</div>
```

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

- Incorrect letters revealed by _testing_ have distinct styling, which is removed when a new letter is entered or the cell is _cleaned_ or _reset_.
- Revealed cells have distinct styling which remains for the duration of the puzzle. _Public shaming is strictly enforced!_

The event handlers can be called explicitly in code...

```js
controller.testCurrentClue();
```

...or bound to DOM elements like `buttons`, with `id` or `class` attributes that match the _method IDs_ in the table above.

- Bind by `class` if you have more than one DOM element you want to generate the user event.
- Bind by `id` (or `class`) if only one element will generate the user event. For example...

```html
<div id="clue-buttons">
  <p>Clue</p>
  <button id="test-clue">Test</button>
  <button id="clean-clue">Clean</button>
  <button id="reveal-clue">Reveal</button>
  <button class="reset-clue">Reset</button>
  <button class="reset-clue">MoSet</button>
</div>
```

The default second and third arguments for the `controller.bind*` methods are:

- event: "click"
- dom: document (global DOM variable)

```js
// method prototype
bindEventHandlerToId(elementId, (eventName = 'click'), (dom = document));
// Example: Bind the "click" event of the element with id "test-clue"
controller.bindEventHandlerToId('test-clue', 'click', document);
// Example: Using default arguments for
// eventName ("click") and dom (document)
controller.bindEventHandlerToId('reveal-clue');

// method prototype
bindEventHandlerToClass(elementClass, (eventName = 'click'), (dom = document));
// Example: Bind event handler to multiple elements with class "reset-clue"
controller.bindEventHandlerToClass('reset-clue', 'click', document);

// method prototype
bindEventHandlersToIds(
  // all controller user event handlers
  (elementIds = this.userEventHandlerIds),
  (eventName = 'click'),
  (dom = document),
);
// Example: Bind ALL the user event handlers, using defaults
controller.bindEventHandlersToIds();

// method prototype
bindEventHandlersToClass(
  // all controller user event handlers
  (elementClasses = this.userEventHandlerIds),
  (eventName = 'click'),
  (dom = document),
);
// Example: Bind the user event handlers to ALL elements with
// the given class(es), passing an array of one class name
controller.bindEventHandlersToClass(['reset-clue']);
```

## Controller Events

The `controller` also publishes a collection of events reflecting changes in internal state.

| Event Name          | Event Data                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cellRevealed`      | `controller.currentCell`    | The current _letter_ in the current _clue_ has been _revealed_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `clueCleaned`       | `controller.currentClue`    | The current _clue_ has been _cleaned_ - all incorrect letters cleared.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `clueReset`         | `controller.currentClue`    | The current _clue_ has been _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `clueRevealed`      | `controller.currentClue`    | The current _clue_ has been _revealed_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `clueSelected`      | `controller.currentClue`    | A new _clue_ has been _selected_. This can be in response to keyboard or mouse/touch events. A new clue can be selected in the **crosswordGridView** or the **crosswordCluesView** DOM elements. The new (_current_) clue has distinct styling and is automatically synchronised between the **crosswordGridView** and the **crosswordCluesView**. Moving to, or selecting, a different _cell_ in the _current_ clue does not generate this event. If a _cell_ intersects two _clues_ (an _across_ and a _down_ clue), a second selection of the cell will toggle the _current_ clue between the _across_ and _down_ clues and the `clueSelected` event will be emitted. |
| `clueSolved`        | `controller.currentClue`    | Follows a `clueTested` event when the _current clue_ _answer_ is correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `clueTested`        | `controller.currentClue`    | The current _clue_ has been _tested_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `crosswordCleaned`  | `controller.crosswordModel` | The _crossword_ has been _cleaned_ - all incorrect letters _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `crosswordReset`    | `controller.crosswordModel` | The entire _crossword_ has been _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `crosswordRevealed` | `controller.crosswordModel` | The entire _crossword_ has been _revealed_. A `crosswordSolved` event is **not** subsequently emitted in this case.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `crosswordSolved`   | `controller.crosswordModel` | The entire _crossword_ has been _solved_. This event occurs when all clues have complete and correct answers. This is emitted when the last cell is filled and all clues are complete and correctly answered.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `crosswordTested`   | `controller.crosswordModel` | The entire _crossword_ has been _tested_. A `crosswordSolved` event is emitted if all answers are complete and correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

You can register your own **event listeners** via

```js
controller.addEventsListener(events, listener);
```

- `events` is an array of event names, such as

  ```js
  ['click', 'hover'];
  ```

  A single event must still be passed in an array.

- `listener` is your **event listener** function.

  It must be a _function_ or _arrow function_ that takes a single argument. Refer to the **Event Data** column in the table above for the argument passed to each event listener

```js
// event function prototype
function (data) { ... }
// arrow function prototype
(data) => { ... }
```

Here is a complete example from [`dev/index.js`][8]:

```js
// Wire up current-clue elements

const currentClueLabel = eid('current-clue-label');
const currentClueText = eid('current-clue-text');
// Initialise content of #current-clue
const cc = controller.currentClue;
currentClueLabel.innerHTML = cc.clueLabel;
currentClueText.innerHTML = `${cc.clueText} ${cc.answerLengthText}`;
// Update content of #current-clue when current clue changes
controller.addEventsListener(['clueSelected'], (clue) => {
  currentClueLabel.innerHTML = clue.clueLabel;
  currentClueText.innerHTML = `${clue.clueText} ${clue.answerLengthText}`;
});
```

[1]: ../README.md#quickstart
[2]: https://nodejs.org/
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
[4]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
[5]: ../src/crossword-model.mjs
[6]: ./crossword-definition.md
[7]: ../src/crossword-controller.mjs
[8]: ../dev/index.js
[9]: https://en.wikipedia.org/wiki/Row-_and_column-major_order
[10]: ../docs/crossword-styling.md#crossword-grid
[12]: ../docs/crossword-styling.md#crossword-clues
[11]: ../style/crosswords.less
