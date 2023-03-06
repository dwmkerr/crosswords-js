const { expect } = require("chai");
const { compileClue, cluePattern } = require("./compile-clue");
const isAcrossClue = true;
const cd = [];
cd["missing-clue"] = { x: 12, y: 9 };
cd["null-clue"] = { x: 12, y: 9, clue: null };
cd["missing-label"] = { x: 12, y: 9, clue: "Red or green fruit (5)" };
cd["non-numeric-label"] = { x: 12, y: 9, clue: "a. Red or green fruit (5)" };
cd["missing-answer"] = { x: 12, y: 9, clue: "3. Red or green fruit" };
cd["non-numeric-answer"] = { x: 12, y: 9, clue: "3. Red or green fruit (a)" };
cd["z-replaces-x"] = { z: 12, y: 9, clue: "3. Red or green fruit (5)" };
cd["missing-x"] = { y: 9, clue: "Red or green fruit (5)" };
cd["null-x"] = { x: null, y: 9, clue: "Red or green fruit (5)" };
cd["string-x"] = { x: "a", y: 9, clue: "Red or green fruit (5)" };
cd["missing-y"] = { x: 12, clue: "Red or green fruit (5)" };
cd["null-y"] = { x: 12, y: null, clue: "Red or green fruit (5)" };
cd["boolean-y"] = { x: 12, y: true, clue: "Red or green fruit (5)" };
cd["unexpected-properties"] = {
  x: 12,
  y: 9,
  z: true,
  a: "z",
  clue: "3. Red or green fruit (5)",
};
cd["valid-single-segment"] = { x: 12, y: 9, clue: "3. Red or green fruit (5)" };
cd["valid-multi-word"] = { x: 12, y: 9, clue: "9. Clue (5,3-4)" };
cd["valid-multi-segment"] = { x: 12, y: 9, clue: "9,3a,4. Clue (5,3-4)" };

describe("compileClue", () => {
  it("should fail if no clueDefinition is provided", () => {
    expect(() => {
      compileClue();
    }).to.throw("'clueDefinition' and 'isAcrossClue' are required");
  });

  it("should fail if no isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["valid-single-segment"]);
    }).to.throw("'clueDefinition' and 'isAcrossClue' are required");
  });

  it("should fail if isAcrossClue is null", () => {
    expect(() => {
      compileClue(cd["valid-single-segment"], null);
    }).to.throw("'isAcrossClue' can't be null");
  });

  it("should fail if clueDefinition is null", () => {
    expect(() => {
      compileClue(null, isAcrossClue);
    }).to.throw("'clueDefinition' can't be null");
  });

  it("should fail if clueDefinition.x replaced by another property", () => {
    expect(() => {
      compileClue(cd["z-replaces-x"], isAcrossClue);
    }).to.throw("'clueDefinition.x' property is missing");
  });

  it("should fail if clueDefinition.x missing", () => {
    expect(() => {
      compileClue(cd["missing-x"], isAcrossClue);
    }).to.throw("'clueDefinition.x' property is missing");
  });

  it("should fail if clueDefinition.x is null", () => {
    expect(() => {
      compileClue(cd["null-x"], isAcrossClue);
    }).to.throw("'clueDefinition.x' must have type <number>");
  });

  it("should fail if clueDefinition.x is a string", () => {
    expect(() => {
      compileClue(cd["string-x"], isAcrossClue);
    }).to.throw("'clueDefinition.x' must have type <number>");
  });

  it("should fail if clueDefinition.y missing", () => {
    expect(() => {
      compileClue(cd["missing-y"], isAcrossClue);
    }).to.throw("'clueDefinition.y' property is missing");
  });

  it("should fail if clueDefinition.y is null", () => {
    expect(() => {
      compileClue(cd["null-y"], isAcrossClue);
    }).to.throw("'clueDefinition.y' must have type <number>");
  });

  it("should fail if clueDefinition.y is a boolean", () => {
    expect(() => {
      compileClue(cd["boolean-y"], isAcrossClue);
    }).to.throw("'clueDefinition.y' must have type <number>");
  });

  it("should fail if clueDefinition has unexpected properties", () => {
    expect(() => {
      compileClue(cd["unexpected-properties"], isAcrossClue);
    }).to.throw("'clueDefinition' has unexpected properties <z,a>");
  });

  it("should fail if the clue number is not provided", () => {
    expect(() => {
      compileClue(cd["missing-label"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["missing-label"].clue}' does not match the required pattern '${cluePattern}'`,
    );
  });

  it("should fail if the clue number is not numeric", () => {
    expect(() => {
      compileClue(cd["non-numeric-label"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["non-numeric-label"].clue}' does not match the required pattern '${cluePattern}'`,
    );
  });

  it("should fail if the answer structure is not provided", () => {
    expect(() => {
      compileClue(cd["missing-answer"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["missing-answer"].clue}' does not match the required pattern '${cluePattern}'`,
    );
  });

  it("should fail if the answer structure is not numeric", () => {
    expect(() => {
      compileClue(cd["non-numeric-answer"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["non-numeric-answer"].clue}' does not match the required pattern '${cluePattern}'`,
    );
  });

  it("should compile the number and answer lengths of a clue string", () => {
    const clueModel = compileClue(cd["valid-single-segment"], isAcrossClue);
    expect(clueModel.number).to.eql(3);
    expect(clueModel.clueText).to.eql("Red or green fruit");
    expect(clueModel.answerLength).to.eql(5);
    expect(clueModel.answerSegments).to.eql([{ length: 5, terminator: "" }]);
    expect(clueModel.answerSegmentsText).to.eql("(5)", isAcrossClue);
  });

  it("should compile the answer structure", () => {
    const clueModel = compileClue(cd["valid-multi-word"], isAcrossClue);
    expect(clueModel.number).to.eql(9);
    expect(clueModel.clueText).to.eql("Clue");
    expect(clueModel.answerLength).to.eql(12);
    expect(clueModel.answerSegments).to.eql([
      { length: 5, terminator: "," },
      { length: 3, terminator: "-" },
      { length: 4, terminator: "" },
    ]);
    expect(clueModel.answerSegmentsText).to.eql("(5,3-4)", isAcrossClue);
  });

  it("should compile multi-segment clue numbers", () => {
    const clueModel = compileClue(cd["valid-multi-segment"], isAcrossClue);
    expect(clueModel.number).to.eql(9);
    expect(clueModel.clueText).to.eql("Clue");
    expect(clueModel.answerLength).to.eql(12);
    expect(clueModel.answerSegments).to.eql([
      { length: 5, terminator: "," },
      { length: 3, terminator: "-" },
      { length: 4, terminator: "" },
    ]);
    expect(clueModel.answerSegmentsText).to.eql("(5,3-4)");
    expect(clueModel.connectedClues).to.eql([
      { number: 3, direction: "across" },
      { number: 4, direction: null },
    ]);
  });

  // const x = cd.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  // const y = cd.y - 1;
  // const cells = [];
  // const clueLabel = `${number}.`;
  // const answer = answerText;

  it("should compile the number and answer lengths of a clue string", () => {
    const clueModel = compileClue(cd["valid-single-segment"], isAcrossClue);
    expect(clueModel.answer).to.eql("");
    expect(clueModel.answerSegments).to.eql([{ length: 5, terminator: "" }]);
    expect(clueModel.answerSegmentsText).to.eql("(5)", isAcrossClue);
    expect(clueModel.cells).to.eql([]);
    expect(clueModel.clueLabel).to.eql("3");
    expect(clueModel.clueText).to.eql("Red or green fruit");
    expect(clueModel.number).to.eql(3);
    expect(clueModel.answerLength).to.eql(5);
    expect(clueModel.x).to.eql(11);
    expect(clueModel.y).to.eql(8);
  });
});
