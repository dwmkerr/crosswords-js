#! /usr/bin/env bash

# How to process a pull request (forked repository) locally
# Instructions: https://gist.github.com/pvspain/92ead8ecd4552bedd643922877d62500

# Fill in the details for the pull request variables - trim all whitespace!

export forkRepoOwner=<fork-repo-owner> 
# For example: export forkRepoOwner=bobthecoder

export forkRepoUrl=<fork-repo-url> 
# For example: export forkRepoUrl=https://github.com/bobthecoder/forkedrepo.git

# The forker's branch name for the pull request
# Often main/master
export prBranch=<fork-repo-pull-request-branch> 
# For example: export prBranch=bobspr

# The local destination branch for an accepted pull request 
# Typically main/master
export localTargetBranch=<local-target-branch> 
# For example: export localTargetBranch=main

# The GitHub Pull Request number
export prNumber=<pull-request-number>
# For example: export prNumber=47

# The tag to identify the head of $localTargetBranch prior to merging
# Default: pre-PR${prNumber}
export prePrTag=pre-PR${prNumber}
# Using our example: pre-PR47

# A (temporary) local branch to inspect the pull request code
# Default: $forkRepoOwner-$prBranch
export localPrBranch=$forkRepoOwner-$prBranch
# Using our example: bobthecoder-bobspr