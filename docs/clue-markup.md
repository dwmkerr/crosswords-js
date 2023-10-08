# Clue markup <!-- omit from toc -->

## Index <!-- omit from toc -->

- [Overview](#overview)
- [Domain](#domain)
- [Requirement](#requirement)
- [Use cases](#use-cases)
- [Design](#design)
  - [Markup conversion](#markup-conversion)
    - [Examples](#examples)

## Overview

This page describes the requirements and design of a feature to enable a limited form of [Markdown][1] for [_ClueText_][3] in a [_CrosswordDefinition_][4]

## Domain

- **Setter**: The person who created the crossword.
- [**Crossword definition**][4]
- [**Clue Segment**][3]
- [**ClueText**][3]: The clue's text, which is the language content of the clue.

## Requirement

From the root `README.md` [TODO list][2]..

```
- [ ] feat: allow italics with underscores, or bold with stars (i.e. very basic markdown)...
```

Web references:

> _"To **italicize** text, add **one** asterisk or underscore before and after a word or phrase. To italicize the middle of a word for emphasis, add one asterisk without spaces around the letters."_ >[www.markdownguide.org][7]

> _"To **bold** text, add **two** asterisks or underscores before and after a word or phrase. To bold the middle of a word for emphasis, add two asterisks without spaces around the letters."_ >[www.markdownguide.org][6]

> "To emphasize text with **bold and italics at the same time**, add **three** asterisks or underscores before and after a word or phrase. To bold and italicize the middle of a word for emphasis, add three asterisks without spaces around the letters."
> [www.markdownguide.org][8]

## Use cases

1. _ClueText_ between paired underscore (`_`) or asterisk (`*`) characters will display as **italic** text in clues in the [CluesView][5] and the _current clue_ in the demo application.

2. _ClueText_ between paired double-underscore (`__`) or double-asterisk (`**`) characters will display as **bold** text in clues in the [CluesView][5] and the _current clue_ in the demo application.

3. _ClueText_ between paired triple-underscore (`___`) or triple-asterisk (`***`) characters will display as **bold and italic** text in clues in the [CluesView][5] and the _current clue_ in the demo application.

## Design

1. Regular expressions will identify occurrences of use cases 1-3. The matching pattern should match **both** instances of the paired marker - to avoid false positives, and be [lazy][9] - to allow for multiple occurrences.
2. Iterate over the use cases in reverse order (3-1) to simplify the regexes.
3. For each case, substitute the markup on test success, and retest until failure before moving on to the next use case. This will cater for multiple occurrences of a pattern.

### Markup conversion

Earlier versions of HTML designated the [`<i>`][10] element to represent _italic_ text and the [`<b>`][11] element to represent **bold** text.

Modern web design dictates that HTML tags impart semantics or meaning, and CSS is used to control presentation or styling.

As such, we should convert our markup character pairs to a [`span`][12] element and use a `class` attribute to refer to a CSS class.

As the intent of the markup in our feature is to literally italicise and embolden text, we shall use the CSS class names '_italic_' and '_bold_' with the '_cw-_' prefix to provide an effective namespace, viz:

- `cw-italic`: italic text
- `cw-bold`: bold text

The CSS names translate to rules for:

- italic: _.cw-italic { [font-style][13]: italic; }_
- bold: _.cw-bold { [font-weight][14]: bold; }_

#### Examples

| "Markdown" text                 | Converted HTML                                                     | CSS                                                                |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `Some _italic_ text.`           | Some `<span class="cw-italic">` italic `</span>` text.             | .cw-italic { font-style: italic; }                                 |
| `Some **bold** text.`           | Some `<span class="cw-bold">` bold `</span>` text.                 | .cw-bold { font-weight: bold; }                                    |
| `Some ___bold, italic___ text.` | Some `<span class="cw-bold cw-italic">`bold, italic`</span>` text. | .cw-bold { font-weight: bold; } .cw-italic { font-style: italic; } |

[1]: https://www.markdownguide.org/
[2]: ../README.md#todo
[3]: ./crossword-domain.md#clue-segment
[4]: ./crossword-domain.md#crossword-definition
[5]: ./module-api.md#cluesview
[6]: https://www.markdownguide.org/basic-syntax/#bold
[7]: https://www.markdownguide.org/basic-syntax/#italic
[8]: https://www.markdownguide.org/basic-syntax/#bold-and-italic
[9]: https://stackoverflow.com/a/2301298/1090683
[10]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i
[11]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/b
[12]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span
[13]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
[14]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
