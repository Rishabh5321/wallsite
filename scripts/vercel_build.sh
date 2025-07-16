#!/usr/bin/env bash

# Create cache directory if it doesn't exist
mkdir -p .vercel_cache/public

# Ensure target directories exist in public/
mkdir -p public/thumbnails
mkdir -p public/webp

# Restore cached thumbnails and webp images
if [ -d ".vercel_cache/public/thumbnails" ]; then
  cp -r .vercel_cache/public/thumbnails/. public/thumbnails/
fi
if [ -d ".vercel_cache/public/webp" ]; then
  cp -r .vercel_cache/public/webp/. public/webp/
fi

# Run the actual build command
pnpm install && pnpm run build

# Save generated thumbnails and webp images to cache
# Ensure the cache directories are clean before copying new ones
rm -rf .vercel_cache/public/thumbnails .vercel_cache/public/webp
cp -r public/thumbnails .vercel_cache/public/
cp -r public/webp .vercel_cache/public/