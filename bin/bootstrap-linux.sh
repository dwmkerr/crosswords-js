#! /usr/bin/env bash

nvmBootStrapURL=https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh

# Checking for dependencies: curl and git

(
    printf "\n1. Checking for dependencies (curl, git)...\n\n"

    if ! ([[ -x "$(which curl)" ]] && [[ -x "$(which git)" ]]); then

        # Search for a supported package manager
        if [[ -x "$(which apt)" ]]; then
            packMan=apt
        elif [[ -x "$(which yum)" ]]; then
            packMan=yum
        else
            printf "ERROR: No supported package manager found (apt,yum). Exiting...\n"
            exit 1
        fi

        printf "Root access is required to install packages. Please enter your password if prompted...\n\n"
        sudo "$packMan" install -y curl git
    fi
) && (

    # Install nvm if not present

    printf "\n2. Installing nvm if not present...\n\n"
    if [[ -z "${NVM_DIR}" ]]; then
        curl -o- $nvmBootStrapURL | bash &&
            # Reinitialise shell to pick up initialise nvm in session
            source "$HOME/.bashrc"
    fi
) && (

    # Update to latest version of nvm

    printf "\n3. Updating to latest nvm version...\n\n"
    pushd "$NVM_DIR"
    git fetch --tags origin
    git checkout $(git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1))
    popd
    source "$NVM_DIR/nvm.sh"

    # Update node and npm

    printf "\n4. Updating to latest LTS version of node and latest npm version...\n\n"
    nvm install --lts --latest-npm
) && (

    # Switch to latest node LTS

    printf "\n5. Switch to latest LTS version of node...\n\n"
    source "$NVM_DIR/nvm.sh"
    nvm use --lts
) && (
    if [ -f package.json ]; then

        # Install project packages

        printf "\n6. Installing project packages...\n\n"
        source "$NVM_DIR/nvm.sh"
        npm install
    else
        cat <<EOF
\nERROR: Run this script again from the root directory of the project\n 
to install the project packages.\n\n
EOF
    fi
) && (

    # Reminder to update regularly

    printf "\n7. Run 'npm run update' regularly to keep up to date with tools and package versions...\n\n"
)
