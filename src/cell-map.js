//  Internally used map of Crossword model data to DOM elements.
function CellMap() {
  this.map = [];
}

//  Adds a Cell <-> Cell Element mapping.
CellMap.prototype.add = function (cell, cellElement) {
  this.map.push({
    cell,
    cellElement,
  });
};

//  Gets the DOM element for a cell.
CellMap.prototype.getCellElement = function (cell) {
  for (let i = 0; i < this.map.length; i++) {
    if (this.map[i].cell === cell) {
      return this.map[i].cellElement;
    }
  }
  return null;
};

//  Gets the cell for a DOM element.
CellMap.prototype.getCell = function (cellElement) {
  for (let i = 0; i < this.map.length; i++) {
    if (this.map[i].cellElement === cellElement) {
      return this.map[i].cell;
    }
  }
  return null;
};


//  Removes entries for a crossword.
CellMap.prototype.removeCrosswordCells = function removeCrosswordCells(crossword) {
  for (let i = 0; i < this.map.length; i++) {
    if (this.map[i].cell.crossword === crossword) {
      this.map.splice(i, 1);
    }
  }
};

module.exports = CellMap;
