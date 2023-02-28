# CrosswordsJS <!-- omit from toc -->

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors][1]][2]

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![Release Please][3]][4]
[![NPM Package Version][5]][6]
[![codecov][7]][8]

> **IMPORTANT**: This is work in progress! The API may change dramatically as I work out what is most suitable.

Tiny, lightweight crossword for control for the web. **Crosswords.js** is:

- Lightweight
- Fast
- Simple
- Framework Free

Inspired by the excellent free online crosswords on [The Guardian Crosswords][18].

Demo: [dwmkerr.github.io/crosswords-js/][9]

<a href="https://dwmkerr.github.io/crosswords-js/"><img src="./docs/screenshot.png" alt="CrosswordsJS Screenshot" width="480px" /></a>

## Index <!-- omit from toc -->

<!-- vim-markdown-toc GFM -->

- [Quickstart](#quickstart)
- [Developer Guide](#developer-guide)
- [Keyboard Functionality](#keyboard-functionality)
- [Crossword Definition Tips](#crossword-definition-tips)
- [Design Goals](#design-goals)
- [Build Pipelines](#build-pipelines)
  - [Pull Request Pipeline](#pull-request-pipeline)
  - [Release Pipeline](#release-pipeline)
- [Adding Contributors](#adding-contributors)
- [Managing Releases](#managing-releases)
- [Contributors](#contributors)
- [TODO](#todo)

<!-- vim-markdown-toc -->

## Quickstart

Install:

```bash
npm install crosswords-js
```

Include the JavaScript and CSS:

```html
<link href="node_modules/crosswords-js/dist/crosswords.css" rel="stylesheet" />
<script src="node_modules/crosswords-js/dist/crosswords.js"></script>
```

To create a crossword, you start with a _Crossword Definition_, which is a simple JSON representation of a crossword:

```json
{
  "width": 15,
  "height": 15,
  "acrossClues": [
    {
      "x": 2,
      "y": 1,
      "clue": "1. Conspicuous influence exerted by active troops (8,5)"
    },
    {
      "x": 1,
      "y": 3,
      "clue": "10. A coy sort of miss pointlessly promoting lawlessness (9)"
    }
  ]
}
```

This definition needs to be compiled into a _Crossword Model_. The model is a two dimensional array of cells. This model is used as the input to create the DOM. Compiling the model validates it, making sure that there are no incongruities in the structure (such as overlapping clues, clues which don't fit in the bounds and so on):

```js
//  Load the crosswords.js API and the crossword definition.
const CrosswordsJS = require('crosswords-js');
const crosswordDefintion = require('./my-crossword.json');

//  Compile the crossword.
try {
  const crosswordModel = CrosswordsJS.compileCrossword(crosswordDefinition);
} catch (err) {
  console.log(`Error compiling crossword: ${err}`);
}
```

The model can be used to build the DOM for a crossword:

```js
//  Build the crossword HTML, as a child of the document body element.
var crosswordDom = new CrosswordsJS.CrosswordsDOM(
  crosswordModel,
  document.body
);
```

## Developer Guide

Ensure you are using Node LTS. I recommend using [Node Version Manager][10] for this:

```bash
nvm install --lts --latest-npm
nvm use --lts
```

Check out the code, then, from the root directory, run:

```bash
# Fetch all dependent packages
npm install
# Start the sample app
npm start
```

The sample will run at the address [localhost:8080][11].

Run the tests with:

```bash
npm test
```

Linting is provided by `eslint`, which is configured to use `prettier`:

```bash
# Lint the code, or lint and fix.
npm run lint
npm run lint:fix
```

Documentation and HTML can be checked for standard conformance using `prettier`:

```bash
# Check html and docs for correctness, or check and fix.
npm run prettier
npm run prettier:fix
```

To automate all these checks on each commit to your local git repository, create a `pre-commit` hook in your repository:

```bash
# From the root directory of the package...
cat << EOF > .git/hooks/pre-commit
#!/bin/sh
npm run prettier:fix && \\
npm run lint:fix && \\
npm test
EOF
chmod u+x .git/hooks/pre-commit
```

## Keyboard Functionality

- Left/Right/Up/Down: Move (if possible) to the cell in the direction specified.
- Space: Move to the next cell in the focused clue, if one exists.
- Backspace: Move to the previous cell in the focused clue, if one exists.
- Tab: Move to the first cell of the next clue, 'wrapping' to the first clue.
- A-Z: Enter the character. Not locale aware!
- Enter: Switch between across and down.

## Crossword Definition Tips

**How do I create a clue which spans multiple parts of a crossword?**

This is a little fiddly. I have tried to ensure the syntax is as close to what a reader would see in a printed crossword to make this as clear as possible. Here is an example:

```json
{
  "downClues": [{
    "x": 6, "y": 1
    "clue": "4,21. The king of 7, this general axed threat strategically (9)"
  }],
  "acrossClues": [{
    "x": 1, "y": 11,
    "clue": "21 See 4 (3,5)"
  }]
}
```

Note that the _answer structure_ (which would be `(9,3,5)` in a linear clue) has separated. However, the crossword will render the full answer structure for the first clue (and nothing for the others).

An example of a crossword with many non-linear clues is at: https://www.theguardian.com/crosswords/cryptic/28038 - I have used this crossword for testing (but not included the definition in the codebase as I don't have permissions to distribute it).

## Design Goals

This project is currently a work in progress. The overall design goals are:

1. This should be _agnostic_ to the type of crossword. It shouldn't depend on any proprietary formats or structures used by specific publications.
2. This should be _accessible_, and show how to make interactive content which is inclusive and supports modern accessibility patterns.
3. This project should be _simple to use_, without requiring a lot of third party dependencies or knowledge.

## Build Pipelines

There are two pipelines that run for the project:

### Pull Request Pipeline

Whenever a pull request is raised, the [Pull Request Workflow][12] is run. This will:

- Install dependencies
- Lint
- Run Tests
- Upload Coverage

Each stage is run on all recent Node versions, except for the 'upload coverage' stage which only runs for the Node.js LTS version. When a pull request is merged to the `main` branch, if the changes trigger a new release, then [Release Please][13] will open a Release Pull Request. When this request is merged, the [Release Pipeline][14] is run.

### Release Pipeline

When a [Release Please][15] pull request is merged to main, the [Release Please Workflow][16] is run. This will:

- Install dependencies
- Lint
- Run Tests
- Upload Coverage
- Deploy to NPM if the `NPM_TOKEN` secret is set

Each stage is run on all recent Node versions, except for the 'upload coverage' stage which only runs for the Node.js LTS version.

⚠️ note that the NPM Publish step sets the package to public - don't forget to change this if you have a private module.

## Adding Contributors

To add contributors, use a comment like the below in any pull request:

```
@all-contributors please add @<username> for docs, code, tests
```

More detailed documentation is available at:

[allcontributors.org/docs/en/bot/usage][17]

## Managing Releases

When changes to `main` are made, the Release Please stage of the pipeline will work out whether a new release should be generated (by checking if there are user facing changes) and also what the new version number should be (by checking the log of conventional commits). Once this is done, if a release is required, a new pull request is opened that will create the release.

Force a specific release version with this command:

```bash
version="0.1.0"
git commit --allow-empty -m "chore: release ${version}" -m "Release-As: ${version}"
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.dwmkerr.com"><img src="https://avatars.githubusercontent.com/u/1926984?v=4?s=100" width="100px;" alt="Dave Kerr"/><br /><sub><b>Dave Kerr</b></sub></a><br /><a href="https://github.com/dwmkerr/crosswords-js/commits?author=dwmkerr" title="Documentation">📖</a> <a href="https://github.com/dwmkerr/crosswords-js/commits?author=dwmkerr" title="Code">💻</a> <a href="https://github.com/dwmkerr/crosswords-js/commits?author=dwmkerr" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pvspain"><img src="https://avatars.githubusercontent.com/u/716363?v=4?s=100" width="100px;" alt="Paul Spain"/><br /><sub><b>Paul Spain</b></sub></a><br /><a href="https://github.com/dwmkerr/crosswords-js/commits?author=pvspain" title="Documentation">📖</a> <a href="https://github.com/dwmkerr/crosswords-js/commits?author=pvspain" title="Code">💻</a> <a href="https://github.com/dwmkerr/crosswords-js/commits?author=pvspain" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## TODO

This is a scattergun list of things to work on, once a good chunk of these have been done the larger bits can be moved to GitHub Issues:

- [x] bug: backspace moves backwards, I think that deleting the letter is a better action for this (with left/up/ key to move backwards)
- [ ] bug: Demo site (https://dwmkerr.github.io/crosswords-js/) is not tracking latest version
- [ ] feat(docs): improve the demo site image (its an old one at the moment!)
- [ ] feat(samples): show how we can check answers or highlight incorrect entries (see issue #9)
- [ ] feat(samples): allow us to switch between 2-3 crosswords on the sample
- [ ] feat(samples): cursor initially on the first clue
- [ ] feat(dom): support a keyboard scheme or configurable keybindings so that keys for navigating / editing the crossword can be specified in config (allowing for schemes such as 'the guardian' or 'the age'
- [x] fix: the border on word separators slightly offsets the rendering of the grid
- [ ] feat(accessibility): get screenreader requirements
- [ ] refactor: Simplify the static site by removing Angular and Bootstrap, keeping everything as lean and clean as possible. Later, replace with a React sample? OR have multiple samples, one for each common framework?
- [ ] refactor: finish refactoring classes to simple functions (compileCrossword, createDOM etc)
- [x] feat: support clues which span non-contiguous ranges (such as large clues with go both across and down).
- [ ] feat: simplify the crossword model by using `a` or `d` for `across` or `down` in the clue text (meaning we don't have to have two arrays of clues)
- [ ] feat: allow italics with underscores, or bold with stars (i.e. very basic markdown)...
- [ ] feat: clicking the first letter of a clue which is part of another clue should allow for a toggle between directions
- [ ] todo: document the clue structure
- [ ] refactor: re-theme site to a clean black and white serif style, more like a newspaper
- [x] build: enforce linting (current it is allowed to fail)

[1]: https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square
[2]: #contributors-
[3]: https://github.com/dwmkerr/crosswords-js/actions/workflows/release-please.yml/badge.svg
[4]: https://github.com/dwmkerr/crosswords-js/actions/workflows/release-please.yaml
[5]: https://img.shields.io/npm/v/crosswords-js
[6]: https://www.npmjs.com/package/crosswords-js
[7]: https://codecov.io/gh/dwmkerr/crosswords-js/branch/main/graph/badge.svg
[8]: https://codecov.io/gh/dwmkerr/crosswords-js
[9]: https://dwmkerr.github.io/crosswords-js/
[10]: https://github.com/nvm-sh/nvm
[11]: http://localhost:3000/
[12]: ./.github/workflows/pull-request.yaml
[13]: https://github.com/google-github-actions/release-please-action
[14]: #release-pipeline
[15]: https://github.com/google-github-actions/release-please-action
[16]: ./.github/workflows/release-please
[17]: https://allcontributors.org/docs/en/bot/usage
[18]: https://www.theguardian.com/crosswords
