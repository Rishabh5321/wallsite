#!/usr/bin/env bash
set -euo pipefail

# Define cache directory
CACHE_DIR=".vercel/cache/public"

# Restore cached public directory from the previous build
echo "Restoring cached public directory..."
if [ -d "$CACHE_DIR" ]; then
  # Use rsync to be more efficient and handle deletions
  rsync -a --delete "$CACHE_DIR/" "public/"
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
mkdir -p "$CACHE_DIR"
rsync -a --delete "public/" "$CACHE_DIR/"

echo "Vercel build script finished."
