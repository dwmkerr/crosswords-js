import { trace } from './helpers.mjs';

const cluePattern = 'LabelText.ClueText(LengthText)';

// Parse the groups: /^\s*LabelText\.ClueText\(LengthText\)\s*$/
// 'LabelText' is all characters from start up to but excluding the first period '.'.
// Leading whitespace is ignored.
// 'ClueText' is all characters after the first period up to but excluding the last
// the last opening parenthesis '('
// 'LengthText' is all characters after the last opening parenthesis up to but excluding
// the last subsequent closing parenthesis ')'. Trailing whitespace is allowed.
const clueRegex = /^\s*(.*?)\.(.*)\((.*)\)\s*$/;
// Parse 'labelText' into 1+ clue segment labels: 1+ digits,
// optionally followed by an 'a' or a 'd'.
// The labels are separated by any sequence of 1+ non-alphanumeric
// characters.
const labelPartsRegex = /^([^bce-z]*?)(\d+[ad]?)\s*(.*)/;
// Parse 'clueText' from all leading and trailing whitespace
const clueTextRegex = /^\s*(.*?)\s*$/;
// Parse 'lengthText' into 1+ whole-numbers.
// The lengths are separated by any sequence of 1+ non-alphanumeric
// characters, excluding parentheses.
// Special case: acronyms
// Acronym letters can including a trailing period for the last letter.
// An example is clue 9a, The Age - Cryptic 08/09/2023
// For example 'BBQ' -> (1.1.1.)
const lengthPartsRegex = /^([^a-z()\d]*?)(\d+)[\s.]*(.*)/;

// Refer to design document: ../docs/clue-markup.md

// Clue markdown regular expressions
const boldAsteriskRegex = /(.*?)(\*\*.+?\*\*)(.*)$/;
const boldItalicAsteriskRegex = /(.*?)(\*\*\*.+?\*\*\*)(.*)$/;
const italicAsteriskRegex = /(.*?)(\*[^*]+?\*)(.*)$/;
const boldUnderscoreRegex = /(.*?)(__.+?__)(.*)$/;
const boldItalicUnderscoreRegex = /(.*?)(___.+?___)(.*)$/;
const italicUnderscoreRegex = /(.*?)(_[^_]+?_)(.*)$/;

// Order is significant - decreasing markdown sequence length
// Do NOT change!
const markdownTransforms = [
  {
    tag: '***',
    regex: boldItalicAsteriskRegex,
    html: { open: '<span class="cw-bold cw-italic">', close: '</span>' },
  },
  {
    tag: '___',
    regex: boldItalicUnderscoreRegex,
    html: { open: '<span class="cw-bold cw-italic">', close: '</span>' },
  },
  {
    tag: '**',
    regex: boldAsteriskRegex,
    html: { open: '<span class="cw-bold">', close: '</span>' },
  },
  {
    tag: '__',
    regex: boldUnderscoreRegex,
    html: { open: '<span class="cw-bold">', close: '</span>' },
  },
  {
    tag: '*',
    regex: italicAsteriskRegex,
    html: { open: '<span class="cw-italic">', close: '</span>' },
  },
  {
    tag: '_',
    regex: italicUnderscoreRegex,
    html: { open: '<span class="cw-italic">', close: '</span>' },
  },
];

/**
 *  Convert any markdown in _text_ to HTML.
 * @param {*} text source string with Markdown, or not!
 * @returns converted string
 */
function parseMarkdown(text) {
  // Initialise return value
  let result = text;

  // Iterate through all transforms, modifying result for all matches
  markdownTransforms.forEach((mt) => {
    let prelude,
      match,
      // Initialise remainder with converted 'text' to date
      remainder = result;

    // Test for transform match
    if (mt.regex.test(remainder)) {
      // Extract matching groups in regex from 'remainder'
      let groups = mt.regex.exec(remainder);
      // Reset result
      result = '';
      while (groups?.length === 4) {
        [, prelude, match, remainder] = groups;
        // Replace opening tag
        match = match.replace(mt.tag, mt.html.open);
        // Replace closing tag
        match = match.replace(mt.tag, mt.html.close);
        // Append processed text to result
        result += prelude + match;
        groups = mt.regex.exec(remainder);
      }
      // Append any remainder after matches exhausted
      result += remainder;
    }
  });

  return result;
}

//  Helper for newClueModel()
function validateClueStructure(cdClue) {
  const required = { x: 1, y: 1, clue: '1. Clue (1)' };
  const optional = { answer: '', solution: '', revealed: '' };
  const requiredKeys = Object.keys(required);
  const optionalKeys = Object.keys(optional);
  const cdKeys = Object.keys(cdClue);

  // Test for presence of required keys
  for (const rk of requiredKeys) {
    if (!cdKeys.includes(rk)) throw new Error(`'cdClue.${rk}' is missing`);
  }

  // Test for type of required keys
  for (const rk of requiredKeys) {
    if (typeof required[rk] != typeof cdClue[rk]) {
      throw new Error(
        `'cdClue.${rk} (${cdClue[rk]})' must be a ${typeof required[rk]}`,
      );
    }
  }

  // Test for presence and type of optional keys
  for (const ok of optionalKeys) {
    if (cdKeys.includes(ok) && typeof optional[ok] != typeof cdClue[ok])
      throw new Error(
        `'cdClue.${ok} (${cdClue[ok]})' must be a ${typeof optional[ok]}`,
      );
  }

  // Test for additional properties in cdClue

  const difference = new Set(cdKeys);
  for (const rk of requiredKeys) {
    difference.delete(rk);
  }
  for (const ok of optionalKeys) {
    difference.delete(ok);
  }

  if (difference.size > 0) {
    throw new Error(
      `'cdClue' has unexpected properties <${[...difference].join(',')}>`,
    );
  }

  // Test if clue text matches expected pattern
  if (!clueRegex.test(cdClue.clue)) {
    throw new Error(
      `Clue '${cdClue.clue}' does not match the required pattern '${cluePattern}'`,
    );
  }
}

//  Helper for newClueModel()
function validateClueModelArguments(cdClue, isAcrossClue) {
  if (cdClue === undefined || isAcrossClue === undefined) {
    throw new Error("'cdClue' and 'isAcrossClue' are required");
  }

  if (cdClue === null) {
    throw new Error("'cdClue' can't be null");
  }

  if (isAcrossClue === null) {
    throw new Error("'isAcrossClue' can't be null");
  }

  if (typeof isAcrossClue != 'boolean') {
    throw new Error("'isAcrossClue' must be a boolean (true,false)");
  }
}

// Helper for newClueModel()
function buildClueSegmentLabels(clueLabelText, cdClue) {
  // Ensure any clue id values use lower case for the trailing 'a' or 'd'.
  let remainingText = clueLabelText.toLowerCase();
  let clueSegmentLabels = [];
  while (labelPartsRegex.test(remainingText)) {
    // Discard separator between segmentLabel and residual - see labelPartsRegex comments.
    const [, , segmentLabel, residual] = labelPartsRegex.exec(remainingText);
    clueSegmentLabels.push(segmentLabel);
    remainingText = residual;
  }

  // remainingText should be an empty string ('')
  if (remainingText) {
    throw new Error(
      `'${cdClue.clue}' Error in <LabelText> near <${remainingText}>`,
    );
  }
  return clueSegmentLabels;
}

// Helper for newClueModel()
function buildTailDescriptors(clueSegmentLabels) {
  // Nested helper
  function directionFromClueSegmentLabel(clueSegmentLabel) {
    if (clueSegmentLabel.endsWith('a')) {
      return 'across';
    } else if (clueSegmentLabel.endsWith('d')) {
      return 'down';
    } else {
      return null;
    }
  }

  // Copy clueSegmentLabels and remove head/first segment
  let tailSegmentLabels = clueSegmentLabels.slice(1);
  let tailDescriptors = [];

  // build tailDescriptors for multi-segment clue
  if (tailSegmentLabels.length > 0) {
    tailDescriptors = tailSegmentLabels.map((cs) => ({
      headNumber: parseInt(cs, 10),
      direction: directionFromClueSegmentLabel(cs),
    }));
  }
  return tailDescriptors;
}

// Helper for newClueModel()
function buildWordLengths(lengthParts, cdClue) {
  let wordLengths = [];
  let remainingText = lengthParts;

  while (lengthPartsRegex.test(remainingText)) {
    const [, , length, residual] = lengthPartsRegex.exec(remainingText);
    wordLengths.push(parseInt(length, 10));
    remainingText = residual;
  }

  // remainingText should be an empty string
  if (remainingText) {
    throw new Error(
      `'${cdClue.clue}' Error in <LengthText> near <${remainingText}>`,
    );
  }
  return wordLengths;
}

// Helper for newClueModel()
const getClueId = (headSegmentLabel, isAcrossClue) => {
  // clueId is headNumber followed by direction suffix ('a' or 'd')...
  // Check last character of headSegmentLabel and append if required
  const directionSuffix = (isAcross) => {
    return isAcross ? 'a' : 'd';
  };
  const directionSuffixRegex = /[ad]$/;
  return directionSuffixRegex.test(headSegmentLabel)
    ? headSegmentLabel
    : headSegmentLabel + directionSuffix(isAcrossClue);
};

/**
 * Create a clue model from a clue read from a
 * _CrosswordDefinition_ [JSON](https://en.wikipedia.org/wiki/JSON) document.
 * @param cdClue - an object which defines the clue, with properties:
 * x: the zero-based grid column index of the starting letter of the clue
 * y: the zero-based grid row index of the starting letter of the clue
 * clue: the clue description string which has the format:
 *   "<Number Structure>.<Clue>(<Answer Structure>)"
 * @param isAcrossClue - a boolean indicating the clue orientation
 * @returns - the clue model for the given definition
 */
function newClueModel(cdClue, isAcrossClue) {
  // Test for null or undefined argument
  validateClueModelArguments(cdClue, isAcrossClue);
  // Test the properties and types of the cdClue argument
  validateClueStructure(cdClue);

  // Initialise array of crossword grid cell elements associated with
  // clue - populated as part of crossword DOM
  const cells = [];

  //// Extract simple properties

  const x = cdClue.x - 1; //  Clue labels are 1 based, clue models are more useful 0 based.
  const y = cdClue.y - 1;
  const isAcross = isAcrossClue;
  // Initialise setter's solution for clue
  const solution = cdClue.solution
    ? // Strip out everything from solution except alphabetical characters
      // DO NOT substitute spaces
      cdClue.solution.toUpperCase().replaceAll(/[^A-Z]/g, '')
    : undefined;
  // Initialise revealed letters for clue
  const revealed = cdClue.revealed
    ? // string of upper-cased revealed characters
      cdClue.revealed.toUpperCase()
    : undefined;

  //  Extract the clue components from the clue text in the crosswordDefinition
  const [, labelParts, clueGroup, lengthParts] = clueRegex.exec(cdClue.clue);

  //// Parse labelParts

  const clueSegmentLabels = buildClueSegmentLabels(labelParts, cdClue);
  const tailDescriptors = buildTailDescriptors(clueSegmentLabels);
  //  headSegmentLabel is first of clueSegmentLabels
  const [headSegmentLabel] = clueSegmentLabels;
  const headNumber = parseInt(headSegmentLabel, 10);
  const labelText = headNumber.toString();
  const clueId = getClueId(headSegmentLabel, isAcross);

  //// Parse clueGroup

  const [, rawClueText] = clueTextRegex.exec(clueGroup);
  const clueText = parseMarkdown(rawClueText);

  //// Parse lengthParts

  const lengthText = `(${lengthParts})`;
  const wordLengths = buildWordLengths(lengthParts, cdClue);
  //  Calculate the total length of the clue segment.
  // Sum the lengths of the clue words
  const segmentLength = wordLengths.reduce((current, wd) => current + wd, 0);

  //// Initialise punter's answer for clue

  const answer = cdClue.answer
    ? cdClue.answer
        // convert to uppercase
        .toUpperCase()
        // replace illegal characters with spaces
        .replaceAll(/[^ A-Z]/g, ' ')
        // pad out if required
        .padEnd(segmentLength)
    : // pad out null or undefined answer with spaces
      ''.padEnd(segmentLength);

  // Test if clue solution length matches segmentLength
  if (solution && solution.length !== segmentLength) {
    throw new Error(
      `Length of clue solution '${solution}' does not match the lengthText '${lengthText}'`,
    );
  }

  // Test if clue revealed length matches segmentLength
  if (revealed && revealed.length !== segmentLength) {
    throw new Error(
      `Length of clue revealed characters '${revealed}' does not match the lengthText: ${segmentLength}`,
    );
  }

  // Combine elements into object and exit
  return {
    answer,
    cells,
    clueId,
    clueText,
    headNumber,
    isAcross,
    labelText,
    lengthText,
    revealed,
    segmentLength,
    solution,
    tailDescriptors,
    wordLengths,
    x,
    y,
    toString: () => {
      return `${clueId}`;
    },
  };
}

export {
  boldAsteriskRegex,
  boldItalicAsteriskRegex,
  boldItalicUnderscoreRegex,
  boldUnderscoreRegex,
  cluePattern,
  clueRegex,
  clueTextRegex,
  italicAsteriskRegex,
  italicUnderscoreRegex,
  labelPartsRegex,
  lengthPartsRegex,
  newClueModel,
  parseMarkdown,
};
