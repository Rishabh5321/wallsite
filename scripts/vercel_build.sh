#!/usr/bin/env bash

# Create cache directory if it doesn't exist
mkdir -p .vercel/cache/public

# Ensure target directories exist in public/
mkdir -p public/webp public/lqip

# Restore cached webp and lqip images
if [ -d ".vercel/cache/public/webp" ]; then
  cp -r .vercel/cache/public/webp/. public/webp/
fi
if [ -d ".vercel/cache/public/lqip" ]; then
  cp -r .vercel/cache/public/lqip/. public/lqip/
fi

# Run the actual build command
pnpm install --ignore-scripts && pnpm run build

# Save generated webp images to cache
# Ensure the cache directories are clean before copying new ones
rm -rf .vercel/cache/public/webp .vercel/cache/public/lqip
cp -r public/webp .vercel/cache/public/
cp -r public/lqip .vercel/cache/public/
