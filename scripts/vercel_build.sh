#!/usr/bin/env bash

# Create cache directory if it doesn't exist
mkdir -p .vercel/cache/public

# Ensure target directories exist in public/
mkdir -p public/thumbnails
mkdir -p public/webp

# Restore cached thumbnails and webp images
if [ -d ".vercel/cache/public/thumbnails" ]; then
  cp -r .vercel/cache/public/thumbnails/. public/thumbnails/
fi
if [ -d ".vercel/cache/public/webp" ]; then
  cp -r .vercel/cache/public/webp/. public/webp/
fi

# Run the actual build command
pnpm install && pnpm run build

# Save generated thumbnails and webp images to cache
# Ensure the cache directories are clean before copying new ones
rm -rf .vercel/cache/public/thumbnails .vercel/cache/public/webp
cp -r public/thumbnails .vercel/cache/public/
cp -r public/webp .vercel/cache/public/