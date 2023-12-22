#! /usr/bin/env bash

base=dev/dist
# Website base directory: https://dwmkerr.github.io/crosswords-js/
siteBase=/crosswords-js/
# Local base for website artifacts
localBase=$base$siteBase

# Echo commands
set -x
# Remove any existing artifacts
rm -rf $base &&
# Build demo assets, fixing locations in index.html relative to $siteBase   
vite build --base=$siteBase dev && 
# Create site layout for https://dwmkerr.github.io/crosswords-js/
mkdir $localBase && 
# Ignore mv errors and exit code
mv $base/* $localBase --verbose 2> /dev/null ||
# A clean exit so any parent script continues...
exit 0