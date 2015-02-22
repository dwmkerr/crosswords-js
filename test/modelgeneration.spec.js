describe('model generation', function() {

  jasmine.getJSONFixtures().fixturesPath = 'base/test/data';

  //  Crossword options are setup before each test.
  var options = null;

  beforeEach(function() {

    //  Create a div to hold the crossword, load the definition.
    var div = document.createElement('div');
    document.body.appendChild(div);
    options = { 
      element: div,
      crosswordDefinition: getJSONFixture('quiptic89.json')
    };
  })
	
	it('should provide basic details of the crossword in the model', function() {

    //  Generate the crossword.
    var definition = options.crosswordDefinition;
    var model = crossword(options);

    //  Check the width, height and clues.
    expect(model.width).toEqual(definition.width);
    expect(model.height).toEqual(definition.height);
    expect(model.acrossClues.length).toEqual(definition.acrossClues.length);
    expect(model.downClues.length).toEqual(definition.downClues.length);

	});

  it('should provide clues in the model', function() {

    //  Generate the crossword.
    var definition = options.crosswordDefinition;
    var model = crossword(options);

    var definitionClue = definition.acrossClues[0];
    var modelClue = model.acrossClues[0];

    //  Check the width, height and clues.
    expect(modelClue.number).toEqual(definitionClue.number);
    expect(modelClue.x).toEqual(definitionClue.x - 1);  //  The model is zero based.
    expect(modelClue.y).toEqual(definitionClue.y - 1);
    expect(modelClue.length).toEqual(definitionClue.length);
    expect(modelClue.clue).toEqual(definitionClue.clue);

    /*
      "number": 6,
      "x": 11,
      "y": 1,
      "length": [
        9
      ],
      
      "clue": "6 Work with the media or a slave-driver (9)"*/

  });

});