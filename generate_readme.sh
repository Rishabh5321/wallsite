#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator
#
# Scans for images and updates the gallery data in docs/js/gallery-data.js.

echo "🎨 Initializing Wallpaper Gallery Generation..."

# --- Configuration ---
SRC_DIR="src"
THUMBNAIL_DIR="src/thumbnails"
OUTPUT_JS="docs/js/gallery-data.js"
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

# Construct a robust find command's extension matching part using an array
find_params=()
for ext in "${IMG_EXTENSIONS[@]}"; do
    if [ ${#find_params[@]} -gt 0 ]; then
        find_params+=(-o)
    fi
    find_params+=(-iname "*.$ext")
done

# --- Folder-based Gallery Generation ---
echo "📁 Scanning for folders in '$SRC_DIR'..."

gallery_folders_json=()
total_images=0

# Find all subdirectories in the source directory, excluding the thumbnail directory
mapfile -t subdirs < <(find "$SRC_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "$(basename "$THUMBNAIL_DIR")" | sort -V)

if [ ${#subdirs[@]} -eq 0 ]; then
    echo "⚠️ No subdirectories found in '$SRC_DIR'. Falling back to flat structure."
    # Fallback to original flat scanning logic if no folders are present
    mapfile -t images < <(find "$SRC_DIR" -maxdepth 1 -type f \( "${find_params[@]}" \) 2>/dev/null | sort -V)
    
    if [ ${#images[@]} -gt 0 ]; then
        json_entries=()
        for img_path in "${images[@]}"; do
            img_file=$(basename "$img_path")
            full_path="../src/$img_file"
            thumb_path="../src/thumbnails/$img_file"
            json_entries+=("{\"full\":\"$full_path\",\"thumbnail\":\"$thumb_path\"}")
        done
        wallpaper_json="[$(join_by , "${json_entries[@]}")]"
        # Create a default folder structure
        gallery_folders_json+=("{\"folder\": \"Wallpapers\", \"wallpapers\": ${wallpaper_json}}")
        total_images=${#images[@]}
    fi
else
    # Process each folder
    for dir_path in "${subdirs[@]}"; do
        folder_name=$(basename "$dir_path")
        echo "🔍 Processing folder: '$folder_name'..."

        mapfile -t images < <(find "$dir_path" -maxdepth 1 -type f \( "${find_params[@]}" \) 2>/dev/null | sort -V)

        if [ ${#images[@]} -eq 0 ]; then
            echo "   -> No images found in this folder. Skipping."
            continue
        fi

        echo "   -> Found ${#images[@]} images."
        total_images=$((total_images + ${#images[@]}))

        json_entries=()
        for img_path in "${images[@]}"; do
            img_file=$(basename "$img_path")
            # Path relative to the docs folder
            full_path="../src/$folder_name/$img_file"
            thumb_path="../src/thumbnails/$folder_name/$img_file"
            json_entries+=("{\"full\":\"$full_path\",\"thumbnail\":\"$thumb_path\"}")
        done

        wallpapers_json="[$(join_by , "${json_entries[@]}")]"
        gallery_folders_json+=("{\"folder\": \"$folder_name\", \"wallpapers\": ${wallpapers_json}}")
    done
fi


if [ $total_images -eq 0 ]; then
    echo "❌ No images found in any folder. Gallery will not be updated."
    exit 0
fi

echo "🖼️  Total of $total_images images found. Updating gallery data..."

# Join all folder JSON objects
gallery_data_json="[$(join_by , "${gallery_folders_json[@]}")]"

# Check if the output directory exists
if [ ! -d "$(dirname "$OUTPUT_JS")" ]; then
    echo "⚠️  Warning: '$(dirname "$OUTPUT_JS")' not found. Creating it."
    mkdir -p "$(dirname "$OUTPUT_JS")"
fi

# Write the final JSON to the output file
echo "const galleryData = ${gallery_data_json};" > "$OUTPUT_JS"

echo "✅ Gallery data in '$OUTPUT_JS' has been updated."

# --- Completion ---
echo ""
echo "✅ Done! Your wallpaper gallery has been successfully updated."
echo "---"
echo "📊 **Statistics:**"
echo "   - Total Images: $total_images"
echo "   - Total Folders: $([ ${#subdirs[@]} -gt 0 ] && echo ${#subdirs[@]} || echo 0)"
echo ""
