import { assert } from './helpers.mjs';

//  Internally used map of Crossword model data to DOM elements.
class CellMap {
  #modelCells = {};

  //  Adds a Cell <-> Cell Element mapping.
  add(modelCell, cellElement) {
    assert(modelCell, 'modelCell is null or undefined');
    assert(cellElement, 'cellElement is null or undefined');
    // cellElement.id set in ./crosswordGridView.mjs:newCellElement()
    this.#modelCells[cellElement.id] = modelCell;
  }

  //  Gets the DOM element for a modelCell.
  cellElement = (modelCell) => {
    assert(typeof modelCell === 'object', 'Cell is not an object');
    // modelCell.cellElement set in ./crosswordGridView.mjs:newCellElement()
    return modelCell.cellElement;
  };

  //  Gets the modelCell for a DOM element.
  modelCell = (cellElement) => {
    switch (typeof cellElement) {
      case 'string':
        return this.#modelCells[cellElement];
      case 'object':
        return this.#modelCells[cellElement.id];
      default:
        assert(true, 'Unexpected type for "cellElement"');
        break;
    }
  };

  get modelCells() {
    // this.#modelCells object properties are keyed by modelCell.toString()
    // Retrieve the array of associated values (modelCell) for the Object keys
    return Object.values(this.#modelCells);
  }
}

export { CellMap };
