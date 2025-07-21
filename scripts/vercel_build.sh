#!/usr/bin/env bash
set -euo pipefail

# Define cache directory
CACHE_DIR=".vercel/cache/public"

# Always ensure the public directory exists before any operations
mkdir -p public

# Restore cached public directory from the previous build
echo "Restoring cached public directory..."
if [ -d "$CACHE_DIR" ]; then
  echo "Cache found. Restoring files..."
  # Copy contents of cache to public. Using `.` is safer than `*`.
  cp -r "$CACHE_DIR/." "public/"
else
  echo "No cache found. A full build will be performed."
fi

# Run the actual build command
# The --ignore-scripts flag is used to prevent unnecessary post-install scripts from running.
pnpm install --ignore-scripts
pnpm run build

# Save the generated public directory to the cache for the next build
echo "Saving public directory to cache..."
# Remove old cache and create a fresh one
rm -rf "$CACHE_DIR"
mkdir -p "$CACHE_DIR"
# Copy contents of public to cache
cp -r "public/." "$CACHE_DIR/"

echo "Vercel build script finished."
