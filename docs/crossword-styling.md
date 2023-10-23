# Crossword Styling <!-- omit from toc -->

## Index <!-- omit from toc -->

- [Overview](#overview)
- [Internals](#internals)
- [Suggested configuration](#suggested-configuration)
- [References](#references)
  - [Crossword grid](#crossword-grid)
  - [Crossword clues](#crossword-clues)
  - ['Reset' stylesheets](#reset-stylesheets)

## Overview

The library ships with some simple default styles out of the box, under [`./dist/crosswords.css`][19], which can be applied in the normal way (e.g. `import 'crosswords-js/dist/crosswords.css'`, if your bundler has a CSS file loader). The styles use [CSS variables][17] to set styles. Some of these variables can be overridden to customise the look and feel of the crosswords on your web page. Refer to [`./style/cwdimensions.less`][11] to see variables related to UI sizing and dimensions, at various breakpoints (screen widths). See [`./style/cwcolors.less`][12] for variables related to colors (highlight/active/grid colors, etc.).

The crossword uses [CSS grid][1] to arrange the cells, so the styles that we recommend you do _not_ modify are the properties related to that. That is, the `grid-template-rows` and `grid-template-columns` properties, as well as the CSS variables `--row-count` and `--column-count` which are set directly from JavaScript. Changing them can break the visual layout of the crossword.

A goal of this library is to allow users to style their crosswords easily, while providing sensible defaults - but if the styles shipped by this library prove difficult to override in some areas (for example, if you find yourself having to override one thing in several places, or use `!important`), please [raise an issue][20].

## Internals

- The stylesheets for the **crosswords-js** module are located in the [`style`][8] directory
- The stylesheets are mostly written in [Less][5], which is a [CSS][6] preprocessor.
- The _Less_ source code is converted to _CSS_ automatically by the [ViteJS][7] bundler for the demo app, and using [lessc via the command-line][18] for npm distribution.

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

- Code your preferred fonts and colours in your _project_ stylesheet below the `import` statements for [`reset.css`][9] and [`dist/crosswords.css`][19] to override the defaults.
- Refer to [`dev/index.less`][13] for an example.

## References

### Crossword grid

- [CSS Grid][1]
- [**CSS Tricks** reference poster][3]

### Crossword clues

- [CSS Flexbox][2]
- [**CSS Tricks** reference Poster][4]

### 'Reset' stylesheets

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
[17]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
[18]: https://lesscss.org/usage/#command-line-usage
[19]: ../dist/crosswords.css
[20]: https://github.com/dwmkerr/crosswords-js/issues
