#!/usr/bin/env bash

# Create cache directory if it doesn't exist
mkdir -p .vercel_cache/public

# Restore cached thumbnails and webp images
if [ -d ".vercel_cache/public/thumbnails" ]; then
  cp -r .vercel_cache/public/thumbnails public/
fi
if [ -d ".vercel_cache/public/webp" ]; then
  cp -r .vercel_cache/public/webp public/
fi

# Run the actual build command
pnpm install && pnpm run build

# Save generated thumbnails and webp images to cache
cp -r public/thumbnails .vercel_cache/public/
cp -r public/webp .vercel_cache/public/
