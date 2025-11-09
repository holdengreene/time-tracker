#!/bin/bash

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# This allows nvm to be used without a restart
\. "$HOME/.nvm/nvm.sh"

# Install that bad ole node
nvm install 24

# Check the version
node -v

# Start installing the site
npm install

# Build it all
npm run build

# Start the server
npm run start
