# HTML Templates <!-- omit from toc -->

## Index <!-- omit from toc -->

- [Overview](#overview)
- [References](#references)

## Overview

We are using a templating engine to simplify and automate the generation of HTML for the information contained in the [crossword definition][4] file.

This comprises the metadata stored in the `info` block, and the clue descriptions in `acrossClues` and `downClues`.

[Pug][2] is a popular and mature HTML templating engine for NodeJS projects.

Pug is integrated into our build pipeline via the [vite-plugin-pug][1] package.

Extensive reference documentation is available on the [Pug project site][3].

## References

- [Introduction to Pug][2]
- [Pug reference][3]
- [Build pipeline plugin][1]

[1]: https://www.npmjs.com/package/vite-plugin-pug
[2]: https://www.sitepoint.com/a-beginners-guide-to-pug/
[3]: https://pugjs.org/api/getting-started.html
[4]: ./crossworddefinition.md
