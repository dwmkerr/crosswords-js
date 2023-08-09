# Crossword Styling <!-- omit from toc -->

## Index <!-- omit from toc -->

- [Overview](#overview)
- [Suggested configuration](#suggested-configuration)
- [References](#references)
  - [Crossword grid](#crossword-grid)
  - [Crossword clues](#crossword-clues)
  - [Reset stylesheets](#reset-stylesheets)

## Overview

- The stylesheets for the **crosswords-js** module are located in the [`style`][8] directory
- The stylesheets are mostly written in [Less][5], which is a [CSS][6] preprocessor.
- The _Less_ source code is converted to _CSS_ automatically by the [ViteJS][7] bundler.

The styles are spread across four files:

- [`style/reset.css`][9]
  - This is a [third-party][15] stylesheet designed to reset any default styles set by browsers. Applying these styles gives us a blank canvas to build a consistent look and feel across all modern browsers.
- [`style/crosswords.less`][10]
  - This is the main stylesheet for the module. The focus of this sheet is the layout of the _grid_ ( `.crossword-grid` ) and _clues_ ( `.crossword-clues` ) elements. The listed fonts and colours are parameterised and can be modified by _locally_ overriding the _default_ values in the next two files.
  - Note that we are employing [**responsive design**][14], so some styles are defined in multiple `@media` queries.
- [`style/cwdimensions.less`][11]
  - This stylesheet defines the default values for the font sizes and dimensions of the crossword elements, including the grid dimensions (default of 15x15).
  - Most dimensions are expressed in `rem` which is proportional to the `font-size` set for the root `html` element on your web page. Typically, that size is `16px`.
  - _Imported by [`style/crosswords.less`][10]_
- [`style/cwcolors.less`][12]
  - This stylesheet contains the default values for the colours of the crossword elements.
  - _Imported by [`style/crosswords.less`][10]_

## Suggested configuration

- Code your preferred fonts and colours in your _project_ stylesheet below the `import` statements for [`reset.css`][9] and [`crosswords.less`][10] to override the defaults.
- Refer to [`dev/index.less`][13] for an example.

## References

### Crossword grid

- [CSS Grid][1]
- [**CSS Tricks** reference poster][3]

### Crossword clues

- [CSS Flexbox][2]
- [**CSS Tricks** reference Poster][4]

### Reset stylesheets

- [Eric Meyer's CSS Reset][15]
- [CSS:resetr - CSS Reset Library][16]

[1]: https://css-tricks.com/snippets/css/complete-guide-grid/
[2]: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
[3]: ./img/css-grid-poster.png
[4]: ./img/css-flexbox-poster.png
[5]: https://lesscss.org/
[6]: https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/What_is_CSS
[7]: ./vite.md
[8]: ../style/
[9]: ../style/reset.css
[10]: ../style/crosswords.less
[11]: ../style/cwdimensions.less
[12]: ../style/cwcolors.less
[13]: ../dev/index.less
[14]: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
[15]: http://meyerweb.com/eric/tools/css/reset/
[16]: https://perishablepress.com/cssresetr/
