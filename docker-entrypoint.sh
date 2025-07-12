#!/bin/bash
set -e

echo "--- Running Gallery Generation ---"
./scripts/generate_gallery.sh

echo "--- Starting Server ---"
exec pnpm run start
