# Ipuz  <!-- omit from toc -->


## Index  <!-- omit from toc -->

- [Introduction](#introduction)
- [Usage](#usage)
- [Specification](#specification)
- [Samples](#samples)
- [Software](#software)
- [Observations](#observations)


## Introduction

**ipuz** is a file format popular across the Internet. It describes multiple puzzle formats, including crosswords, sudoku and acrostics. 

**ipuz** is a trademark of [Puzzazz][4], Inc.

## Usage

_ipuz_ is used as the submission format for crosswords for _The Age_ and _Sydney Morning Herald_ daily newspapers in Australia.

The [Puzzazz][4] application apparently has an interface to New York Times crosswords for NYT subscribers, so _ipuz_ may also be used there.  

The commerical crossword setting software [Crossword Compiler][8] lists _ipuz_ among its supported formats.

## Specification

The canonical location of the format is [ipuz.org][2]. I have been trying to connect to this site for a couple of days and getting active disconnects. 

The DNS A record for  `ipuz.org`:
```
ipuz.org.               3600    IN      A       162.255.119.254
```
Ipuz files are formatted in JSON.

The most informative site is the [justsolve archive][3] which states:

> ipuz is intended as an openly-documented format for data files of puzzles such as crosswords and sudoku. In contrast to "proprietary" formats such as PUZ, there is an official spec available freely and released under a Creative Commons license (BY-ND 3.0), instead of the format having to be discovered by reverse engineering subject to possible hassles by intellectual-property owners. It was created and released by the puzzle technology company Puzzazz, which was the first company to use it.

## Samples

We have two _ipuz_ samples in the `data` directory, [here][5] and [there][6]. The links are to YAML conversions of the original JSON-formatted code - for ease of human reading!

## Software

There is a Python library, [ipuz][1], for reading and writing puzzles in _ipuz_ format. It holds more information about the structure and versions (v1 and v2) of _ipuz_. 

## Observations

After a quick inspection, the _ipuz_ format has some similarities to the _puz_ [format][7].

The Python [library][1] could serve as a basis for a JavaScript converter if we wish to load _ipuz_ files directly from the browser UI.

[1]: https://pypi.org/project/ipuz/
[2]: http://www.ipuz.org/
[3]: http://justsolve.archiveteam.org/wiki/IPUZ
[4]: http://www.puzzazz.com/
[5]: ../../data/WK36-05-09-2023-LR-325C.ipuz.yml
[6]: ../../data/WK36-05-09-2023-LR-325Q.ipuz.yml
[7]: ./puz.md
[8]: https://www.crossword-compiler.com/