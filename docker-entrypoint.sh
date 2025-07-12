#!/bin/bash
set -e

echo "--- Running Gallery Generation ---"
./scripts/generate_gallery.sh

echo "--- Running npm run dev ---"
exec npm run dev
