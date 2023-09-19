# Solution support <!-- omit from toc -->

## Index <!-- omit from toc -->

- [Overview](#overview)
- [Domain](#domain)
- [Use cases](#use-cases)
- [Design](#design)
  - [1. Crossword definition extension](#1-crossword-definition-extension)
  - [2. Solution definition](#2-solution-definition)
  - [Revelation of solutions](#revelation-of-solutions)

## Overview

This page describes the requirements and design of features to leverage a supplied **crossword solution** for a [**crossword definition**][1].

## Domain

- **Punter**: The person solving the crossword.
- **Setter**: The person who created the crossword.
- **Answer**: A punter's response for a clue.
- **Solution**: The setter's solution for a clue.

## Use cases

1. Check an entire crossword.
2. Check an answer.
3. Reveal all solutions for a crossword.
4. Reveal a solution for a clue.
5. Reveal a solution letter in an answer.
6. Reset an answer.
7. Reset an entire crossword.

## Design

The format and description of the _crossword definition_ is covered [here][1].

I see two approaches to support the _crossword solution_ data, both of which could be supported:

### 1. Crossword definition extension

An extension of the JSON _crossword definition_ to include the _solution_ as an additional property of each _clue_.

### 2. Solution definition

A separate data object containing a mapping of _clue identifiers_ to associated _solutions_.

The _solution definition_ should be described in JSON in the first instance - for consistency with the _crossword definition_.

The _solution definition_ should:

- contain a mapping of _clue identifiers_ to associated _solutions_.
- unambiguously identify the associated _crossword definition_.

Currently the _crossword definition_ contains an optional `info` block. The `info.source` property is a URL which defines the location of the crossword. This property could be duplicated in the _solution definition_.

### Revelation of solutions

Typically, revealed clues or letters are indicated in the crossword grid.

To support this, we need to track the revealed clues and letters.

This could be stored in each cell in the crossword grid. However, this data is not persisted and will be lost if the user session is terminated.

[1]: ./crossword-definition.md
