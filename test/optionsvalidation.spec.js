describe('options validation', function() {
	
	it('should fail if no options are provided', function() {

    expect(function() { CrosswordsJS.buildCrossword(); }).toThrow(new Error("An options parameter must be passed to 'crossword'."));

	});

  it('should fail if no DOM element is provided', function() {

    var options = {};
    expect(function() { CrosswordsJS.buildCrossword(options); }).toThrow(new Error("The crossword must be initialised with a valid DOM element."));

  });

  it('should fail if no crossword is provided', function() {

    var div = document.createElement('div');
    document.body.appendChild(div);

    var options = {
      element: div
    };

    expect(function() { CrosswordsJS.buildCrossword(options); }).toThrow(new Error("The crossword must be initialised with a crossword definition."));

  });

});