import { expect } from 'chai';
import {
  clueRegex,
  labelPartsRegex,
  clueTextRegex,
  lengthPartsRegex,
} from '../src/clue-model.mjs';

describe('clueRegex', () => {
  it('should parse a well-formed single-word, single-segment clue', () => {
    const clue = '2.This is a clue(5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2');
    expect(groups[2]).eql('This is a clue');
    expect(groups[3]).eql('5');
  });

  it('should parse a well-formed multi-word, single-segment clue', () => {
    const clue = '2.This is a clue(5,3)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2');
    expect(groups[2]).eql('This is a clue');
    expect(groups[3]).eql('5,3');
  });

  it('should parse a well-formed single-word, multi-segment clue', () => {
    const clue = '2,8.This is a clue(5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2,8');
    expect(groups[2]).eql('This is a clue');
    expect(groups[3]).eql('5');
  });

  it('should parse a well-formed multi-word, multi-segment clue', () => {
    const clue = '2,8.This is a clue(5,3)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2,8');
    expect(groups[2]).eql('This is a clue');
    expect(groups[3]).eql('5,3');
  });
  it('should parse a well-formed single-word, single-segment clue with padding', () => {
    const clue = ' 2 . This is a clue ( 5 ) ';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2 ');
    expect(groups[2]).eql(' This is a clue ');
    expect(groups[3]).eql(' 5 ');
  });

  it('should parse a well-formed multi-word, multi-segment clue with padding', () => {
    const clue = ' 2 , 8 . This is a clue ( 5 , 3 ) ';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2 , 8 ');
    expect(groups[2]).eql(' This is a clue ');
    expect(groups[3]).eql(' 5 , 3 ');
  });

  it('should not parse a single-word, single-segment clue without a label', () => {
    const clue = 'This is a clue(5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.false;
    const groups = clueRegex.exec(clue);
    expect(groups).is.null;
  });

  it('should parse a single-word, single-segment clue with no clue text', () => {
    const clue = '2.(5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2');
    expect(groups[2]).eql('');
    expect(groups[3]).eql('5');
  });

  it('should parse a single-word, single-segment clue with empty clue text', () => {
    const clue = '2.     (5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2');
    expect(groups[2]).eql('     ');
    expect(groups[3]).eql('5');
  });

  it('should not parse a single-word, single-segment clue without a length', () => {
    const clue = '2.This is a clue';
    const parses = clueRegex.test(clue);
    expect(parses).is.false;
    const groups = clueRegex.exec(clue);
    expect(groups).is.null;
  });

  it('should not parse a single-word, single-segment clue without a closing parenthesis', () => {
    const clue = '2.This is a clue(5';
    const parses = clueRegex.test(clue);
    expect(parses).is.false;
    const groups = clueRegex.exec(clue);
    expect(groups).is.null;
  });

  it('should not parse a single-word, single-segment clue without an opening parenthesis', () => {
    const clue = '2.This is a clue 5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.false;
    const groups = clueRegex.exec(clue);
    expect(groups).is.null;
  });
  it('should parse a well-formed acronym clue', () => {
    const clue = '5. Global health administration (1.1.1.)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('5');
    expect(groups[2]).eql(' Global health administration ');
    expect(groups[3]).eql('1.1.1.');
  });

  it('should incorrectly parse a period-separated label, multi-segment clue', () => {
    const clue = '2.8.This is a clue(5)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2');
    expect(groups[2]).eql('8.This is a clue');
    expect(groups[3]).eql('5');
  });

  it('should incorrectly parse a parentheses-separated length multi-segment clue', () => {
    const clue = '2.8.This is a clue((5)7)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('2');
    expect(groups[2]).eql('8.This is a clue(');
    expect(groups[3]).eql('5)7');
  });

  it('should incorrectly parse "9. Clue (5(3(4)"', () => {
    const clue = '9. Clue (5(3(4)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('9');
    expect(groups[2]).eql(' Clue (5(3');
    expect(groups[3]).eql('4');
  });

  it('should incorrectly parse "9. Clue (5)3)4)"', () => {
    const clue = '9. Clue (5)3)4)';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('9');
    expect(groups[2]).eql(' Clue ');
    expect(groups[3]).eql('5)3)4');
  });

  it('should incorrectly parse "9. Clue (5,3,4))"', () => {
    const clue = '9. Clue (5,3,4))';
    const parses = clueRegex.test(clue);
    expect(parses).is.true;
    const groups = clueRegex.exec(clue);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('9');
    expect(groups[2]).eql(' Clue ');
    expect(groups[3]).eql('5,3,4)');
  });
});

describe('labelPartsRegex', () => {
  it('should parse a well-formed single-segment numeric label', () => {
    const labelParts = '2';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    const groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('');
    expect(groups[2]).eql('2');
    expect(groups[3]).eql('');
  });

  it('should parse a well-formed single-segment id label', () => {
    const labelParts = '2d';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    const groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('');
    expect(groups[2]).eql('2d');
    expect(groups[3]).eql('');
  });

  it('should parse a well-formed multi-segment numeric label', () => {
    let remainder, groups;
    const labelParts = '2,5';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('');
    expect(groups[2]).eql('2');
    remainder = groups[3];
    expect(remainder).eql(',5');
    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    expect(groups[1]).eql(',');
    expect(groups[2]).eql('5');
    remainder = groups[3];
    expect(remainder).eql('');
  });

  it('should parse a well-formed multi-segment id label', () => {
    let remainder, groups;
    const labelParts = '2a,5d';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    expect(groups[2]).eql('2a');
    remainder = groups[3];
    expect(remainder).eql(',5d');
    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    expect(groups[2]).eql('5d');
    remainder = groups[3];
    expect(remainder).eql('');
  });

  it('should parse a well-formed multi-segment mixed label', () => {
    let remainder,
      groups,
      labels = [];
    const labelParts = '2a,3,5d,8,15';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a']);
    expect(remainder).eql(',3,5d,8,15');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a', '3']);
    expect(remainder).eql(',5d,8,15');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a', '3', '5d']);
    expect(remainder).eql(',8,15');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a', '3', '5d', '8']);
    expect(remainder).eql(',15');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a', '3', '5d', '8', '15']);
    expect(remainder).eql('');
  });

  it('should parse a well-formed padded multi-segment mixed label', () => {
    let remainder,
      groups,
      labels = [];
    const labelParts = '   2a  ,  3, 5d  ';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a']);
    expect(remainder).eql(',  3, 5d  ');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a', '3']);
    expect(remainder).eql(', 5d  ');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2a', '3', '5d']);
    expect(remainder).eql('');
  });

  it('should not parse an empty label', () => {
    const labelParts = '  ';
    const parses = labelPartsRegex.test(labelParts);
    expect(parses).is.false;
    const groups = labelPartsRegex.exec(labelParts);
    expect(groups).is.null;
  });

  it('should not parse a single-segment label with a typo', () => {
    let remainder,
      groups,
      parses,
      labels = [];
    const labelParts = '3b';
    parses = labelPartsRegex.test(labelParts);
    groups = labelPartsRegex.exec(labelParts);
    expect(parses).is.true;
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['3']);
    expect(remainder).eql('b');

    parses = labelPartsRegex.test(remainder);
    groups = labelPartsRegex.exec(remainder);
    expect(parses).is.false;
    expect(groups).is.null;
  });

  it('should not parse a multi-segment label with a typo', () => {
    let remainder,
      groups,
      parses,
      labels = [];
    const labelParts = '3a,4b,7';
    parses = labelPartsRegex.test(labelParts);
    groups = labelPartsRegex.exec(labelParts);
    expect(parses).is.true;
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['3a']);
    expect(remainder).eql(',4b,7');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['3a', '4']);
    expect(remainder).eql('b,7');

    parses = labelPartsRegex.test(remainder);
    groups = labelPartsRegex.exec(remainder);
    expect(parses).is.false;
    expect(groups).is.null;
  });

  it('should not parse a multi-segment label with missing final segment', () => {
    let remainder,
      groups,
      parses,
      labels = [];
    const labelParts = '2,3,5,8,';
    parses = labelPartsRegex.test(labelParts);
    expect(parses).is.true;
    groups = labelPartsRegex.exec(labelParts);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2']);
    expect(remainder).eql(',3,5,8,');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2', '3']);
    expect(remainder).eql(',5,8,');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2', '3', '5']);
    expect(remainder).eql(',8,');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['2', '3', '5', '8']);
    expect(remainder).eql(',');

    parses = labelPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = labelPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse (9,3b,4)', () => {
    let remainder,
      groups,
      parses,
      labels = [];
    const labelParts = '9,3b,4';
    parses = labelPartsRegex.test(labelParts);
    groups = labelPartsRegex.exec(labelParts);
    expect(parses).is.true;
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['9']);
    expect(remainder).eql(',3b,4');

    groups = labelPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    labels.push(groups[2]);
    remainder = groups[3];
    expect(labels).eql(['9', '3']);
    expect(remainder).eql('b,4');

    parses = labelPartsRegex.test(remainder);
    groups = labelPartsRegex.exec(remainder);
    expect(parses).is.false;
    expect(groups).is.null;
  });
});

describe('lengthPartsRegex', () => {
  it('should parse a well-formed single-segment numeric length', () => {
    const lengthParts = '2';
    const parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    const groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('');
    expect(groups[2]).eql('2');
    expect(groups[3]).eql('');
  });

  it('should parse a well-formed multi-segment numeric length', () => {
    let remainder, groups;
    const lengthParts = '2,5';
    const parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    expect(groups[1]).eql('');
    expect(groups[2]).eql('2');
    remainder = groups[3];
    expect(remainder).eql(',5');
    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    expect(groups[1]).eql(',');
    expect(groups[2]).eql('5');
    remainder = groups[3];
    expect(remainder).eql('');
  });

  it('should parse a well-formed padded multi-segment length', () => {
    let remainder,
      groups,
      lengths = [];
    const lengthParts = '   2  ,  3, 5  ';
    const parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2']);
    expect(remainder).eql(',  3, 5  ');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2', '3']);
    expect(remainder).eql(', 5  ');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2', '3', '5']);
    expect(remainder).eql('');
  });

  it('should parse an acronym', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '1.1.1.';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['1']);
    expect(remainder).eql('1.1.');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['1', '1']);
    expect(remainder).eql('1.');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['1', '1', '1']);
    expect(remainder).eql('');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should parse (5,3-4-,6)', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '5,3-4-,6';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['5']);
    expect(remainder).eql(',3-4-,6');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['5', '3']);
    expect(remainder).eql('-4-,6');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['5', '3', '4']);
    expect(remainder).eql('-,6');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['5', '3', '4', '6']);
    expect(remainder).eql('');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse an empty length', () => {
    const lengthParts = '  ';
    const parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.false;
    const groups = lengthPartsRegex.exec(lengthParts);
    expect(groups).is.null;
  });

  it('should not parse a single-segment length with a typo', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '3b';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['3']);
    expect(remainder).eql('b');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse a multi-segment length with a typo', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '3,4b,7';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['3']);
    expect(remainder).eql(',4b,7');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['3', '4']);
    expect(remainder).eql('b,7');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse a multi-segment length with missing final segment', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '2,3,5,8,';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2']);
    expect(remainder).eql(',3,5,8,');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2', '3']);
    expect(remainder).eql(',5,8,');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2', '3', '5']);
    expect(remainder).eql(',8,');

    groups = lengthPartsRegex.exec(remainder);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['2', '3', '5', '8']);
    expect(remainder).eql(',');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse 5)7', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '5)7';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['5']);
    expect(remainder).eql(')7');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse (5', () => {
    let groups, parses;
    const lengthParts = '(5';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups).is.null;
  });

  it('should not parse 5)', () => {
    let remainder,
      groups,
      parses,
      lengths = [];
    const lengthParts = '5)';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.true;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups.length).eql(4);
    lengths.push(groups[2]);
    remainder = groups[3];
    expect(lengths).eql(['5']);
    expect(remainder).eql(')');

    parses = lengthPartsRegex.test(remainder);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should not parse (5)', () => {
    let groups, parses;
    const lengthParts = '(5)';
    parses = lengthPartsRegex.test(lengthParts);
    expect(parses).is.false;
    groups = lengthPartsRegex.exec(lengthParts);
    expect(groups).is.null;
  });
});

describe('clueTextRegex', () => {
  it('should parse a well-formed clueText', () => {
    const clueText = '2';
    const parses = clueTextRegex.test(clueText);
    expect(parses).is.true;
    const groups = clueTextRegex.exec(clueText);
    expect(groups.length).eql(2);
    expect(groups[1]).eql('2');
  });

  it('should parse a well-formed padded clueText', () => {
    const clueText = '    a clue text   ';
    const parses = clueTextRegex.test(clueText);
    expect(parses).is.true;
    const groups = clueTextRegex.exec(clueText);
    expect(groups.length).eql(2);
    expect(groups[1]).eql('a clue text');
  });

  it('should parse an empty clueText', () => {
    const clueText = '';
    const parses = clueTextRegex.test(clueText);
    expect(parses).is.true;
    const groups = clueTextRegex.exec(clueText);
    expect(groups.length).eql(2);
    expect(groups[1]).eql('');
  });

  it('should parse a well-formed clueText containing section terminators', () => {
    const clueText = '. This i)s. (clue) text)(';
    const parses = clueTextRegex.test(clueText);
    expect(parses).is.true;
    const groups = clueTextRegex.exec(clueText);
    expect(groups.length).eql(2);
    expect(groups[1]).eql(clueText);
  });
});
