#!/usr/bin/env bash
set -euo pipefail

# Define cache directories and file paths
CACHE_DIR=".vercel/cache"
CACHE_FILE="$CACHE_DIR/gallery-data.json"
GALLERY_DATA_FILE="public/gallery-data.json"

# Create cache directories if they don't exist
mkdir -p "$CACHE_DIR/public/webp"
mkdir -p "$CACHE_DIR/public/lqip"
mkdir -p "public" # Ensure public directory exists

# Restore cached assets from the previous build
echo "Restoring cached assets..."
if [ -d "$CACHE_DIR/public/webp" ]; then
  cp -r "$CACHE_DIR/public/webp/." "public/webp/"
fi
if [ -d "$CACHE_DIR/public/lqip" ]; then
  cp -r "$CACHE_DIR/public/lqip/." "public/lqip/"
fi
if [ -f "$CACHE_FILE" ]; then
  cp "$CACHE_FILE" "$GALLERY_DATA_FILE"
fi

# Run the actual build command
# The --ignore-scripts flag is used to prevent unnecessary post-install scripts from running.
# The main build script will handle all necessary generation and asset compilation.
pnpm install --ignore-scripts
pnpm run build

# Save generated assets to the cache for the next build
echo "Saving assets to cache..."
rm -rf "$CACHE_DIR/public/webp" "$CACHE_DIR/public/lqip" "$CACHE_FILE"
cp -r "public/webp" "$CACHE_DIR/public/"
cp -r "public/lqip" "$CACHE_DIR/public/"
if [ -f "$GALLERY_DATA_FILE" ]; then
  cp "$GALLERY_DATA_FILE" "$CACHE_FILE"
fi

echo "Vercel build script finished."
