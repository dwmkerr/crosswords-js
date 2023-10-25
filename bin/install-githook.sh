#! /usr/bin/env bash

hookSource=.githook-pre-commit
hookTarget=.git/hooks/pre-commit
backup=$hookTarget.backup-$(date --iso-8601=seconds)

#  Test PWD is repo root
if [[ -d .git ]] && [[ -f package.json ]]; then
    # Save existing
    if [[ -f "$hookTarget" ]]; then
        mv --force "$hookTarget" "$backup"
    fi &&
        cp --force "$hookSource" "$hookTarget" &&
        chmod u+x "$hookTarget" &&
        git config --local commit.template ./.git-commit-template.txt
else
    printf "ERROR: This script must be run from the repository root directory\n"
    exit 1
fi
