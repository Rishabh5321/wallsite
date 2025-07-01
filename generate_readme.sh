#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator
#
# Scans for images and updates the gallery data in docs/js/main.js.

echo "🎨 Initializing Wallpaper Gallery Generation..."

# --- Configuration ---
SRC_DIR="src"
THUMBNAIL_DIR="src/thumbnails"
OUTPUT_JS="docs/js/main.js"
IMG_EXTENSIONS=("png" "jpg" "jpeg" "gif" "webp")

# --- Functions ---

# Function to join array elements with a separator
join_by() {
  local d=${1-} f=${2-}
  if shift 2; then
    printf %s "$f" "${@/#/$d}"
  fi
}

# --- Main Script ---

# Construct the find command's extension matching part
find_ext_match=""
for ext in "${IMG_EXTENSIONS[@]}"; do
    if [ -z "$find_ext_match" ]; then
        find_ext_match="-iname "*.$ext""
    else
        find_ext_match="$find_ext_match -o -iname "*.$ext""
    fi
done

# Scan for image files and sort them naturally
echo "🔍 Searching for images in '$SRC_DIR'..."
mapfile -t images < <(find "$SRC_DIR" -maxdepth 1 -type f \( $find_ext_match \) 2>/dev/null | sort -V)

total_images=${#images[@]}
if [ $total_images -eq 0 ]; then
    echo "❌ No images found. Gallery will not be updated."
    exit 0
fi

echo "🖼️  Found $total_images images. Updating gallery data..."

# Create the JSON for the wallpapers
json_entries=()
for img_path in "${images[@]}"; do
    img_file=$(basename "$img_path")
    # Correctly reference the paths for the web, relative to the docs folder
    full_path="../src/$img_file"
    thumb_path="../src/thumbnails/$img_file"
    json_entries+=("{full:\"$full_path\",thumbnail:\"$thumb_path\"}")
done


# Join JSON entries with a comma
wallpaper_json="[$(join_by , "${json_entries[@]}")]"

# Check if the output file exists
if [ ! -f "$OUTPUT_JS" ]; then
    echo "⚠️  Warning: '$OUTPUT_JS' not found. Creating it."
    # Create a basic structure if the file doesn't exist
    mkdir -p "$(dirname "$OUTPUT_JS")"
    echo "const wallpapers = [];" > "$OUTPUT_JS"
fi

# Use a temporary file for sed to avoid issues with macOS vs Linux sed
tmp_file=$(mktemp)
# Replace the placeholder in the JS file, making it idempotent
sed "s|const wallpapers = .*|const wallpapers = ${wallpaper_json};|" "$OUTPUT_JS" > "$tmp_file" && mv "$tmp_file" "$OUTPUT_JS"

echo "✅ Gallery data in '$OUTPUT_JS' has been updated."

# --- Completion ---

echo ""
echo "✅ Done! Your wallpaper gallery has been successfully updated."
echo "---"
echo "📊 **Statistics:**"
echo "   - Total Images: $total_images"
echo ""
