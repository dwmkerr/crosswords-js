#! /usr/bin/env bash

export bashrc=$HOME/.bashrc
nvmBootStrapUrl=https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh

# Checking for dependencies: curl and git

(
    printf "\n1. Checking for dependencies (curl, git)...\n\n"

    if ! ([[ -x "$(which curl)" ]] && [[ -x "$(which git)" ]]); then

        # Search for a supported package manager
        if [[ -x "$(which apt)" ]]; then
            packMan=apt
        elif [[ -x "$(which yum)" ]]; then
            packMan=yum
        elif [[ -x "$(which brew)" ]]; then
            packMan=brew
        else
            printf "ERROR: No supported package manager found (apt,yum, brew). Exiting...\n"
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

    printf "\n4. Updating to latest LTS version of node and latest npm version...\n\n"
    source "$NVM_DIR/nvm.sh"
    nvm install --lts --latest-npm
) && (

    # Switch to latest node LTS

    printf "\n5. Switch to latest LTS version of node...\n\n"
    source "$bashrc" && source "$NVM_DIR/nvm.sh" &&
        nvm use --lts
) && (
    if [ -f package.json ]; then

        # Install project packages

        printf "\n6. Installing project packages...\n\n"
        source "$bashrc" && source "$NVM_DIR/nvm.sh"
        npm install
    else
        cat <<EOF
\nERROR: Run this script again from the root directory of the project\n 
to install the project packages.\n\n
EOF
    fi
) && (

    # Install the git pre-commit hook to run our QA steps

    printf "\n7. Installing our git pre-commit hook for QA steps...\n\n"
    source "$bashrc" && source "$NVM_DIR/nvm.sh" &&
        npm run githook

) && (

    # Reminder to update regularly

    printf "\n8. Run 'npm run update' regularly to keep up to date with tools and package versions...\n\n"
)
