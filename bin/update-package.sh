#! /usr/bin/env bash

# 
# Update nvm

printf "\n1. Updating to latest nvm version...\n\n"   
(
  cd "$NVM_DIR"
  git fetch --tags origin
  git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`
) &&\
 \. "$NVM_DIR/nvm.sh"
printf "\n** nvm version: $(nvm --version)...\n"   

# Update node and npm

(
  printf "\n2. Updating to latest LTS version of node and latest npm version...\n\n"   
  nvm install --lts --latest-npm
) && (

# Switch to latest node LTS

  printf "\n3. Switch to latest LTS version of node...\n\n"   
  nvm use --lts
) && (
  if [ -f package.json ]
  then
      (

# Update package versions

        printf "\n4. Updating to latest package versions...\n\n"   
        npm update
      ) && (

# Fix package vulnerabilities

        printf "\n5. Attempting to fix any vulnerabilities...\n\n"
        npm audit --fix
      )   
  fi
)
