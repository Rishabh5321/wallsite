#!/usr/bin/env bash

# Create cache directory if it doesn't exist
mkdir -p .vercel/cache/public

# Ensure target directories exist in public/
mkdir -p public/webp

# Restore cached webp images
if [ -d ".vercel/cache/public/webp" ]; then
  cp -r .vercel/cache/public/webp/. public/webp/
fi

# Run the actual build command
pnpm install --ignore-scripts && pnpm run build

# Save generated webp images to cache
# Ensure the cache directories are clean before copying new ones
rm -rf .vercel/cache/public/webp
cp -r public/webp .vercel/cache/public/
