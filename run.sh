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

# Always make sure we're up to date
git pull

# Start installing the site
npm install

# Build it all
npm run build

# Start the server
npm start -- --open
