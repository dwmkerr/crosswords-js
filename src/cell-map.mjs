//  Internally used map of Crossword model data to DOM elements.
class CellMap {
  #map;
  constructor() {
    this.#map = [];
  }

  //  Adds a Cell <-> Cell Element mapping.
  add(cell, cellElement) {
    this.#map.push({
      cell,
      cellElement,
    });
  }

  //  Gets the DOM element for a cell.
  getCellElement(cell) {
    const mapping = this.#map.find((x) => x.cell === cell);
    return mapping ? mapping.cellElement : null;
  }

  //  Gets the cell for a DOM element.
  getCell(cellElement) {
    const mapping = this.#map.find((x) => x.cellElement === cellElement);
    return mapping ? mapping.cell : null;
  }

  //  Removes entries for a crossword.
  removeCrosswordCells(crossword) {
    this.#map = this.#map.filter((x) => x.cell.crossword !== crossword);
  }
}

export { CellMap };
