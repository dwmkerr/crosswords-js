const { expect } = require("chai");
const compileClue = require("./compile-clue");
const isAcrossClue = true;
const cd = [];
cd["missing-clue"] = { x: 12, y: 9 };
cd["null-clue"] = { x: 12, y: 9, clue: null };
cd["missing-label"] = { x: 12, y: 9, clue: "Red or green fruit (5)" };
cd["non-numeric-label"] = { x: 12, y: 9, clue: "a. Red or green fruit (5)" };
cd["missing-answer"] = { x: 12, y: 9, clue: "3. Red or green fruit" };
cd["non-numeric-answer"] = { x: 12, y: 9, clue: "3. Red or green fruit (a)" };
cd["invalid-definition"] = { z: 12, y: 9, clue: "3. Red or green fruit (5)" };
cd["missing-x"] = { y: 9, clue: "Red or green fruit (5)" };
cd["null-x"] = { x: null, y: 9, clue: "Red or green fruit (5)" };
cd["invalid-x"] = { x: "a", y: 9, clue: "Red or green fruit (5)" };
cd["missing-y"] = { x: 12, clue: "Red or green fruit (5)" };
cd["null-y"] = { x: 12, y: null, clue: "Red or green fruit (5)" };
cd["invalid-y"] = { x: 12, y: true, clue: "Red or green fruit (5)" };
cd["valid"] = { x: 12, y: 9, clue: "3. Red or green fruit (5)" };
//  Clues should look like this:
//    "<Number>. Clue Text (<Answer structure>)"

describe("compileClue", () => {
  it("should fail if no clueDefinition is provided", () => {
    expect(() => {
      compileClue();
    }).to.throw("'clueDefinition' and 'isAcrossClue' are required");
  });

  it("should fail if no isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["valid"]);
    }).to.throw("'clueDefinition' and 'isAcrossClue' are required");
  });

  it("should fail if isAcrossClue is null", () => {
    expect(() => {
      compileClue(cd["valid"], null);
    }).to.throw("'isAcrossClue' must be a boolean");
  });

  it("should fail if clueDefinition is null", () => {
    expect(() => {
      compileClue(null, isAcrossClue);
    }).to.throw("'clueDefinition' can't be null");
  });

  it("should fail if clueDefinition is invalid", () => {
    expect(() => {
      compileClue(cd["invalid-definition"], isAcrossClue);
    }).to.throw("'clueDefinition' is malformed");
  });

  it("should fail if numeric isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["valid"], 6);
    }).to.throw("'isAcrossClue' must be a boolean");
  });

  it("should fail if string isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["valid"], "a");
    }).to.throw("'isAcrossClue' must be a boolean");
  });

  it("should fail if the clue number is not provided", () => {
    expect(() => {
      compileClue(cd["missing-label"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["missing-label"].clue}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`,
    );
  });

  it("should fail if the clue number is not numeric", () => {
    expect(() => {
      compileClue(cd["non-numeric-label"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["non-numeric-label"].clue}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`,
    );
  });

  it("should fail if the answer structure is not provided", () => {
    expect(() => {
      compileClue(cd["missing-answer"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["missing-answer"].clue}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`,
    );
  });

  it("should fail if the answer structure is not numeric", () => {
    expect(() => {
      compileClue(cd["non-numeric-answer"], isAcrossClue);
    }).to.throw(
      `Clue '${cd["non-numeric-answer"].clue}' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'`,
    );
  });

  it("should compile the number and answer lengths of a clue string", () => {
    const clueModel = compileClue("3. Red or green fruit (5)", isAcrossClue);
    expect(clueModel.number).to.eql(3);
    expect(clueModel.clueText).to.eql("Red or green fruit ");
    expect(clueModel.totalLength).to.eql(5);
    expect(clueModel.answerStructure).to.eql([{ length: 5, terminator: "" }]);
    expect(clueModel.answerStructureText).to.eql("(5)", isAcrossClue);
  });

  it("should compile the answer structure", () => {
    const clueModel = compileClue("9. Clue (5,3-4)", isAcrossClue);
    expect(clueModel.number).to.eql(9);
    expect(clueModel.clueText).to.eql("Clue ");
    expect(clueModel.totalLength).to.eql(12);
    expect(clueModel.answerStructure).to.eql([
      { length: 5, terminator: "," },
      { length: 3, terminator: "-" },
      { length: 4, terminator: "" },
    ]);
    expect(clueModel.answerStructureText).to.eql("(5,3-4)", isAcrossClue);
  });

  it("should compile the connected clue numbers", () => {
    const clueModel = compileClue("9,3a,4. Clue (5,3-4)", isAcrossClue);
    expect(clueModel.number).to.eql(9);
    expect(clueModel.clueText).to.eql("Clue ");
    expect(clueModel.totalLength).to.eql(12);
    expect(clueModel.answerStructure).to.eql([
      { length: 5, terminator: "," },
      { length: 3, terminator: "-" },
      { length: 4, terminator: "" },
    ]);
    expect(clueModel.answerStructureText).to.eql("(5,3-4)");
    expect(clueModel.connectedClueNumbers).to.eql([
      { number: 3, direction: "across" },
      { number: 4, direction: null },
    ]);
  });

  // const number = parseInt(numberText, 10);
  // const x = cd.x - 1; //  Definitions are 1 based, models are more useful 0 based.
  // const y = cd.y - 1;
  // const cells = [];
  // const clueLabel = `${number}.`;
  // const answer = answerText;

  it("should compile the number and answer lengths of a clue string", () => {
    const clueModel = compileClue("3. Red or green fruit (5)", isAcrossClue);
    expect(clueModel.number).to.eql(3);
    expect(clueModel.clueText).to.eql("Red or green fruit ");
    expect(clueModel.totalLength).to.eql(5);
    expect(clueModel.answerStructure).to.eql([{ length: 5, terminator: "" }]);
    expect(clueModel.answerStructureText).to.eql("(5)", isAcrossClue);
  });
});
