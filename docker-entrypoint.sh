#!/bin/bash
set -e

echo "--- Running Gallery Generation ---"
./scripts/generate_gallery.sh

echo "--- Running pnpm run dev ---"
exec pnpm run dev
