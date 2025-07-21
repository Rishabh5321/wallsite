#!/usr/bin/env bash
set -euo pipefail

# Define cache directories and file paths
CACHE_DIR_PUBLIC=".vercel/cache/public"
CACHE_DIR_DATA=".vercel/cache/data"
SRC_GALLERY_DATA="src/gallery-data.json"
PUBLIC_GALLERY_DATA="public/gallery-data.json"

# Create cache directories if they don't exist
mkdir -p "$CACHE_DIR_PUBLIC/webp"
mkdir -p "$CACHE_DIR_PUBLIC/lqip"
mkdir -p "$CACHE_DIR_DATA"
mkdir -p "public" # Ensure public directory exists

# Restore cached assets from the previous build
echo "Restoring cached assets..."
if [ -d "$CACHE_DIR_PUBLIC/webp" ]; then
  cp -r "$CACHE_DIR_PUBLIC/webp/." "public/webp/"
fi
if [ -d "$CACHE_DIR_PUBLIC/lqip" ]; then
  cp -r "$CACHE_DIR_PUBLIC/lqip/." "public/lqip/"
fi
if [ -f "$CACHE_DIR_DATA/gallery-data.json" ]; then
  cp "$CACHE_DIR_DATA/gallery-data.json" "$SRC_GALLERY_DATA"
fi

# Run the actual build command
# The --ignore-scripts flag is used to prevent unnecessary post-install scripts from running.
# The main build script will handle all necessary generation and asset compilation.
pnpm install --ignore-scripts
pnpm run build

# After build, copy the generated data file to the public directory to be served
if [ -f "$SRC_GALLERY_DATA" ]; then
  cp "$SRC_GALLERY_DATA" "$PUBLIC_GALLERY_DATA"
fi

# Save generated assets to the cache for the next build
echo "Saving assets to cache..."
rm -rf "$CACHE_DIR_PUBLIC/webp" "$CACHE_DIR_PUBLIC/lqip" "$CACHE_DIR_DATA/gallery-data.json"
cp -r "public/webp" "$CACHE_DIR_PUBLIC/"
cp -r "public/lqip" "$CACHE_DIR_PUBLIC/"
if [ -f "$SRC_GALLERY_DATA" ]; then
  cp "$SRC_GALLERY_DATA" "$CACHE_DIR_DATA/gallery-data.json"
fi

echo "Vercel build script finished."
