#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator v3.3
#
# This script recursively scans the 'src' directory to build a nested JSON
# structure, including a special 'Uncategorized' folder for images in the root.
# All logs are sent to stderr to keep stdout clean for the JSON output.

echo "🎨 Initializing Wallpaper Gallery Generation (v3.3)..." >&2

# --- Configuration ---
SRC_DIR="src"
THUMBNAIL_DIR="src/thumbnails"
OUTPUT_JS="docs/js/gallery-data.js"
IMG_EXTENSIONS=("png" "jpg" "jpeg" "gif" "webp")
THUMBNAIL_WIDTH=400
UNCATEGORIZED_FOLDER_NAME="Uncategorized"

# --- Pre-flight Checks ---
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed. Please install it to continue." >&2
    echo "   On Debian/Ubuntu: sudo apt-get update && sudo apt-get install imagemagick" >&2
    exit 1
fi

MAGICK_CMD=$(command -v magick || command -v convert)
echo "✅ Using ImageMagick command: $MAGICK_CMD" >&2

# --- Functions ---
join_by() {
  local d=${1-} f=${2-}
  if shift 2; then
    printf %s "$f" "${@/#/$d}"
  fi
}

# Recursively process a directory to build the JSON structure
process_directory() {
    local dir_path="$1"
    local relative_dir_path="${dir_path#$SRC_DIR/}"
    local parent_thumb_dir="$2"
    local is_root=false
    local folder_name

    if [ "$dir_path" == "$SRC_DIR" ]; then
        is_root=true
        folder_name="Wallpapers"
        relative_dir_path=""
    else
        folder_name=$(basename "$dir_path")
    fi

    echo "🔍 Processing directory: '$dir_path'..." >&2

    local current_thumb_dir
    if [ -z "$relative_dir_path" ]; then
        current_thumb_dir="$parent_thumb_dir"
    else
        current_thumb_dir="$parent_thumb_dir/$relative_dir_path"
    fi
    mkdir -p "$current_thumb_dir"

    local find_params=()
    for ext in "${IMG_EXTENSIONS[@]}"; do
        [ ${#find_params[@]} -gt 0 ] && find_params+=(-o)
        find_params+=(-iname "*.$ext")
    done

    mapfile -t images < <(find "$dir_path" -maxdepth 1 -type f \( "${find_params[@]}" \) 2>/dev/null | sort -V)
    mapfile -t subdirs < <(find "$dir_path" -maxdepth 1 -type d | tail -n +2 | sort -V)

    local children_json=()

    # Process subdirectories first
    for subdir_path in "${subdirs[@]}"; do
        if [ "$subdir_path" == "$THUMBNAIL_DIR" ]; then
            continue
        fi
        children_json+=("$(process_directory "$subdir_path" "$parent_thumb_dir")")
    done

    # Handle images
    local image_json_entries=()
    for img_path in "${images[@]}"; do
        local img_file=$(basename "$img_path")
        local thumb_path="$current_thumb_dir/$img_file"
        local js_full_path="$img_path"
        local js_thumb_path="$thumb_path"

        if [ ! -f "$thumb_path" ] || [ "$img_path" -nt "$thumb_path" ]; then
            echo "   -> Generating thumbnail for '$img_file'..." >&2
            "$MAGICK_CMD" "$img_path" -resize "${THUMBNAIL_WIDTH}x" "$thumb_path"
        fi
        image_json_entries+=("{\"name\": \"$img_file\", \"type\": \"file\", \"full\": \"$js_full_path\", \"thumbnail\": \"$js_thumb_path\"}")
    done

    # If this is a non-root directory, add its images to its children
    if ! $is_root && [ ${#image_json_entries[@]} -gt 0 ]; then
        children_json+=("${image_json_entries[@]}")
    fi

    # If this is the root directory, create an "Uncategorized" folder for root images
    if $is_root && [ ${#image_json_entries[@]} -gt 0 ]; then
        echo "🔍 Processing uncategorized images..." >&2
        local uncategorized_wallpapers_json="[$(join_by , "${image_json_entries[@]}")]"
        local uncategorized_folder_json="{\"name\": \"$UNCATEGORIZED_FOLDER_NAME\", \"type\": \"folder\", \"path\": \"\", \"children\": ${uncategorized_wallpapers_json}}"
        children_json+=("$uncategorized_folder_json")
    fi

    local children_output
    if [ ${#children_json[@]} -gt 0 ]; then
        children_output=",\"children\": [$(join_by , "${children_json[@]}")]"
    else
        children_output=""
    fi
    
echo "{\"name\": \"$folder_name\", \"type\": \"folder\", \"path\": \"$relative_dir_path\" ${children_output}}"
}

# --- Main Script ---
echo "🖼️  Generating nested gallery data..." >&2

gallery_data_json=$(process_directory "$SRC_DIR" "$THUMBNAIL_DIR")

if [ -z "$gallery_data_json" ]; then
    echo "❌ No images or folders found. Gallery will not be updated." >&2
    exit 0
fi

echo "✅ Data generation complete. Writing to '$OUTPUT_JS'..." >&2
echo "const galleryData = ${gallery_data_json};" > "$OUTPUT_JS"

# --- Completion ---
echo "" >&2
echo "✅ Done! Your wallpaper gallery has been successfully updated." >&2
echo "" >&2
