# crosswords-js application programming interface (API) <!-- omit from toc -->

- [Overview](#overview)
- [Module MVC components](#module-mvc-components)
  - [Model](#model)
  - [Controller](#controller)
  - [Views](#views)
    - [GridView](#gridview)
    - [CluesView](#cluesview)
- [User-event handlers](#user-event-handlers)
  - [Explicit handler calls](#explicit-handler-calls)
  - [Bind to DOM elements by matching `class` or `id`](#bind-to-dom-elements-by-matching-class-or-id)
    - [1. `bindEventHandlerToId`](#1-bindeventhandlertoid)
    - [2. `bindEventHandlerToClass`](#2-bindeventhandlertoclass)
    - [3. `bindEventHandlersToIds`](#3-bindeventhandlerstoids)
    - [4. `bindEventHandlersToClass`](#4-bindeventhandlerstoclass)
- [Published events](#published-events)
- [String representations of crosswordModel cells and clues](#string-representations-of-crosswordmodel-cells-and-clues)
- [API use cases](#api-use-cases)
  - [1. Loading crossword puzzles](#1-loading-crossword-puzzles)
  - [2. Setting crossword grid content programmatically](#2-setting-crossword-grid-content-programmatically)
  - [3. Changing keyboard shortcuts](#3-changing-keyboard-shortcuts)
    - [An example eventBinding declaration](#an-example-eventbinding-declaration)

Refer to the [Quickstart][1] section for instructions on adding the **crosswords-js** package to your [Node.js][2] project

## Overview

The design of **crosswords-js** follows the [Model-view-controller (MVC) design pattern][4]. The naming of files and code artifacts follow from this pattern.

The package exposes:

- A factory function, `(newCrosswordController`), to create the MVC **controller** object, which surfaces the **model** and **views** as object properties (`model`, `gridView` and `cluesView` respectively).

- Functions to create [_crossword definitions_][13] from text strings (`newCrosswordDefinition`) or files (`convertSourceFileToDefinition`).

- A function (`compileCrossword`) to independently validate _crossword source_ files - indirectly as _crossword definitions_.

- _Helper_ functions (`assert`, `ecs`, `eid`, `trace`, `tracing`), which are useful aids for developers, but not essential.

As a module user, you will typically interact with the **crosswordController** to programmatically manipulate and monitor:

- the **crosswordGridView** - the crossword **grid** [DOM][3] element.
- the **crosswordCluesView** - the crossword **clues** DOM element.

## Module MVC components

### Model

A **crosswordModel** object is surfaced as a property of a _crosswordController_, but can be created explicitly (to separately test a puzzle's integrity) via:

```js
const model = compileCrossword(crosswordDefinition);
```

which is an alias for

```js
function newCrosswordModel(crosswordDefinition)
```

found in [`src/crossword-model.mjs`][5] in the module source code.

> A [`crosswordDefinition`][13] is a JavaScript `Object`, created by:
>
> - `import`ing a JSON [**crosswordSource**][6] file, or...
> - creating from a _String_ via `newCrosswordDefinition`, or...
> - from a file path via `convertSourceFileToDefinition`.

### Controller

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
> // Using module helper functions...
> const gridParent = eid('crossword-grid-placeholder');
> const cluesParent = eid('crossword-clues-placeholder');
> // Or, using simple JavaScript...
> const gridParent = document.getElementById('crossword-grid-placeholder');
> const cluesParent = document.getElementById('crossword-clues-placeholder');
> ```

Create a **crosswordController** object by passing a `crosswordDefinition` and the `gridParent` and `cluesParent` DOM elements into the factory function:

```js
// cluesParent is an optional argument. Omit it if you don't want to use the cluesView element
const controller = newCrosswordController(
  crosswordDefinition,
  gridParent,
  cluesParent,
);
```

found in [`src/crossword-controller.mjs`][7] in the module source code.

This binds the crossword **gridView** and **cluesView** into the webpage [DOM][3].

### Views

The **crosswordGridView** and **crosswordCluesView** are surfaced as properties `GridView` and `CluesView` of the _crosswordController_ object. These are the corresponding DOM elements for the crossword _grid_ and crossword _clues_.

```js
// The object behind the crossword grid DOM element
controller.gridView;
// The object behind the optional crossword clues DOM element
controller.cluesView;
```

#### GridView

- The `crossword-grid` _div_ element is a flat container of `crossword-cell` _div_ elements.
- The **grid** contains `crosswordModel.height * crosswordModel.width` **cell** elements.
- Grid **rows** are _visually_ delimited using the [CSS Grid][10] layout in the [`style/crosswords.less`][11] stylesheet.
- **Cell** elements are listed in [row-major][9] order (row-by-row) within the **grid**.
- The **currentClue** is visually identified by toggling the `active` class on the the **cell** elements
- The **currentCell** is visually identified by toggling the `highlighted` class on the the **cell** element.
- The `cwcell-revealed` and `cwcell-incorrect` _div_ elements are exposed/hidden by toggling the `hidden` class on the element. These elements come into play when the puzzle solver _tests_ or _reveals_ letters, clues or the whole crossword.

_Duplicate cell types have been removed for clarity_

```html
<div class="crossword-grid">
  <!-- labelled clue cell -->
  <div class="cwcell light noselect">
    <div class="cwclue-label">1</div>
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- unlabelled clue cell -->
  <div class="cwcell light noselect">
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- dark grid cell -->
  <div class="cwcell dark"></div>
  <!-- cell in the current clue -->
  <div class="cwcell light noselect active">
    <div class="cwclue-label">4</div>
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- current cell  -->
  <div class="cwcell light noselect active highlighted">
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- cell with across word separator -->
  <!-- cell with across word separator -->
  <div class="cwcell light noselect cw-across-word-separator">
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- cell with down word separator -->
  <div class="cwcell light noselect cw-down-word-separator">
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- revealed cell -->
  <div class="cwcell light noselect">
    <div class="cwcell-revealed"></div>
    <div class="cwcell-incorrect hidden"></div>
  </div>
  <!-- incorrect cell -->
  <div class="cwcell light noselect active highlighted">
    <div class="cwcell-revealed hidden"></div>
    <div class="cwcell-incorrect"></div>
  </div>
</div>
```

#### CluesView

- The `crossword-clues` _div_ element is a simple container of two `crossword-clue-block` _div_ elements
  - the `crossword-across-clues` **clueBlock** element
  - the `crossword-down-clues` **clueBlock** element
- The **clueBlock** elements contain a `crossword-clue-block-title` _paragraph_ (`p`) element, followed by a flat list of `crossword-clue` _div_ elements
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

## User-event handlers

The `controller` exposes methods which can be used to respond to user-generated events.
For example, they can be used as _handlers_ for DOM element events such as a button click.

| Method name               | Method ID              | Description                                                                                                            |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `testCurrentClue`         | `"test-clue"`          | Check the current **clue** _answer_ against the _solution_.                                                            |
| `cleanCurrentClue`        | `"clean-clue"`         | Clear incorrect letters in the _answer_ for the current **clue** after testing.                                        |
| `copyCurrentClueSolution` | `"copy-clue-solution"` | Copy the _solution_ for the current **clue** to the clipboard, providing the _answer_ is correct or has been revealed. |
| `revealCurrentCell`       | `"reveal-cell"`        | Reveal the current **letter** only, in the _answer_ for the current **clue**.                                          |
| `revealCurrentClue`       | `"reveal-clue"`        | Reveal the entire _solution_ for the current **clue**.                                                                 |
| `resetCurrentClue`        | `"reset-clue"`         | Clear out the _answer_ for the current **clue**.                                                                       |
| `testCrossword`           | `"test-crossword"`     | Check **all** the _answers_ against the _solutions_.                                                                   |
| `cleanCrossword`          | `"clean-crossword"`    | Clear incorrect letters for the entire **crossword** after testing.                                                    |
| `revealCrossword`         | `"reveal-crossword"`   | Reveal the _solutions_ for the entire **crossword**.                                                                   |
| `resetCrossword`          | `"reset-crossword"`    | Clear out **all** the _answers_ across the entire **crossword**.                                                       |

- Incorrect letters revealed by _testing_ have distinct styling, which is removed when a new letter is entered or the cell is _cleaned_ or _reset_.
- Revealed cells have distinct styling which remains for the duration of the puzzle. _Public shaming is strictly enforced!_

### Explicit handler calls

The event handlers can be called explicitly in code

```js
controller.testCurrentClue();
```

### Bind to DOM elements by matching `class` or `id`

The event handlers can be bound to DOM elements like `buttons`, with `id` or `class` attributes that match the _method IDs_ in the table above.

- Bind by `class` if you have more than one DOM element you want to generate the user event.
- Bind by `id` (or `class`) if only one element will generate the user event. For example...

```html
<div id="user-actions">
  <p>Clue</p>
  <button id="test-clue">Test</button>
  <button id="clean-clue">Clean</button>
  <button id="reveal-clue">Reveal</button>
  <button class="reset-clue">Reset</button>
  <button class="reset-clue">MoSet</button>
  <p>Crossword</p>
  <button id="test-crossword">Test</button>
  <button id="clean-crossword">Clean</button>
  <button id="reveal-crossword">Reveal</button>
  <button class="reset-crossword">Reset</button>
  <button class="reset-crossword">MoSet</button>
</div>
```

The default second and third arguments for the `controller.bind*` methods are:

- event: `click`
- dom: `document` (global DOM variable)

#### 1. `bindEventHandlerToId`

```js
//// method prototype - arguments have defaults as indicated  ////
bindEventHandlerToId(elementId, [(eventName = 'click')], [(dom = document)]);

// Example: Bind the "click" event of the element with id 'test-clue'
controller.bindEventHandlerToId('test-clue', 'click', document);

// Example: Using default arguments for eventName ("click") and dom (document)
controller.bindEventHandlerToId('reveal-clue');
```

#### 2. `bindEventHandlerToClass`

```js
//// method prototype - arguments have defaults as indicated  ////
bindEventHandlerToClass(
  elementClass,
  [(eventName = 'click')],
  [(dom = document)],
);

// Example: Bind event handler to multiple elements with class 'reset-clue'
controller.bindEventHandlerToClass('reset-clue', 'click', document);
```

#### 3. `bindEventHandlersToIds`

```js
//// method prototype - arguments have defaults as indicated  ////
bindEventHandlersToIds(
  // The first argument, elementIds, is an ARRAY
  // The default value is all controller user event handlers
  [(elementIds = this.userEventHandlerIds)],
  [(eventName = 'click')],
  [(dom = document)],
);
// Example: Bind ALL the user event handlers, using defaults
controller.bindEventHandlersToIds();
```

#### 4. `bindEventHandlersToClass`

```js
//// method prototype - arguments have defaults as indicated  ////
bindEventHandlersToClass(
  // The first argument, elementClasses, is an ARRAY
  // The default value is all controller user event handlers
  [(elementClasses = this.userEventHandlerIds)],
  [(eventName = 'click')],
  [(dom = document)],
);

// Example: Bind the user event handlers to the click events of
// ALL elements with class 'reset-clue' or 'reset-crossword'
controller.bindEventHandlersToClass(['reset-clue', 'reset-crossword'], 'click');
```

## Published events

The `controller` also publishes a collection of events reflecting changes in internal state.

| Event name            | Event handler argument   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cellRevealed`        | `controller.currentCell` | The current _letter_ in the current _clue_ has been _revealed_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `clueCleaned`         | `controller.currentClue` | The current _clue_ has been _cleaned_ - all incorrect letters cleared.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `clueSolutionCopied`  | `controller.currentClue` | The _solution_ for the current _clue_ has been copied to the clipboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `clueIncomplete`      | `controller.currentClue` | The current _clue_ has been _tested_ - no errors, but incomplete.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `clueReset`           | `controller.currentClue` | The current _clue_ has been _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `clueRevealed`        | `controller.currentClue` | The current _clue_ has been _revealed_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `clueSelected`        | `controller.currentClue` | A new _clue_ has been _selected_. This can be in response to keyboard or mouse/touch events. A new clue can be selected in the **crosswordGridView** or the **crosswordCluesView** DOM elements. The new (_current_) clue has distinct styling and is automatically synchronised between the **crosswordGridView** and the **crosswordCluesView**. Moving to, or selecting, a different _cell_ in the _current_ clue does not generate this event. If a _cell_ intersects two _clues_ (an _across_ and a _down_ clue), a second selection of the cell will toggle the _current_ clue between the _across_ and _down_ clues and the `clueSelected` event will be emitted. |
| `clueSolved`          | `controller.currentClue` | Follows a `clueTested` event when the _current clue_ _answer_ is correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `clueTested`          | `controller.currentClue` | The current _clue_ has been _tested_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `crosswordCleaned`    | `controller.model`       | The _crossword_ has been _cleaned_ - all incorrect letters _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `crosswordIncomplete` | `controller.model`       | The _crossword_ has been _tested_ - no errors, but incomplete.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `crosswordLoaded`     | `crosswordDefinition`    | A new _crossword_ puzzle has been _loaded_ from `crosswordDefinition.`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `crosswordReset`      | `controller.model`       | The entire _crossword_ has been _cleared_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `crosswordRevealed`   | `controller.model`       | The entire _crossword_ has been _revealed_. A `crosswordSolved` event is **not** subsequently emitted in this case.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `crosswordSolved`     | `controller.model`       | The entire _crossword_ has been _solved_. This event occurs when all clues have complete and correct answers. This is emitted when the last cell is filled and all clues are complete and correctly answered.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `crosswordTested`     | `controller.model`       | The entire _crossword_ has been _tested_. A `crosswordSolved` event is emitted if all answers are complete and correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

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

  It must be a _function_ or _arrow function_ that takes a single argument. Refer to the **Event handler argument** column in the table above for the `data` argument passed to each event listener

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
currentClueLabel.innerHTML = cc.labelText;
currentClueText.innerHTML = `${cc.clueText} ${cc.solutionLengthText}`;
// Update content of #current-clue when current clue changes
controller.addEventsListener(['clueSelected'], (clue) => {
  currentClueLabel.innerHTML = clue.labelText;
  currentClueText.innerHTML = `${clue.clueText} ${clue.solutionLengthText}`;
});
```

## String representations of crosswordModel cells and clues

A _crosswordModel_ **cell** is converted to a string automatically by _crosswordModel_ `cell.toString()` wherever a string version of a **cell** is required. For example,

- In a parameterised string...

```js
  // '${cell}' in assert() string argument is implicitly converted to a string

inputElement = (cell) => {
      assert(cell.light, `dark cell! ${cell}`);
```

- When a cell DOM element is created...

```js
  // 'modelCell' is implicitly converted to a string before assignment to 'cellElement.id'

function newCellElement(document, modelCell) {
  ...
  let cellElement = document.createElement('div');
  // Identify cellElement with id of associated modelCell.
  cellElement.id = modelCell;
  addClass(cellElement, 'cwcell');
```

Likewise, a _crosswordModel_ **clue** is converted to a string automatically by `clueModel.toString()` wherever a string version of a **clue** is required. For example,

- In a parameterised string...

```js
  // '${clue}' in trace() string argument is implicitly converted to a string

function revealClue(controller, clue) {
  ...
  trace(`revealClue: '${clue}'`);
```

## API use cases

### 1. Loading crossword puzzles

Crossword puzzles can be loaded via the _crosswordController_ method `loadCrosswordSource`

```js
controller.loadCrosswordSource(mimeType, documentText);
```

- `documentText`: This is the plain-text content of a [**crossword source**][6] file.

- [`mimeType`][16]: The format of the `documentText`

  - Currently, two document formats are supported:

  | Format     | MimeType                                   |
  | ---------- | ------------------------------------------ |
  | [JSON][14] | `application/json`                         |
  | [YAML][15] | `application/yaml` or `application/x-yaml` |

Here is a complete example from [`dev/index.js`][8]:

```js
// Wire up crossword file picker
function addCrosswordFileListener() {
  const cf = eid('crossword-file');
  cf.addEventListener('change', loadCrosswordSource, false);
}

// Crossword file picker "change" event handler
function loadCrosswordSource(event) {
  // Nested helper executed when a file has been picked
  function reloadController(file) {
    const fr = new FileReader();
    // The onload event fires when the file has completed loading
    // The file content is in e.target.result
    fr.onload = (e) => {
      const fileText = e.target.result;
      // load new crossword into controller
      window.controller.loadCrosswordSource(file.type, fileText);
    };
    // Asynchronous
    fr.readAsText(file);
  }

  // Has a file been picked?
  if (this.files.length > 0) {
    // Yes!
    const file = this.files[0];
    trace(
      `loadCrosswordSource: ${file.name} (${file.size} B) type:"${file.type}"`,
    );
    reloadController(file);
  } else {
    // Nope
    trace(`loadCrosswordSource: cancelled`);
  }
}
```

### 2. Setting crossword grid content programmatically

Grid cells can be filled programmatically via the _crosswordController_ method `setGridCell`

```js
controller.setGridCell(cellElementId, character);
```

- `character`: The new text content for the _gridcell_.
- `cellElementId`: The _id_ of the associated cell DOM element (`cellElement.id`).

### 3. Changing keyboard shortcuts

GridView keyboard shortcuts can be overridden via the _crosswordController_ method `setKeyboardEventBindings`

```js
controller.setKeyboardEventBindings(eventBindings);
```

- `eventBindings`: An array of `eventBinding`.

An **eventBinding** is an object with properties:

- `eventName`: The name of the keyboard event you're overriding.
  - _Currently,_ `keydown` _and_ `keyup` _are supported_.
- `keyBindings`: An array of `keyBinding`.

A **keyBinding** is an object with properties:

- `key`: The [KeyboardEvent.key][17] for the key pressed by the puzzle solver.
- `action`: A function implementing your new behaviour.

An **action** function can be any kind of JavaScript function. It must declare the following arguments:

- `controller`: The **CrosswordController** object is passed in.
- `event`: The DOM **event** object is passed in.
- `eventCell`: The _CrosswordModel_ **modelCell** object associated with the grid cell is passed in.

```js
// Within a literal keyBinding object declaration...
// Arrow function
action: (controller, event, eventCell) => <function-body>
// Anonymous function
action: (function (controller, event, eventCell) <function-body> );

```

Code examples of _eventBinding_ objects are found in [`src/default-eventbindings.mjs`][18]

#### An example eventBinding declaration

Note that the _action_ function implementations are all composed of calls to helper functions declared in [`src/crossword-gridview.mjs`][20]:

- `deleteCellContent`
- `moveToCellAhead`
- `moveToCellBehind`
- `moveToCellDown`
- `moveToCellLeft`
- `moveToCellRight`
- `moveToCellUp`
- `moveToClueAhead`
- `moveToClueBehind`
- `setCellContent`
- `toggleClueDirection`

The `EventKey` _enumeration_ values used below are also defined in [`src/crossword-gridview.mjs`][20]

```js
const defaultKeyDownBinding = {
  eventName: 'keydown',
  keyBindings: [
    {
      key: EventKey.backspace,
      action: (controller, event, eventCell) => {
        deleteCellContent(controller, event, eventCell);
        moveToCellBehind(controller, eventCell);
      },
    },
    {
      key: EventKey.delete,
      action: (controller, event, eventCell) => {
        deleteCellContent(controller, event, eventCell);
      },
    },
    {
      key: EventKey.enter,
      action: (controller, event, eventCell) => {
        toggleClueDirection(controller, eventCell);
      },
    },
    {
      key: EventKey.tab,
      action: (controller, event, eventCell) => {
        event.shiftKey
          ? moveToClueBehind(controller, eventCell)
          : moveToClueAhead(controller, eventCell);
      },
    },
    {
      key: EventKey.space,
      action: (controller, event, eventCell) => {
        event.shiftKey
          ? moveToCellBehind(controller, eventCell)
          : moveToCellAhead(controller, eventCell);
      },
    },
  ],
};
```

The default _eventBinding_ objects are assigned in the `CrosswordController` constructor in [`src/crossword-controller.mjs`][19]:

```js
// Set keyboard event keyBindings for gridView cells.
this.setKeyboardEventBindings([defaultKeyDownBinding, defaultKeyUpBinding]);
```

[1]: ../README.md#quickstart
[2]: https://nodejs.org/
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
[4]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
[5]: ../src/crossword-model.mjs
[6]: ./crossword-domain.md#crossword-source
[7]: ../src/crossword-controller.mjs
[8]: ../dev/index.js
[9]: https://en.wikipedia.org/wiki/Row-_and_column-major_order
[10]: ../docs/crossword-styling.md#crossword-grid
[11]: ../style/crosswords.less
[12]: ../docs/crossword-styling.md#crossword-clues
[13]: ../docs/crossword-domain.md##crossword-definition
[14]: https://www.w3schools.com/whatis/whatis_json.asp
[15]: https://www.redhat.com/en/topics/automation/what-is-yaml
[16]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
[17]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
[18]: ../src/default-eventbindings.mjs
[19]: ../src/crossword-controller.mjs
[20]: ../src/crossword-gridview.mjs
