#!/bin/bash

# Single Executable Application Build Script for JAKUTEN STORE
# This script builds a standalone executable using Node.js SEA (Single Executable Application)

set -e

echo "Building JAKUTEN STORE as Single Executable Application..."

# Step 0: Bundle with webpack
echo "Step 0: Bundling with webpack..."
npx webpack
if [ $? -ne 0 ]; then
    echo "Error: Failed to bundle with webpack"
    exit 1
fi

# Step 1: Generate sea-config.json with all files
echo "Step 1: Generating sea-config.json..."
node generate-sea-config.js
if [ $? -ne 0 ]; then
    echo "Error: Failed to generate sea-config.json"
    exit 1
fi

# Step 2: Generate sea-prep.blob
echo "Step 2: Generating sea-prep.blob..."
node --experimental-sea-config sea-config.json
if [ $? -ne 0 ]; then
    echo "Error: Failed to generate sea-prep.blob"
    exit 1
fi

# Step 3: Copy node executable
echo "Step 3: Copying node executable..."
if [ -f "/c/Program Files/nodejs/node.exe" ]; then
    NODE_PATH="/c/Program Files/nodejs/node.exe"
elif command -v node &> /dev/null; then
    NODE_PATH=$(which node)
else
    echo "Error: Node.js executable not found"
    exit 1
fi

cp "$NODE_PATH" jakuten-store.exe
echo "Copied from: $NODE_PATH"

# Step 3: Remove signature (Windows only)
if command -v signtool &> /dev/null; then
    echo "Step 3: Removing signature..."
    signtool remove /s jakuten-store.exe 2>/dev/null || echo "No signature to remove"
else
    echo "Step 3: Skipping signature removal (signtool not found)"
fi

# Step 5: Inject SEA blob
echo "Step 5: Injecting SEA blob into executable..."
if command -v npx &> /dev/null; then
    npx postject jakuten-store.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
else
    echo "Error: npx not found. Please install postject: npm install -g postject"
    exit 1
fi

# Step 5: Sign executable (optional, Windows only)
if command -v signtool &> /dev/null; then
    echo "Step 5: Signing executable..."
    # Uncomment the following line if you have a code signing certificate
    # signtool sign /fd SHA256 jakuten-store.exe
    echo "Signing skipped (no certificate configured)"
else
    echo "Step 5: Skipping signing (signtool not found)"
fi

echo ""
echo "Build complete! Executable created: jakuten-store.exe"
echo ""
echo "To run the application:"
echo "  ./jakuten-store.exe"
echo ""
echo "The application will create db.sqlite in the current directory on first run."
