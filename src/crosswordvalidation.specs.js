const { expect } = require('chai');
const Crossword = require('./crossword');
const quiptic89 = require('./data/quiptic89.json');

describe('crossword validation', () => {
	
  it('should fail if the bounds of the crossword are invalid', () => {

    var expectedError = "The crossword bounds are invalid.";

    var crosswordDefinition = {
      width: null
    };
    expect(function() { new Crossword(crosswordDefinition); }).to.throw(expectedError);

    crosswordDefinition = {
      width: 3,
      height: -1
    };
    expect(function() { new Crossword(crosswordDefinition); }).to.throw(expectedError);
 
    crosswordDefinition = {
      height: -2
    };
    expect(function() { new Crossword(crosswordDefinition); }).to.throw(expectedError);

	});

  it('should fail if a clue exceeds the bounds of the crossword', function() {

    var crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [],
      downClues: []
    };

    crosswordDefinition.acrossClues = [
      {number: 3, x: 3, y: 1, length: [12]}
    ];
    expect(function() { new Crossword(crosswordDefinition); }).to.throw("Clue 3a exceeds horizontal bounds.");

    crosswordDefinition.acrossClues = [];
    crosswordDefinition.downClues = [
      {number: 3, x: 1, y: 3, length: [3,1,5]}
    ];
    expect(function() { new Crossword(crosswordDefinition); }).to.throw("Clue 3d exceeds vertical bounds.");

    crosswordDefinition.acrossClues = [
      {number: 3, x: 3, y: -1, length: [12]}
    ];
    expect(function() { new Crossword(crosswordDefinition); }).to.throw("Clue 3a doesn't start in the bounds.");

  });

  it('should validate the coherence of a clue if the answers are provided', function() {

    //  This is incoherent - (3,3) is both A and P.
    var crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [
        {number: 1, x: 3, y: 3, length: [5], answer: 'APPLE' }
      ],
      downClues: [
        {number: 1, x: 3, y: 3, length: [5], answer: 'PEACH' },
      ]
    };

    expect(function() { new Crossword(crosswordDefinition); }).to.throw("Clue 1d answer at (3, 3) is not coherent with previous clue (1a) answer.");

  });

});
