const { expect } = require("chai");
const compileClue = require("./compile-clue");
const isAcrossClue = true;
const cd = [];
cd["missing-clue"] = { x: 12, y: 9 };
cd["null-clue"] = { x: 12, y: 9, clue: null };
cd["missing-label"] = { x: 12, y: 9, clue: "Red or green fruit (5)" };
cd["non-numeric-label"] = { x: 12, y: 9, clue: "a. Red or green fruit (5)" };
cd["missing-answer-structure"] = { x: 12, y: 9, clue: "3. Red or green fruit" };
cd["invalid-answer-structure"] = {
  x: 12,
  y: 9,
  clue: "3. Red or green fruit (a)",
};
cd["missing-x"] = { y: 9, clue: "Red or green fruit (5)" };
cd["null-x"] = { x: null, y: 9, clue: "Red or green fruit (5)" };
cd["invalid-x"] = { x: "a", y: 9, clue: "Red or green fruit (5)" };
cd["missing-y"] = { x: 12, clue: "Red or green fruit (5)" };
cd["null-y"] = { x: 12, y: null, clue: "Red or green fruit (5)" };
cd["invalid-y"] = { x: 12, y: true, clue: "Red or green fruit (5)" };
cd["correct"] = { x: 12, y: 9, clue: "3. Red or green fruit (5)" };
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
      compileClue(cd["missing-label"]);
    }).to.throw("'clueDefinition' and 'isAcrossClue' are required");
  });

  it("should fail if null isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["missing-label"], null);
    }).to.throw("'isAcrossClue' must be a boolean");
  });

  it("should fail if null clueDefinition is provided", () => {
    expect(() => {
      compileClue(null, null);
    }).to.throw("'clueDefinition' can't be null");
  });

  it("should fail if numeric isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["missing-label"], 6);
    }).to.throw("'isAcrossClue' must be a boolean");
  });

  it("should fail if string isAcrossClue is provided", () => {
    expect(() => {
      compileClue(cd["missing-label"], "a");
    }).to.throw("'isAcrossClue' must be a boolean");
  });

  it("should fail if the clue number is not provided", () => {
    expect(() => {
      compileClue("Red or green fruit (5)", isAcrossClue);
    }).to.throw(
      "Clue 'Red or green fruit (5)' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'",
    );
  });

  it("should fail if the clue number is not numeric", () => {
    expect(() => {
      compileClue("a. Red or green fruit (5)", isAcrossClue);
    }).to.throw(
      "Clue 'a. Red or green fruit (5)' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'",
    );
  });

  it("should fail if the answer structure is not provided", () => {
    expect(() => {
      compileClue("3. Red or green fruit", isAcrossClue);
    }).to.throw(
      "Clue '3. Red or green fruit' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'",
    );
  });

  it("should fail if the answer structure is not numeric", () => {
    expect(() => {
      compileClue("3. Red or green fruit (a)", isAcrossClue);
    }).to.throw(
      "Clue '3. Red or green fruit (a)' does not meet the required structured '<Number>. Clue Text (<Answer structure>)'",
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
