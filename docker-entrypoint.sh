#!/usr/bin/env bash
set -e

# Log the start of the entrypoint script
echo "🚀 Docker entrypoint started."

# Check if the src directory is empty or just contains a README.
# This is common when using the template.
if [ ! -d "/app/src" ] || [ -z "$(ls -A /app/src | grep -v -E '^(README.md|thumbnails)$')" ]; then
    echo "⚠️ Warning: The 'src' directory is empty or contains no images."
    echo "    Please mount your wallpaper directory to /app/src."
    # Create an empty public directory and start a server with a placeholder page
    # to avoid errors and show a helpful message.
    rm -rf public
    mkdir -p public
    echo "<h1>Wallpaper Gallery</h1><p>Your 'src' directory is empty. Please mount a directory containing your images to /app/src when running this container.</p>" > public/index.html
    exec http-server public --host 0.0.0.0 --port 8000
fi

# Run the gallery generation script to create thumbnails and data file.
echo "🎨 Generating gallery data and thumbnails..."
./scripts/generate_gallery.sh

# Build the application to populate the 'public' directory.
echo "🏗️  Building static assets..."
pnpm run build

# Start the http-server to serve the generated content.
echo "✅ Build complete. Starting server on port 8000..."
exec pnpm exec http-server public --host 0.0.0.0 --port 8000