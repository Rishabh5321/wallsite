#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator v3.5 (Parallelized)
#
# This script recursively scans the 'src' directory to build a nested JSON
# structure and generates thumbnails in parallel for faster execution.

echo "🎨 Initializing Wallpaper Gallery Generation (v3.5)..." >&2

# --- Configuration ---
SRC_DIR="src"
THUMBNAIL_DIR="public/thumbnails"
WEBP_DIR="public/webp" # Directory for WebP images
OUTPUT_JS="public/js/gallery-data.js"
IMG_EXTENSIONS=("png" "jpg" "jpeg" "gif") # WebP is now a derivative, not a source
THUMBNAIL_WIDTH=400
WEBP_QUALITY=82 # Quality setting for WebP conversion

# --- Pre-flight Checks ---
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed. Please install it to continue." >&2
    echo "   On Debian/Ubuntu: sudo apt-get update && sudo apt-get install imagemagick" >&2
    exit 1
fi
if ! command -v identify &> /dev/null; then
    echo "❌ Error: 'identify' command (part of ImageMagick) not found." >&2
    exit 1
fi
MAGICK_CMD=$(command -v magick || command -v convert)
echo "✅ Using ImageMagick command: $MAGICK_CMD" >&2

# Determine the number of parallel jobs
if command -v nproc &> /dev/null; then
    NUM_JOBS=$(nproc)
else
    NUM_JOBS=4 # Fallback value
fi
echo "✅ Using up to $NUM_JOBS parallel jobs for image processing." >&2


# --- Functions ---

# Function to generate a single thumbnail.
export SRC_DIR
export THUMBNAIL_DIR
export THUMBNAIL_WIDTH
export MAGICK_CMD
generate_thumbnail() {
    local img_path="$1"
    local relative_img_path="${img_path#$SRC_DIR/}"
    local thumb_dir="$THUMBNAIL_DIR/$(dirname "$relative_img_path")"
    local thumb_path="$thumb_dir/$(basename "$img_path")"

    mkdir -p "$thumb_dir"
    if [ ! -f "$thumb_path" ] || [ "$img_path" -nt "$thumb_path" ]; then
        echo "   -> Generating thumbnail for '$img_path'..." >&2
        "$MAGICK_CMD" "$img_path[0]" -resize "${THUMBNAIL_WIDTH}x" -quality 85 "$thumb_path"
    fi
}
export -f generate_thumbnail

# Function to generate a single WebP image.
export WEBP_DIR
export WEBP_QUALITY
generate_webp() {
    local img_path="$1"
    local relative_img_path="${img_path#$SRC_DIR/}"
    local webp_dir="$WEBP_DIR/$(dirname "$relative_img_path")"
    # Note: We don't append .webp, we replace the extension.
    local webp_path="$webp_dir/$(basename "${img_path%.*}").webp"

    mkdir -p "$webp_dir"
    if [ ! -f "$webp_path" ] || [ "$img_path" -nt "$webp_path" ]; then
        echo "   -> Generating WebP for '$img_path'..." >&2
        "$MAGICK_CMD" "$img_path[0]" -quality "$WEBP_QUALITY" "$webp_path"
    fi
}
export -f generate_webp

# Function to generate a single WebP thumbnail.
generate_webp_thumbnail() {
    local img_path="$1"
    local relative_img_path="${img_path#$SRC_DIR/}"
    local thumb_dir="$THUMBNAIL_DIR/$(dirname "$relative_img_path")"
    local thumb_path="$thumb_dir/$(basename "${img_path%.*}").webp"

    mkdir -p "$thumb_dir"
    if [ ! -f "$thumb_path" ] || [ "$img_path" -nt "$thumb_path" ]; then
        echo "   -> Generating WebP thumbnail for '$img_path'..." >&2
        "$MAGICK_CMD" "$img_path[0]" -resize "${THUMBNAIL_WIDTH}x" -quality 75 "$thumb_path"
    fi
}
export -f generate_webp_thumbnail

# Function to join array elements by a delimiter
join_by() {
  local d=${1-} f=${2-}
  if shift 2; then
    printf %s "$f" "${@/#/$d}"
  fi
}

# Recursively process a directory to build the JSON structure.
process_directory() {
    local dir_path="$1"
    local relative_dir_path="${dir_path#$SRC_DIR/}"
    
    if [ "$dir_path" == "$SRC_DIR" ]; then
        relative_dir_path=""
    fi

    local children_json=()

    # Process subdirectories
    for subdir_path in "$dir_path"/*/; do
        if [ -d "${subdir_path}" ]; then
            local subdir_name
            subdir_name=$(basename "$subdir_path")
            children_json+=("$(process_directory "$subdir_path")")
        fi
    done

    # Process images
    local find_params=()
    for ext in "${IMG_EXTENSIONS[@]}"; do
        [ ${#find_params[@]} -gt 0 ] && find_params+=(-o)
        find_params+=(-iname "*.$ext")
    done
    
    mapfile -t images < <(find "$dir_path" -maxdepth 1 -type f \( "${find_params[@]}" \) 2>/dev/null | sort -V)

    for img_path in "${images[@]}"; do
        local clean_img_path
        clean_img_path=$(echo "$img_path" | sed 's#//*#/#g')
        local img_file
        img_file=$(basename "$clean_img_path")
        local relative_img_path="${clean_img_path#$SRC_DIR/}"
        local img_dir_path
        img_dir_path=$(dirname "$relative_img_path")
        
        # Paths for JSON
        local json_thumb_path="thumbnails/$relative_img_path"
        local json_thumb_webp_path="thumbnails/$(dirname "$relative_img_path")/
$(basename "${img_file%.*}").webp"
        local json_webp_path="webp/$(dirname "$relative_img_path")/
$(basename "${img_file%.*}").webp"
        
        # Check if WebP version exists
        local webp_disk_path="public/$json_webp_path"
        local webp_json_field=""
        if [ -f "$webp_disk_path" ]; then
            webp_json_field=",\"webp\": \"$json_webp_path\", \"thumbnailWebp\": \"$json_thumb_webp_path\""
        fi

        # Get additional metadata
        local modified_date
        modified_date=$(stat -c %Y "$clean_img_path")
        local resolution
        resolution=$(identify -format '%wx%h' "$clean_img_path[0]")

        children_json+=("{\"name\": \"$img_file\", \"type\": \"file\", \"path\": \"$img_dir_path\", \"full\": \"$clean_img_path\", \"thumbnail\": \"$json_thumb_path\", \"modified\": $modified_date, \"resolution\": \"$resolution\"$webp_json_field}")
    done

    local folder_name
    folder_name=$(basename "$dir_path")
    if [ "$dir_path" == "$SRC_DIR" ]; then
        folder_name="Wallpapers"
    fi

    local children_output=""
    if [ ${#children_json[@]} -gt 0 ]; then
        children_output=",\"children\": [$(join_by , "${children_json[@]}")]"
    else
        children_output=""
    fi
    
    echo "{\"name\": \"$folder_name\", \"type\": \"folder\", \"path\": \"$relative_dir_path\" ${children_output}}"
}

# --- Main Script ---

# 1. Ensure output directories exist
echo "✅ Ensuring output directories exist..." >&2
mkdir -p "$THUMBNAIL_DIR"
mkdir -p "$WEBP_DIR"

# 2. Find all source images
echo "🖼️  Finding all source images..." >&2
find_params=()
for ext in "${IMG_EXTENSIONS[@]}"; do
    [ ${#find_params[@]} -gt 0 ] && find_params+=(-o)
    find_params+=(-name "*.$ext")
done
mapfile -t all_images < <(find "$SRC_DIR" -type f \( "${find_params[@]}" \) -not -path "*/thumbnails/*")

# 3. Generate thumbnails in parallel
echo "🖼️  Generating missing thumbnails (${#all_images[@]} images)..." >&2
printf "%s\0" "${all_images[@]}" | xargs -0 -n 1 -P "$NUM_JOBS" bash -c 'generate_thumbnail "$@"' _

# 4. Generate WebP thumbnails in parallel
echo "🖼️  Generating missing WebP thumbnails (${#all_images[@]} images)..." >&2
printf "%s\0" "${all_images[@]}" | xargs -0 -n 1 -P "$NUM_JOBS" bash -c 'generate_webp_thumbnail "$@"' _

# 5. Generate WebP versions in parallel
echo "🖼️  Generating missing WebP versions (${#all_images[@]} images)..." >&2
printf "%s\0" "${all_images[@]}" | xargs -0 -n 1 -P "$NUM_JOBS" bash -c 'generate_webp "$@"' _

# 6. Generate the gallery data JSON
echo "🔍 Generating nested gallery data..." >&2
gallery_data_json=$(process_directory "$SRC_DIR")

if [ -z "$gallery_data_json" ]; then
    echo "❌ No images or folders found. Gallery will not be updated." >&2
    exit 0
fi

# 7. Write the JSON data to the output file
echo "✅ Data generation complete. Writing to '$OUTPUT_JS'..." >&2
echo "const galleryData = ${gallery_data_json};" > "$OUTPUT_JS"

# --- Completion ---
echo "" >&2
echo "✅ Done! Your wallpaper gallery has been successfully updated." >&2
echo "" >&2
