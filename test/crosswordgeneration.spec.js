describe('model generation', function() {

  jasmine.getJSONFixtures().fixturesPath = 'base/test/data';
  var quiptic89 = getJSONFixture('quiptic89.json');

  it('should fail if no definition is provided', function() {

    expect(function() { new CrosswordsJS.Crossword(); }).toThrow(new Error("The Crossword must be initialised with a crossword definition."));

  });
	
	it('should provide basic details of the crossword in the model', function() {

    //  Generate the crossword.
    var crossword = new CrosswordsJS.Crossword(quiptic89);

    //  Check the width, height and clues.
    expect(crossword.width).toEqual(quiptic89.width);
    expect(crossword.height).toEqual(quiptic89.height);
    expect(crossword.acrossClues.length).toEqual(quiptic89.acrossClues.length);
    expect(crossword.downClues.length).toEqual(quiptic89.downClues.length);

	});

  it('should provide clues in the model', function() {

    var crossword = new CrosswordsJS.Crossword(quiptic89);

    var definitionClue = quiptic89.acrossClues[0];
    var modelClue = crossword.acrossClues[0];

    //  Check the width, height and clues.
    expect(modelClue.number).toEqual(definitionClue.number);
    expect(modelClue.x).toEqual(definitionClue.x - 1);  //  The model is zero based.
    expect(modelClue.y).toEqual(definitionClue.y - 1);
    expect(modelClue.length).toEqual(definitionClue.length);
    expect(modelClue.clue).toEqual(definitionClue.clue);

  });

});