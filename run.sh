#!/bin/bash

if ! command -v node &> dev/null; then
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    # This allows nvm to be used without a restart
    \. "$HOME/.nvm/nvm.sh"

    # Install that bad ole node
    nvm install 24

    # Check the version
    node -v
fi

# Check github for new commits
git fetch

# Get the number of commits behind
BEHIND_COUNT=$(git rev-list --count HEAD..@{u})

# If there are commits behind, pull them
if [ $BEHIND_COUNT -gt 0 ]; then
    echo "There are $BEHIND_COUNT commits behind. Pulling..."
    git pull
fi

# Start installing the site
npm install

# Build it all
npm run build

# Start the server
npm run start
