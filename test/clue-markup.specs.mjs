import { expect } from 'chai';
import {
  boldAsteriskRegex,
  boldItalicAsteriskRegex,
  boldItalicUnderscoreRegex,
  boldUnderscoreRegex,
  italicAsteriskRegex,
  italicUnderscoreRegex,
  parseMarkdown,
} from '../src/clue-model.mjs';

describe('boldAsteriskRegex', () => {
  it('should not parse a string without bold markup', () => {
    let example = 'Some bold text';
    let parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some *bold text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some *bold* text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some **bold text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = '**Some bold text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bold text**';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo**ld text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo*ld** text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo**ld* text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;

    // No captured text
    example = 'Some bo****ld text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.false;
    let groups = boldAsteriskRegex.exec(example);
    expect(groups).is.null;
  });

  it('should parse a string with bold markup', () => {
    let example = 'Some **bold** text';
    let parses = boldAsteriskRegex.test(example);
    expect(parses).is.true;
    let groups = boldAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('**bold**');
    expect(remainder).eql(' text');

    example = '**Some bold text**';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('**Some bold text**');
    expect(remainder).eql('');

    example = '** Some bold ** text';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('** Some bold **');
    expect(remainder).eql(' text');

    example = '**Some** bold **text**';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('**Some**');
    expect(remainder).eql(' bold **text**');
    // Test again on remainder
    groups = boldAsteriskRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('**text**');
    expect(remainder).eql('');
    // Test again on empty remainder
    groups = boldAsteriskRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should parse a string with nested markup', () => {
    let example = '**Bold text with *italics* embedded**';
    let parses = boldAsteriskRegex.test(example);
    expect(parses).is.true;
    let groups = boldAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('**Bold text with *italics* embedded**');
    expect(remainder).eql('');

    example = '**Bold text with ***bold-italics*** embedded**';
    parses = boldAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    // Bold markup matches early - we must process longer
    // markup sequences i.e. *** before shorter sequences
    expect(match).eql('**Bold text with **');
    expect(remainder).eql('*bold-italics*** embedded**');

    parses = boldAsteriskRegex.test(remainder);
    expect(parses).is.true;
    groups = boldAsteriskRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    // Bold markup matches early - we must process longer
    // markup sequences i.e. *** before shorter sequences
    expect(match).eql('*** embedded**');
    expect(remainder).eql('');
  });
});

describe('italicAsteriskRegex', () => {
  it('should not parse a string without italic markup', () => {
    let example = 'Some italic text';
    let parses = italicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some *italic text';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = '*Some italic text';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some italic text*';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.false;

    // No 'captured' text
    example = 'Some ita**lic text';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.false;
  });

  it('should parse a string with italic markup', () => {
    let example = 'Some *italic* text';
    let parses = italicAsteriskRegex.test(example);
    expect(parses).is.true;
    let groups = italicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('*italic*');
    expect(remainder).eql(' text');

    example = '*Some italic text*';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = italicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('*Some italic text*');
    expect(remainder).eql('');

    example = '* Some italic * text';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = italicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('* Some italic *');
    expect(remainder).eql(' text');

    example = '*Some* italic *text*';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = italicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('*Some*');
    expect(remainder).eql(' italic *text*');
    // Test again on remainder
    groups = italicAsteriskRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('*text*');
    expect(remainder).eql('');
    // Test again on empty remainder
    groups = italicAsteriskRegex.exec(remainder);
    expect(groups).is.null;

    example = 'Some **italic** text';
    parses = italicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = italicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('*italic*');
    expect(remainder).eql('* text');
  });
});

describe('boldItalicAsteriskRegex', () => {
  it('should not parse a string without bold-italic markup', () => {
    let example = 'Some bold-italic text';
    let parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some *bold-italic text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some *bold-italic* text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some ***bold-italic text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = '***Some bold-italic text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bold-italic text***';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo***ld text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo*ld*** text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo***ld* text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;

    // No 'captured' text
    example = 'Some******bold-italic text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.false;
    let groups = boldItalicAsteriskRegex.exec(example);
    expect(groups).is.null;
  });

  it('should parse a string with bold-italic markup', () => {
    let example = 'Some ***bold-italic*** text';
    let parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.true;
    let groups = boldItalicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('***bold-italic***');
    expect(remainder).eql(' text');

    example = '***Some bold-italic text***';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldItalicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('***Some bold-italic text***');
    expect(remainder).eql('');

    example = '*** Some bold-italic *** text';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldItalicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('*** Some bold-italic ***');
    expect(remainder).eql(' text');

    example = '***Some*** bold-italic ***text***';
    parses = boldItalicAsteriskRegex.test(example);
    expect(parses).is.true;
    groups = boldItalicAsteriskRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('***Some***');
    expect(remainder).eql(' bold-italic ***text***');
    // Test again on remainder
    groups = boldItalicAsteriskRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('***text***');
    expect(remainder).eql('');
    // Test again on empty remainder
    groups = boldItalicAsteriskRegex.exec(remainder);
    expect(groups).is.null;
  });
});

describe('boldUnderscoreRegex', () => {
  it('should not parse a string without bold markup', () => {
    let example = 'Some bold text';
    let parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some _bold text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some _bold_ text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some __bold text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = '__Some bold text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bold text__';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo__ld text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo_ld__ text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo__ld_ text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;

    // No captured text
    example = 'Some bo____ld text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.false;
    let groups = boldUnderscoreRegex.exec(example);
    expect(groups).is.null;
  });

  it('should parse a string with bold markup', () => {
    let example = 'Some __bold__ text';
    let parses = boldUnderscoreRegex.test(example);
    expect(parses).is.true;
    let groups = boldUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('__bold__');
    expect(remainder).eql(' text');

    example = '__Some bold text__';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('__Some bold text__');
    expect(remainder).eql('');

    example = '__ Some bold __ text';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('__ Some bold __');
    expect(remainder).eql(' text');

    example = '__Some__ bold __text__';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('__Some__');
    expect(remainder).eql(' bold __text__');
    // Test again on remainder
    groups = boldUnderscoreRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('__text__');
    expect(remainder).eql('');
    // Test again on empty remainder
    groups = boldUnderscoreRegex.exec(remainder);
    expect(groups).is.null;
  });

  it('should parse a string with nested markup', () => {
    let example = '__Bold text with _italics_ embedded__';
    let parses = boldUnderscoreRegex.test(example);
    expect(parses).is.true;
    let groups = boldUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('__Bold text with _italics_ embedded__');
    expect(remainder).eql('');

    example = '__Bold text with ___bold-italics___ embedded__';
    parses = boldUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    // Bold markup matches early - we must process longer
    // markup sequences i.e. ___ before shorter sequences
    expect(match).eql('__Bold text with __');
    expect(remainder).eql('_bold-italics___ embedded__');

    parses = boldUnderscoreRegex.test(remainder);
    expect(parses).is.true;
    groups = boldUnderscoreRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    // Bold markup matches early - we must process longer
    // markup sequences i.e. ___ before shorter sequences
    expect(match).eql('___ embedded__');
    expect(remainder).eql('');
  });
});

describe('italicUnderscoreRegex', () => {
  it('should not parse a string without italic markup', () => {
    let example = 'Some italic text';
    let parses = italicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some _italic text';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = '_Some italic text';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some italic text_';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.false;

    // No 'captured' text
    example = 'Some ita__lic text';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.false;
  });

  it('should parse a string with italic markup', () => {
    let example = 'Some _italic_ text';
    let parses = italicUnderscoreRegex.test(example);
    expect(parses).is.true;
    let groups = italicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('_italic_');
    expect(remainder).eql(' text');

    example = '_Some italic text_';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = italicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('_Some italic text_');
    expect(remainder).eql('');

    example = '_ Some italic _ text';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = italicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('_ Some italic _');
    expect(remainder).eql(' text');

    example = '_Some_ italic _text_';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = italicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('_Some_');
    expect(remainder).eql(' italic _text_');
    // Test again on remainder
    groups = italicUnderscoreRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('_text_');
    expect(remainder).eql('');
    // Test again on empty remainder
    groups = italicUnderscoreRegex.exec(remainder);
    expect(groups).is.null;

    example = 'Some __italic__ text';
    parses = italicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = italicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('_italic_');
    expect(remainder).eql('_ text');
  });
});

describe('boldItalicUnderscoreRegex', () => {
  it('should not parse a string without bold-italic markup', () => {
    let example = 'Some bold-italic text';
    let parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some _bold-italic text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some _bold-italic_ text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some ___bold-italic text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = '___Some bold-italic text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bold-italic text___';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo___ld text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo_ld___ text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    example = 'Some bo___ld_ text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;

    // No 'captured' text
    example = 'Some______bold-italic text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.false;
    let groups = boldItalicUnderscoreRegex.exec(example);
    expect(groups).is.null;
  });

  it('should parse a string with bold-italic markup', () => {
    let example = 'Some ___bold-italic___ text';
    let parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.true;
    let groups = boldItalicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    let [, prelude, match, remainder] = groups;
    expect(match).eql('___bold-italic___');
    expect(remainder).eql(' text');

    example = '___Some bold-italic text___';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldItalicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('___Some bold-italic text___');
    expect(remainder).eql('');

    example = '___ Some bold-italic ___ text';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldItalicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('___ Some bold-italic ___');
    expect(remainder).eql(' text');

    example = '___Some___ bold-italic ___text___';
    parses = boldItalicUnderscoreRegex.test(example);
    expect(parses).is.true;
    groups = boldItalicUnderscoreRegex.exec(example);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('___Some___');
    expect(remainder).eql(' bold-italic ___text___');
    // Test again on remainder
    groups = boldItalicUnderscoreRegex.exec(remainder);
    expect(groups.length).eql(4);
    [, prelude, match, remainder] = groups;
    expect(match).eql('___text___');
    expect(remainder).eql('');
    // Test again on empty remainder
    groups = boldItalicUnderscoreRegex.exec(remainder);
    expect(groups).is.null;
  });
});

describe('parseMarkdown', () => {
  it('should parse a string without Markdown', () => {
    const examples = [
      'An example string',
      'An example* string',
      'An example_ string',
      'An example** string',
      'An example__ string',
      'An example*** string',
      'An example___ string',
    ];

    examples.forEach((ex) => {
      expect(parseMarkdown(ex)).eql(ex);
    });
  });

  it('should parse a string with simple Markdown', () => {
    const examples = [
      {
        before: 'An *example* string',
        after: 'An <span class="cw-italic">example</span> string',
      },
      {
        before: 'An _example_ string',
        after: 'An <span class="cw-italic">example</span> string',
      },
      {
        before: 'An **example** string',
        after: 'An <span class="cw-bold">example</span> string',
      },
      {
        before: 'An __example__ string',
        after: 'An <span class="cw-bold">example</span> string',
      },
      {
        before: 'An ***example*** string',
        after: 'An <span class="cw-bold cw-italic">example</span> string',
      },
      {
        before: 'An ___example___ string',
        after: 'An <span class="cw-bold cw-italic">example</span> string',
      },
      {
        before: '20. Who should really have written **Diary of a Nobody**?',
        after:
          '20. Who should really have written <span class="cw-bold">Diary of a Nobody</span>?',
      },
      {
        before: '26. Composer of _Semiramide_ and *La Mer*? No',
        after:
          '26. Composer of <span class="cw-italic">Semiramide</span> and <span class="cw-italic">La Mer</span>? No',
      },
    ];

    examples.forEach((ex) => {
      expect(parseMarkdown(ex.before)).eql(ex.after);
    });
  });

  it('should parse a string with embedded Markdown', () => {
    const examples = [
      {
        before: '*An **example** string*',
        after:
          '<span class="cw-italic">An <span class="cw-bold">example</span> string</span>',
      },
      {
        before: '**An *example* string**',
        after:
          '<span class="cw-bold">An <span class="cw-italic">example</span> string</span>',
      },
    ];

    examples.forEach((ex) => {
      expect(parseMarkdown(ex.before)).eql(ex.after);
    });
  });

  it('should parse a string with multiple Markdown', () => {
    const examples = [
      {
        before: '*An* *example* *string',
        after:
          '<span class="cw-italic">An</span> <span class="cw-italic">example</span> *string',
      },
      {
        before: '*An* **example** string',
        after:
          '<span class="cw-italic">An</span> <span class="cw-bold">example</span> string',
      },
      {
        before: '***An*** *example* **string**',
        after:
          '<span class="cw-bold cw-italic">An</span> <span class="cw-italic">example</span> <span class="cw-bold">string</span>',
      },
    ];

    examples.forEach((ex) => {
      expect(parseMarkdown(ex.before)).eql(ex.after);
    });
  });
});
