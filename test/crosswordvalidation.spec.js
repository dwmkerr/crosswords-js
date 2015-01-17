describe('crossword validation', function() {

  var div = document.createElement('div');
  document.body.appendChild(div);
  var options = { element: div };
	
	it('should fail if the bounds of the crossword are invalid', function() {

    var expectedError = new Error("The crossword bounds are invalid.");

    options.crossword = {
      width: null
    };
    expect(function() { crossword(options); }).toThrow(expectedError);

    options.crossword = {
      width: 3,
      height: -1
    };
    expect(function() { crossword(options); }).toThrow(expectedError);
 
    options.crossword = {
      height: -2
    };
    expect(function() { crossword(options); }).toThrow(expectedError); 

	});

  it('should fail if a clue exceeds the bounds of the crossword', function() {

    options.crossword = {
      width: 10,
      height: 10
    };

    options.crossword.clues = [
      {number: 3, x: 3, y: 1, direction: 'across', length: [12]}
    ];
    expect(function() { crossword(options); }).toThrow(new Error("Clue 3 exceeds horizontal bounds."));

    options.crossword.clues = [
      {number: 3, x: 1, y: 3, direction: 'down', length: [3,1,5]}
    ];
    expect(function() { crossword(options); }).toThrow(new Error("Clue 3 exceeds vertical bounds."));

    options.crossword.clues = [
      {number: 3, x: 3, y: -1, length: [12]}
    ];
    expect(function() { crossword(options); }).toThrow(new Error("Clue 3 doesn't start in the bounds."));

  });

  it('should validate the coherence of a clue if the answers are provided', function() {

    //  This is incoherent - (3,3) is both A and P.
    options.crossword = {
      width: 10,
      height: 10,
      clues: [
        {number: 1, x: 3, y: 3, length: [5], direction: 'across', answer: 'APPLE' },
        {number: 1, x: 3, y: 3, length: [5], direction: 'down', answer: 'PEACH' },
      ]
    };

    expect(function() { crossword(options); }).toThrow(new Error("Clue 1 at (3, 3) is not coherent with previous clues answers."));

  });

});