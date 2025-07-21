#!/usr/bin/env bash
set -euo pipefail

# Define cache directory
CACHE_DIR=".vercel/cache/public"

# Restore cached public directory from the previous build
echo "Restoring cached public directory..."
if [ -d "$CACHE_DIR" ]; then
  # Use cp to be compatible with Vercel's build environment
  cp -r "$CACHE_DIR/"* "public/"
else
  echo "No cache found. Performing a full build."
  mkdir -p public
fi

# Run the actual build command
# The --ignore-scripts flag is used to prevent unnecessary post-install scripts from running.
pnpm install --ignore-scripts
pnpm run build

# Save the generated public directory to the cache for the next build
echo "Saving public directory to cache..."
rm -rf "$CACHE_DIR"
mkdir -p "$CACHE_DIR"
cp -r "public/"* "$CACHE_DIR/"

echo "Vercel build script finished."
