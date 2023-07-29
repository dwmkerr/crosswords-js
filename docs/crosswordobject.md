The **crossword model** is the object built by the main [`compileCrossword`][1] function.

```js
const crosswordModel = {
  width: crosswordDefinition.width,
  height: crosswordDefinition.height,
  acrossClues: [],
  downClues: [],
  cells: [],
};
```

`acrossClues` and `downClues` are one-dimensional arrays of clue

### State Changed Messages

`clueSelected`: Fired when the selected clue is changed.

[1]: ../src/compile-crossword.js
