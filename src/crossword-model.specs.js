const { expect } = require("chai");
const newCrosswordModel = require("./crossword-model");
const quiptic89 = require("./test-crosswords/quiptic89.json");
const alberich4 = require("./test-crosswords/alberich_4.json");

describe("newCrosswordModel()", () => {
  it("should fail if jsonCrossword is not provided", () => {
    expect(() => {
      newCrosswordModel();
    }).to.throw(
      "The model must be initialised with a JSON crossword definition.",
    );
  });

  it("should provide basic details of the crossword in jsonCrossword", () => {
    //  Generate the crossword model.
    const crosswordModel = newCrosswordModel(quiptic89);

    //  Check the width, height and clues.
    expect(crosswordModel.width).to.eql(quiptic89.width);
    expect(crosswordModel.height).to.eql(quiptic89.height);
    expect(crosswordModel.acrossClues.length).to.eql(
      quiptic89.acrossClues.length,
    );
    expect(crosswordModel.downClues.length).to.eql(quiptic89.downClues.length);
  });

  it("should provide clues in the jsonCrossword", () => {
    const crosswordModel = newCrosswordModel(quiptic89);

    const definitionClue = quiptic89.acrossClues[0];
    const modelClue = crosswordModel.acrossClues[0];

    //  Check the width, height and clues.
    expect(modelClue.x).to.eql(definitionClue.x - 1); //  The model is zero based.
    expect(modelClue.y).to.eql(definitionClue.y - 1);

    //  The following elements are parsed from the clue text.
    expect(modelClue.number).to.eql(1);
    expect(modelClue.clueText).to.eql(
      "Conspicuous influence exerted by active troops",
    );
  });

  it("should fail if the bounds of jsonCrossword are invalid", () => {
    const expectedError = "The crossword bounds are invalid.";

    let crosswordDefinition = {
      width: null,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);

    crosswordDefinition = {
      width: 3,
      height: -1,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);

    crosswordDefinition = {
      height: -2,
    };
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(expectedError);
  });

  it("should fail if a clue exceeds the bounds of jsonCrossword", () => {
    const crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [],
      downClues: [],
    };

    crosswordDefinition.acrossClues = [
      {
        x: 3,
        y: 1,
        clue: "3. Clue (12)",
      },
    ];
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw("Clue 3a exceeds horizontal bounds.");

    crosswordDefinition.acrossClues = [];
    crosswordDefinition.downClues = [
      {
        x: 1,
        y: 3,
        clue: "3. Clue (3,1,5)",
      },
    ];
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw("Clue 3d exceeds vertical bounds.");

    crosswordDefinition.acrossClues = [
      {
        x: 3,
        y: -1,
        clue: "3. Clue (12)",
      },
    ];
    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw("Clue 3a doesn't start in the bounds.");
  });

  it("should validate the coherence of a clue if the answers are provided", () => {
    //  This is incoherent - (3,3) is both A and P.
    const crosswordDefinition = {
      width: 10,
      height: 10,
      acrossClues: [
        {
          clue: "1. Red or green fruit (5)",
          x: 3,
          y: 3,
          answer: "APPLE",
        },
      ],
      downClues: [
        {
          clue: "1. Fuzzy fruit (5)",
          x: 3,
          y: 3,
          answer: "PEACH",
        },
      ],
    };

    expect(() => {
      newCrosswordModel(crosswordDefinition);
    }).to.throw(
      "Clue 1d answer at (3, 3) is not coherent with previous clue (1a) answer.",
    );
  });

  it("should correctly construct non-linear clues", () => {
    //  Non-linear clues are clues which have an answer that does fit in a
    //  single contiguous block, but instead is split into multiple sections.
    const crossword = newCrosswordModel(alberich4);

    //  Get the two clues which make up the single non-linear clue.
    const clue4down = crossword.downClues.find((dc) => dc.number === 4);
    const clue21across = crossword.acrossClues.find((ac) => ac.number === 21);

    //  Check we've found the clues.
    expect(clue4down).not.to.equal(null);
    expect(clue21across).not.to.equal(null);

    //  Make sure the connected clues are set.
    expect(clue4down.connectedClues).to.eql([clue21across]);
    expect(clue4down.answerLengthText).to.eql("(9,3,5)");
    expect(clue4down.clueLabel).to.eql("4,21.");
  });
});
