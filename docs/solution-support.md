# Solution support <!-- omit from toc -->

## Index <!-- omit from toc -->

- [Overview](#overview)
- [Domain](#domain)
- [Use cases](#use-cases)
  - [Checking of solutions](#checking-of-solutions)
  - [Revelation of solutions](#revelation-of-solutions)
  - [Resetting of clues](#resetting-of-clues)
- [Design](#design)
  - [1. Crossword definition extension](#1-crossword-definition-extension)
  - [2. Solution definition](#2-solution-definition)
- [Implementation](#implementation)

## Overview

This page describes the requirements and design of features to leverage a supplied **crossword solution** for a [**crossword definition**][1].

## Domain

- **Solver**: The person solving the crossword.
- **Setter**: The person who created the crossword.
- **Answer**: A solver's response for a clue.
- **Solution**: The setter's solution for a clue.
- **Revealed**: The revealed letters of a solution.

## Use cases

1. Check an entire crossword.
2. Check an answer.
3. Reveal all solutions for a crossword.
4. Reveal a solution for a clue.
5. Reveal a solution letter in an answer.
6. Reset an answer.
7. Reset an entire crossword.

### Checking of solutions

Typically, incorrect clues or letters are indicated in the crossword grid.

To support this, we need to track both the solver's answer and the setters solution for each clue.

### Revelation of solutions

Typically, revealed clues or letters are indicated in the crossword grid.

To support this, we need to track the revealed clues and letters.

This could be stored in each cell in the crossword grid. However, this data is not persisted and will be lost if the user session is terminated.

### Resetting of clues

To support this, we need to be able to clear the solver's answer(s) and clear any markers and data for incorrect letters and clues. We need to consider whether revealed makers and data are cleared when a clue or the whole crossword is reset.

## Design

The format and description of the _crossword definition_ is covered [here][1].

I see two approaches to support the _crossword solution_ data, both of which could be supported:

### 1. Crossword definition extension

An extension of the JSON _crossword definition_ to include:

- _Solution_ as an additional property of each _clue_.
- _Answer_ as an additional property of each _clue_.
- _Revealed_ as an additional property of each _clue_.

### 2. Solution definition

A separate data object containing a mapping of _clue identifiers_ to associated _solutions_.

The _solution definition_ should be described in JSON in the first instance - for consistency with the _crossword definition_.

The _solution definition_ should:

- contain a mapping of _clue identifiers_ to associated _solutions_.
- unambiguously identify the associated _crossword definition_.

Currently the _crossword definition_ contains an optional `info` block. The `info.source` property is a URL which defines the location of the crossword. This property could be duplicated in the _solution definition_.

## Implementation

We have proceeded with design option 1, being the simpler of the two approaches to implement, easier to validate, and less prone to setter errors.

[1]: ./crossword-domain.md#crossword-definition
