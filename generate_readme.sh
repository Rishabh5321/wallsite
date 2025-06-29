#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator
#
# Scans for images and updates the index.html gallery.

echo "🎨 Initializing Wallpaper Gallery Generation..."

# Scan for image files and sort them naturally
echo "🔍 Searching for images (.png, .jpg, .jpeg, .gif, .webp)..."
mapfile -t images < <(find ./src -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | sort -V)

total_images=${#images[@]}
if [ $total_images -eq 0 ]; then
    echo "❌ No images found. index.html will not be updated."
    exit 0
fi

echo "🖼️  Found $total_images images. Updating index.html..."

# --- HTML Index Generation ---

# Create the JSON for the wallpapers
wallpaper_json=""
for img in "${images[@]}"; do
    img_clean="${img#./src/}"
    wallpaper_json+="{\"full\":\"src/$img_clean\",\"thumbnail\":\"src/thumbnails/$img_clean\"},"
done

if [ -n "$wallpaper_json" ]; then
    # Remove trailing comma and wrap in brackets
    wallpaper_json="[${wallpaper_json%,}]"

    # Use a temporary file for sed to avoid issues with macOS vs Linux sed
    tmp_file=$(mktemp)
    # Replace the placeholder in index.html, making it idempotent
    sed "s|const wallpapers = .*|const wallpapers = ${wallpaper_json};|" "index.html" > "$tmp_file" && mv "$tmp_file" "index.html"

    echo "✅ index.html has been updated with the latest wallpapers."
    echo "   You can now open index.html in your browser to see the gallery."
else
    echo "⚠️ No images found, index.html was not updated."
fi

# --- Completion ---

echo ""
echo "✅ Done! Your wallpaper gallery has been successfully updated."
echo "---"
echo "📊 **Statistics:**"
echo "   - Total Images: $total_images"
echo ""