#! /usr/bin/env bash

# Base variables (sortable)
export bashrc=$HOME/.bashrc
export brewBootStrapUrl=https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh
export demoPackageScript=dev:preview
export demoRoot=$HOME/crossword-demo
export demoUrl=http://localhost:4173/
export npmArtefacts=$HOME/.npm
export nvmBootStrapUrl=https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh
export puzzlesLink=$HOME/crossword-demo-puzzles
export repoUrl=https://github.com/pvspain/crosswords-js.git

# Derived variables (non-sortable)
export repoParent=$demoRoot/git/github/pvspain
export repoRoot=$repoParent/crosswords-js
export repoPuzzles=$repoRoot/data

# Reset environment

if [[ -d "$demoRoot" ]]; then
    printf "\n0. Removing artifacts from previous run...\n\n"
    [[ -d "$demoRoot" ]] && rm -rf "$demoRoot"
    [[ -L "$puzzlesLink" ]] && rm -f "$puzzlesLink"
    [[ -d "$npmArtefacts" ]] && rm -rf "$npmArtefacts"

    if [[ -f "$bashrc" ]]; then
        source "$bashrc" && [[ -n "$NVM_DIR" ]] && [[ -d "$NVM_DIR" ]] && rm -rf "$NVM_DIR"
    fi
fi

# Checking for dependencies: brew, curl and git

(
    printf "\n1. Checking for dependencies (brew, curl, git)...\n\n"

    if ! ([[ -x "$(which brew)" ]] && [[ -x "$(which git)" ]]); then

        # Search for a supported package manager

        if (! [[ -x "$(which brew)" ]]); then
            bash -c "$(curl -fsSL $brewBootStrapUrl)"
            packMan=brew
        fi

        # Confirm installation

        if ! [[ -x "$(which brew)" ]]; then
            printf "ERROR: Failed to install Homebrew. Exiting...\n"
            exit 1
        fi

        printf "Root access is required to install packages. Please enter your password if prompted...\n\n"
        sudo "$packMan" install -y curl git
    fi
) && (

    # Install nvm if not present

    if [[ -z "$NVM_DIR" ]] || ! [[ -d "$NVM_DIR" ]]; then
        printf "\n2. Installing nvm...\n\n"
        bash -c "$(curl -o- $nvmBootStrapUrl)" &&
            # Reinitialise shell to initialise nvm in session
            source "$bashrc"
    fi
) && (

    # Update to latest version of nvm

    printf "\n3. Updating to latest nvm version...\n\n"
    source $bashrc && pushd "$NVM_DIR" &&
        git fetch --tags origin &&
        git checkout $(git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)) &&
        popd

    # Update node and npm

    source "$NVM_DIR/nvm.sh"
    nvm install --lts --latest-npm
    printf "\n4. Updating to latest LTS version of node and latest npm version...\n\n"
) && (

    # Switch to latest node LTS

    printf "\n5. Switch to latest LTS version of node...\n\n"
    source "$bashrc" && source "$NVM_DIR/nvm.sh" &&
        nvm use --lts
) && (
    if [ -f package.json ]; then

        # Install project packages

        printf "\n6. Installing project packages...\n\n"
        source "$bashrc" && source "$NVM_DIR/nvm.sh" &&
            npm install
    else

        # Clone and install repo

        printf "\n6A. Cloning repository from GitHub...\n\n"
        mkdir -p "$repoParent" &&
            pushd "$repoParent" &&
            git clone "$repoUrl" &&
            cd $repoRoot &&

            # Install project packages
            printf "\n6B. Installing project packages...\n\n" &&
            source "$bashrc" && source "$NVM_DIR/nvm.sh" &&
            npm install
    fi
) && (

    # Create link to extra puzzles in user's root directory

    printf "\n7. Create a softlink to crossword demo puzzles: $puzzlesLink...\n\n" &&
        ln -s "$repoPuzzles" "$puzzlesLink"

) && (

    # Open browser on demo

    printf "\n8. Opening the demo application in your default web browser.\n   Please wait for a few seconds while the demo server boots...\n\n" &&
        open "$demoUrl"
) && (

    # Run demo server

    printf "\n9. Starting demo server\n   Press 'q' to stop the server and cleanup after the demo...\n\n" &&
        pushd "$repoRoot" && source $bashrc && source "$NVM_DIR/nvm.sh" &&
        npm run "$demoPackageScript"
)

# Cleanup after demo

if [[ -d "$demoRoot" ]]; then
    printf "\n10. Cleaning up demo artifacts...\n\n"
    [[ -d "$demoRoot" ]] && rm -rf "$demoRoot"
    [[ -L "$puzzlesLink" ]] && rm -f "$puzzlesLink"
    [[ -d "$npmArtefacts" ]] && rm -rf "$npmArtefacts"

    if [[ -f "$bashrc" ]]; then
        source "$bashrc" && [[ -n "$NVM_DIR" ]] && [[ -d "$NVM_DIR" ]] && rm -rf "$NVM_DIR"
    fi
fi
