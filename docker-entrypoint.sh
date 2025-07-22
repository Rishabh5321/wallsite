#!/usr/bin/env bash
set -e

# Log the start of the entrypoint script
echo "🚀 Docker entrypoint started."

# --- Pre-flight Checks ---

# Check 1: Ensure the user has not incorrectly mounted a volume to /app/src
if [ ! -f "/app/src/templates/index.html" ]; then
    echo "❌ ERROR: Critical file '/app/src/templates/index.html' not found."
    echo "   This usually means you have incorrectly mounted a volume to '/app/src'."
    echo "   The '/app/src' directory is for the application's internal source code and should not be replaced."
    echo ""
    echo "   To provide your own wallpapers, please mount your wallpaper directory to '/app/wallpapers'."
    echo "   Correct usage:"
    echo "   docker run -p 8000:8000 --name wallsite -v /path/to/your/wallpapers:/app/wallpapers wallsite:latest"
    echo ""
    exit 1
fi

# Check 2: Check if the wallpapers directory is empty or just contains a README.
if [ ! -d "/app/wallpapers" ] || [ -z "$(ls -A /app/wallpapers | grep -v -E '^(README.md)$')" ]; then
    echo "⚠️ Warning: The 'wallpapers' directory is empty or contains no images."
    echo "    Please mount your wallpaper directory to /app/wallpapers."
    # Create an empty public directory and start a server with a placeholder page
    # to avoid errors and show a helpful message.
    rm -rf public
    mkdir -p public
    echo "<h1>Wallpaper Gallery</h1><p>Your 'wallpapers' directory is empty. Please mount a directory containing your images to /app/wallpapers when running this container.</p>" > public/index.html
    exec http-server public --host 0.0.0.0 --port 8000
fi

# --- Main Execution ---

# Clean old thumbnails to ensure a fresh start, since the main script no longer does this.
echo "🗑️  Cleaning old thumbnails directory..."
rm -rf public/thumbnails

# Build the application. This will run the gallery generation script and then build the assets.
echo "🏗️  Building static assets and generating gallery..."
pnpm run build

# Start the http-server to serve the generated content.
echo "✅ Build complete. Starting server on port 8000..."
exec pnpm exec http-server public --host 0.0.0.0 --port 8000 --cache 31536000
