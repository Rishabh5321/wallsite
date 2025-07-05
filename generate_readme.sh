#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator v2.2
#
# This script scans for images, generates thumbnails, and creates the gallery data file.
# It handles images in subdirectories of 'src' as categories and any images in the
# root of 'src' as an 'Uncategorized' category.

echo "🎨 Initializing Wallpaper Gallery Generation..."

# --- Configuration ---
SRC_DIR="src"
THUMBNAIL_DIR="src/.thumbnails"
OUTPUT_JS="docs/js/gallery-data.js"
IMG_EXTENSIONS=("png" "jpg" "jpeg" "gif" "webp")
THUMBNAIL_WIDTH=400
UNCATEGORIZED_FOLDER_NAME="Uncategorized"

# --- Pre-flight Checks ---
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed. Please install it to continue."
    echo "   On Debian/Ubuntu: sudo apt-get update && sudo apt-get install imagemagick"
    exit 1
fi

# Use magick if available, otherwise fallback to convert
MAGICK_CMD=$(command -v magick || command -v convert)
echo "✅ Using ImageMagick command: $MAGICK_CMD"

# --- Functions ---
join_by() {
  local d=${1-} f=${2-}
  if shift 2; then
    printf %s "$f" "${@/#/$d}"
  fi
}

# --- Main Script ---
echo "🖼️  Generating thumbnails and gallery data..."

mkdir -p "$THUMBNAIL_DIR"

find_params=()
for ext in "${IMG_EXTENSIONS[@]}"; do
    [ ${#find_params[@]} -gt 0 ] && find_params+=(-o)
    find_params+=(-iname "*.$ext")
done

gallery_folders_json=()
total_images=0
processed_folders=0

# 1. Process Categorized Folders
mapfile -t subdirs < <(find "$SRC_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "$(basename "$THUMBNAIL_DIR")" | sort -V)

for dir_path in "${subdirs[@]}"; do
    folder_name=$(basename "$dir_path")
    echo "🔍 Processing category folder: '$folder_name'..."

    mapfile -t images < <(find "$dir_path" -maxdepth 1 -type f \( "${find_params[@]}" \) 2>/dev/null | sort -V)
    if [ ${#images[@]} -eq 0 ]; then continue; fi

    processed_folders=$((processed_folders + 1))
    total_images=$((total_images + ${#images[@]}))

    shell_thumb_dir="$THUMBNAIL_DIR/$folder_name"
    mkdir -p "$shell_thumb_dir"

    json_entries=()
    for img_path in "${images[@]}"; do
        img_file=$(basename "$img_path")
        shell_thumb_path="$shell_thumb_dir/$img_file"
        
        js_full_path="../$img_path"
        js_thumb_path="../$shell_thumb_path"
        
        if [ ! -f "$shell_thumb_path" ] || [ "$img_path" -nt "$shell_thumb_path" ]; then
            echo "   -> Generating thumbnail for '$img_file'..."
            "$MAGICK_CMD" "$img_path" -resize "${THUMBNAIL_WIDTH}x" "$shell_thumb_path"
        fi
        
        json_entries+=("{\"full\":\"$js_full_path\",\"thumbnail\":\"$js_thumb_path\"}")
    done

    wallpapers_json="[$(join_by , "${json_entries[@]}")]"
    gallery_folders_json+=("{\"folder\": \"$folder_name\", \"wallpapers\": ${wallpapers_json}}")
done

# 2. Process Uncategorized Images
mapfile -t uncategorized_images < <(find "$SRC_DIR" -maxdepth 1 -type f \( "${find_params[@]}" \) 2>/dev/null | sort -V)

if [ ${#uncategorized_images[@]} -gt 0 ]; then
    echo "🔍 Processing uncategorized images..."
    processed_folders=$((processed_folders + 1))
    total_images=$((total_images + ${#uncategorized_images[@]}))
    
    shell_thumb_dir_uncat="$THUMBNAIL_DIR" # Root of thumbnails
    
    json_entries=()
    for img_path in "${uncategorized_images[@]}"; do
        img_file=$(basename "$img_path")
        shell_thumb_path="$shell_thumb_dir_uncat/$img_file"

        js_full_path="../$img_path"
        js_thumb_path="../$shell_thumb_path"

        if [ ! -f "$shell_thumb_path" ] || [ "$img_path" -nt "$shell_thumb_path" ]; then
            echo "   -> Generating thumbnail for '$img_file'..."
            "$MAGICK_CMD" "$img_path" -resize "${THUMBNAIL_WIDTH}x" "$shell_thumb_path"
        fi
        
        json_entries+=("{\"full\":\"$js_full_path\",\"thumbnail\":\"$js_thumb_path\"}")
    done

    wallpapers_json="[$(join_by , "${json_entries[@]}")]"
    gallery_folders_json=("{\"folder\": \"$UNCATEGORIZED_FOLDER_NAME\", \"wallpapers\": ${wallpapers_json}}" "${gallery_folders_json[@]}")
fi

if [ $total_images -eq 0 ]; then
    echo "❌ No images found. Gallery will not be updated."
    exit 0
fi

echo "✅ Data generation complete. Writing to '$OUTPUT_JS'..."
gallery_data_json="[$(join_by , "${gallery_folders_json[@]}")]"
echo "const galleryData = ${gallery_data_json};" > "$OUTPUT_JS"

# --- Completion ---
echo ""
echo "✅ Done! Your wallpaper gallery has been successfully updated."
echo "---"
echo "📊 **Statistics:**"
echo "   - Processed Categories: $processed_folders"
echo "   - Total Images: $total_images"
echo ""