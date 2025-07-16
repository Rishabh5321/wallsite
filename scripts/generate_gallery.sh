#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator v4.0 (Enhanced & Optimized)
#
# This script recursively scans the 'src' directory to build a nested JSON
# structure and generates thumbnails/WebP images in parallel with improved
# error handling, logging, and performance optimizations.

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# --- Configuration ---
readonly SCRIPT_VERSION="4.0"
readonly SRC_DIR="${SRC_DIR:-src}"
readonly THUMBNAIL_DIR="${THUMBNAIL_DIR:-public/thumbnails}"
readonly WEBP_DIR="${WEBP_DIR:-public/webp}"
readonly OUTPUT_JS="${OUTPUT_JS:-public/js/gallery-data.js}"
readonly IMG_EXTENSIONS=("png" "jpg" "jpeg" "gif" "bmp" "tiff" "webp")
readonly THUMBNAIL_WIDTH="${THUMBNAIL_WIDTH:-400}"
readonly WEBP_QUALITY="${WEBP_QUALITY:-82}"
readonly THUMBNAIL_QUALITY="${THUMBNAIL_QUALITY:-85}"
readonly WEBP_THUMB_QUALITY="${WEBP_THUMB_QUALITY:-75}"
readonly LOG_FILE="${LOG_FILE:-gallery-generator.log}"
readonly TEMP_DIR=$(mktemp -d)

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# --- Logging Functions ---
log_info() {
    echo -e "${GREEN}[INFO]${NC} $*" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $*" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARN: $*" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >> "$LOG_FILE"
}

log_debug() {
    if [[ "${DEBUG:-}" == "1" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $*" >&2
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $*" >> "$LOG_FILE"
    fi
}

# --- Cleanup Function ---
cleanup() {
    local exit_code=$?
    log_debug "Cleaning up temporary directory: $TEMP_DIR"
    rm -rf "$TEMP_DIR" 2>/dev/null || true

    if [[ $exit_code -eq 0 ]]; then
        log_info "Script completed successfully"
    else
        log_error "Script failed with exit code $exit_code"
    fi

    exit $exit_code
}

trap cleanup EXIT INT TERM

# --- Utility Functions ---
show_usage() {
    cat << EOF
🎨 Wallpaper Gallery Generator v${SCRIPT_VERSION}

Usage: $0 [OPTIONS]

OPTIONS:
    -s, --src DIR           Source directory (default: src)
    -t, --thumbnail DIR     Thumbnail directory (default: public/thumbnails)
    -w, --webp DIR          WebP directory (default: public/webp)
    -o, --output FILE       Output JavaScript file (default: public/js/gallery-data.js)
    -j, --jobs NUM          Number of parallel jobs (default: auto-detect)
    -q, --quality NUM       WebP quality 1-100 (default: 82)
    --thumb-quality NUM     Thumbnail quality 1-100 (default: 85)
    --thumb-width NUM       Thumbnail width in pixels (default: 400)
    --force                 Force regeneration of all thumbnails
    --debug                 Enable debug logging
    -h, --help              Show this help message

ENVIRONMENT VARIABLES:
    DEBUG=1                 Enable debug output
    SKIP_WEBP=1            Skip WebP generation
    SKIP_THUMBNAILS=1      Skip thumbnail generation

EXAMPLES:
    $0                      # Use default settings
    $0 -s wallpapers -j 8   # Use 'wallpapers' as source, 8 parallel jobs
    $0 --force --debug      # Force regeneration with debug output

EOF
}

# Parse command line arguments
parse_args() {
    local force_regen=0
    local jobs=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--src)
                SRC_DIR="$2"
                shift 2
                ;;
            -t|--thumbnail)
                THUMBNAIL_DIR="$2"
                shift 2
                ;;
            -w|--webp)
                WEBP_DIR="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_JS="$2"
                shift 2
                ;;
            -j|--jobs)
                jobs="$2"
                shift 2
                ;;
            -q|--quality)
                WEBP_QUALITY="$2"
                shift 2
                ;;
            --thumb-quality)
                THUMBNAIL_QUALITY="$2"
                shift 2
                ;;
            --thumb-width)
                THUMBNAIL_WIDTH="$2"
                shift 2
                ;;
            --force)
                force_regen=1
                shift
                ;;
            --debug)
                DEBUG=1
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Export for use in subshells
    export SRC_DIR THUMBNAIL_DIR WEBP_DIR OUTPUT_JS THUMBNAIL_WIDTH
    export WEBP_QUALITY THUMBNAIL_QUALITY WEBP_THUMB_QUALITY
    export FORCE_REGEN=$force_regen DEBUG

    # Determine number of parallel jobs
    if [[ -n "$jobs" ]]; then
        NUM_JOBS="$jobs"
    elif command -v nproc &> /dev/null; then
        NUM_JOBS=$(nproc)
    else
        NUM_JOBS=4
    fi
    export NUM_JOBS
}

# --- Pre-flight Checks ---
check_dependencies() {
    log_info "Checking dependencies..."

    # Check ImageMagick
    if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
        log_error "ImageMagick is not installed. Please install it to continue."
        log_error "On Debian/Ubuntu: sudo apt-get update && sudo apt-get install imagemagick"
        log_error "On macOS: brew install imagemagick"
        exit 1
    fi

    if ! command -v identify &> /dev/null; then
        log_error "'identify' command (part of ImageMagick) not found."
        exit 1
    fi

    MAGICK_CMD=$(command -v magick || command -v convert)
    export MAGICK_CMD
    log_info "Using ImageMagick command: $MAGICK_CMD"

    # Check ImageMagick version and capabilities
    local version
    version=$("$MAGICK_CMD" -version | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' || echo "unknown")
    log_info "ImageMagick version: $version"

    # Test WebP support
    if ! "$MAGICK_CMD" -list format | grep -q "WEBP"; then
        log_warn "WebP support not detected in ImageMagick. WebP generation will be skipped."
        SKIP_WEBP=1
        export SKIP_WEBP
    fi

    # Check source directory
    if [[ ! -d "$SRC_DIR" ]]; then
        log_error "Source directory '$SRC_DIR' does not exist."
        exit 1
    fi

    log_info "Using up to $NUM_JOBS parallel jobs for image processing"
}

# --- Image Processing Functions ---
get_file_hash() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | cut -d' ' -f1
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        # Fallback to modification time and size
        stat -c '%Y-%s' "$file" 2>/dev/null || stat -f '%m-%z' "$file" 2>/dev/null || echo "unknown"
    fi
}

needs_regeneration() {
    local src_file="$1"
    local dest_file="$2"

    # Always regenerate if forced
    [[ "${FORCE_REGEN:-0}" == "1" ]] && return 0

    # Regenerate if destination doesn't exist
    [[ ! -f "$dest_file" ]] && return 0

    # Regenerate if source is newer than destination
    [[ "$src_file" -nt "$dest_file" ]] && return 0

    return 1
}

generate_thumbnail() {
    local img_path="$1"
    local relative_img_path="${img_path#$SRC_DIR/}"
    local thumb_dir="$THUMBNAIL_DIR/$(dirname "$relative_img_path")"
    local thumb_path="$thumb_dir/$(basename "$img_path")"

    mkdir -p "$thumb_dir"

    if needs_regeneration "$img_path" "$thumb_path"; then
        log_debug "Generating thumbnail for '$img_path'"
        if "$MAGICK_CMD" "$img_path[0]" -resize "${THUMBNAIL_WIDTH}x" -quality "$THUMBNAIL_QUALITY" "$thumb_path" 2>/dev/null; then
            log_debug "Successfully generated thumbnail: $thumb_path"
        else
            log_error "Failed to generate thumbnail for '$img_path'"
            return 1
        fi
    else
        log_debug "Thumbnail up to date: $thumb_path"
    fi
}

generate_webp() {
    local img_path="$1"
    local relative_img_path="${img_path#$SRC_DIR/}"
    local webp_dir="$WEBP_DIR/$(dirname "$relative_img_path")"
    local webp_path="$webp_dir/$(basename "${img_path%.*}").webp"

    mkdir -p "$webp_dir"

    if needs_regeneration "$img_path" "$webp_path"; then
        log_debug "Generating WebP for '$img_path'"
        if "$MAGICK_CMD" "$img_path[0]" -quality "$WEBP_QUALITY" "$webp_path" 2>/dev/null; then
            log_debug "Successfully generated WebP: $webp_path"
        else
            log_error "Failed to generate WebP for '$img_path'"
            return 1
        fi
    else
        log_debug "WebP up to date: $webp_path"
    fi
}

generate_webp_thumbnail() {
    local img_path="$1"
    local relative_img_path="${img_path#$SRC_DIR/}"
    local thumb_dir="$THUMBNAIL_DIR/$(dirname "$relative_img_path")"
    local thumb_path="$thumb_dir/$(basename "${img_path%.*}").webp"

    mkdir -p "$thumb_dir"

    if needs_regeneration "$img_path" "$thumb_path"; then
        log_debug "Generating WebP thumbnail for '$img_path'"
        if "$MAGICK_CMD" "$img_path[0]" -resize "${THUMBNAIL_WIDTH}x" -quality "$WEBP_THUMB_QUALITY" "$thumb_path" 2>/dev/null; then
            log_debug "Successfully generated WebP thumbnail: $thumb_path"
        else
            log_error "Failed to generate WebP thumbnail for '$img_path'"
            return 1
        fi
    else
        log_debug "WebP thumbnail up to date: $thumb_path"
    fi
}

# Export functions for parallel execution
export -f generate_thumbnail generate_webp generate_webp_thumbnail
export -f log_debug log_error needs_regeneration get_file_hash

# --- JSON Processing Functions ---
json_escape() {
    local str="$1"
    # Escape backslashes, quotes, and control characters
    printf '%s' "$str" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g; s/\r/\\r/g; s/\n/\\n/g'
}

join_by() {
    local IFS="$1"
    shift
    echo "$*"
}

get_file_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        stat -c '%s' "$file" 2>/dev/null || stat -f '%z' "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

get_image_metadata() {
    local img_path="$1"
    local metadata_file="$TEMP_DIR/metadata_$(basename "$img_path").json"

    # Try to get comprehensive metadata
    local resolution modified_date file_size
    resolution=$(identify -format '%wx%h' "$img_path[0]" 2>/dev/null || echo "unknown")
    modified_date=$(stat -c %Y "$img_path" 2>/dev/null || stat -f %m "$img_path" 2>/dev/null || echo "0")
    file_size=$(get_file_size "$img_path")

    # Create metadata object
    cat > "$metadata_file" << EOF
{
    "resolution": "$resolution",
    "modified": $modified_date,
    "size": $file_size
}
EOF

    echo "$metadata_file"
}

process_directory() {
    local dir_path="$1"
    local relative_dir_path="${dir_path#$SRC_DIR/}"

    [[ "$dir_path" == "$SRC_DIR" ]] && relative_dir_path=""

    local children_json=()
    local folder_count=0
    local file_count=0

    # Process subdirectories
    while IFS= read -r -d '' subdir_path; do
        if [[ -d "$subdir_path" ]]; then
            local subdir_name
            subdir_name=$(basename "$subdir_path")
            children_json+=("$(process_directory "$subdir_path")")
            ((folder_count++))
        fi
    done < <(find "$dir_path" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)

    # Build find parameters for images
    local find_params=()
    for ext in "${IMG_EXTENSIONS[@]}"; do
        [[ ${#find_params[@]} -gt 0 ]] && find_params+=(-o)
        find_params+=(-iname "*.$ext")
    done

    # Process images
    while IFS= read -r -d '' img_path; do
        local clean_img_path
        clean_img_path=$(echo "$img_path" | sed 's#//*#/#g')
        local img_file
        img_file=$(basename "$clean_img_path")
        local relative_img_path="${clean_img_path#$SRC_DIR/}"
        local img_dir_path
        img_dir_path=$(dirname "$relative_img_path")

        # Paths for JSON (normalized)
        local json_thumb_path="thumbnails/$relative_img_path"
        local json_thumb_webp_path="thumbnails/$(dirname "$relative_img_path")/$(basename "${img_file%.*}").webp"
        local json_webp_path="webp/$(dirname "$relative_img_path")/$(basename "${img_file%.*}").webp"

        # Check if WebP versions exist
        local webp_disk_path="$WEBP_DIR/$(dirname "$relative_img_path")/$(basename "${img_file%.*}").webp"
        local webp_thumb_disk_path="$THUMBNAIL_DIR/$(dirname "$relative_img_path")/$(basename "${img_file%.*}").webp"
        local webp_json_field=""

        if [[ -f "$webp_disk_path" ]]; then
            webp_json_field+=",\"webp\": \"$(json_escape "$json_webp_path")\""
        fi

        if [[ -f "$webp_thumb_disk_path" ]]; then
            webp_json_field+=",\"thumbnailWebp\": \"$(json_escape "$json_thumb_webp_path")\""
        fi

        # Get metadata
        local metadata_file
        metadata_file=$(get_image_metadata "$clean_img_path")
        local metadata
        metadata=$(cat "$metadata_file")

        # Extract values from metadata
        local resolution modified_date file_size
        resolution=$(echo "$metadata" | grep -o '"resolution": *"[^"]*"' | cut -d'"' -f4)
        modified_date=$(echo "$metadata" | grep -o '"modified": *[0-9]*' | cut -d':' -f2 | tr -d ' ')
        file_size=$(echo "$metadata" | grep -o '"size": *[0-9]*' | cut -d':' -f2 | tr -d ' ')

        # Build JSON object
        local img_json
        img_json="{\"name\": \"$(json_escape "$img_file")\""
        img_json+=",\"type\": \"file\""
        img_json+=",\"path\": \"$(json_escape "$img_dir_path")\""
        img_json+=",\"full\": \"$(json_escape "$clean_img_path")\""
        img_json+=",\"thumbnail\": \"$(json_escape "$json_thumb_path")\""
        img_json+=",\"modified\": $modified_date"
        img_json+=",\"resolution\": \"$(json_escape "$resolution")\""
        img_json+=",\"size\": $file_size"
        img_json+="$webp_json_field"
        img_json+="}"

        children_json+=("$img_json")
        ((file_count++))
    done < <(find "$dir_path" -maxdepth 1 -type f \( "${find_params[@]}" \) -print0 2>/dev/null | sort -z)

    # Build folder name
    local folder_name
    folder_name=$(basename "$dir_path")
    [[ "$dir_path" == "$SRC_DIR" ]] && folder_name="Wallpapers"

    # Build children output
    local children_output=""
    if [[ ${#children_json[@]} -gt 0 ]]; then
        local children_str
        children_str=$(join_by "," "${children_json[@]}")
        children_output=",\"children\": [$children_str]"
    fi

    # Build final JSON with counts
    local result
    result="{\"name\": \"$(json_escape "$folder_name")\""
    result+=",\"type\": \"folder\""
    result+=",\"path\": \"$(json_escape "$relative_dir_path")\""
    result+=",\"folderCount\": $folder_count"
    result+=",\"fileCount\": $file_count"
    result+="$children_output"
    result+="}"

    echo "$result"
}

# --- Main Script ---
main() {
    log_info "🎨 Initializing Wallpaper Gallery Generation (v$SCRIPT_VERSION)..."

    # Parse arguments and check dependencies
    parse_args "$@"
    check_dependencies

    # Create output directories
    log_info "Creating output directories..."
    mkdir -p "$THUMBNAIL_DIR" "$WEBP_DIR" "$(dirname "$OUTPUT_JS")"

    # Find all source images
    log_info "🔍 Finding source images..."
    local find_params=()
    for ext in "${IMG_EXTENSIONS[@]}"; do
        [[ ${#find_params[@]} -gt 0 ]] && find_params+=(-o)
        find_params+=(-iname "*.$ext")
    done

    mapfile -t all_images < <(find "$SRC_DIR" -type f \( "${find_params[@]}" \) -not -path "*/thumbnails/*" -not -path "*/webp/*" 2>/dev/null | sort -V)

    log_info "Found ${#all_images[@]} images to process"

    # Skip processing if no images found
    if [[ ${#all_images[@]} -eq 0 ]]; then
        log_warn "No images found in source directory '$SRC_DIR'"
        echo "const galleryData = {\"name\": \"Wallpapers\", \"type\": \"folder\", \"path\": \"\", \"folderCount\": 0, \"fileCount\": 0};" > "$OUTPUT_JS"
        log_info "Empty gallery data written to '$OUTPUT_JS'"
        return 0
    fi

    # Generate thumbnails in parallel
    if [[ "${SKIP_THUMBNAILS:-0}" != "1" ]]; then
        log_info "🖼️  Generating thumbnails..."
        printf "%s\0" "${all_images[@]}" | xargs -0 -P "$NUM_JOBS" -I {} bash -c 'generate_thumbnail "{}"'

        # Generate WebP thumbnails if WebP is supported
        if [[ "${SKIP_WEBP:-0}" != "1" ]]; then
            log_info "🖼️  Generating WebP thumbnails..."
            printf "%s\0" "${all_images[@]}" | xargs -0 -n 1 -P "$NUM_JOBS" -I {} bash -c 'generate_webp_thumbnail "$@"' _ {}
        fi
    fi

    # Generate WebP versions in parallel
    if [[ "${SKIP_WEBP:-0}" != "1" ]]; then
        log_info "🖼️  Generating WebP versions..."
        printf "%s\0" "${all_images[@]}" | xargs -0 -n 1 -P "$NUM_JOBS" -I {} bash -c 'generate_webp "$@"' _ {}
    fi

    # Generate gallery data JSON
    log_info "🔍 Generating gallery data structure..."
    local gallery_data_json
    gallery_data_json=$(process_directory "$SRC_DIR")

    if [[ -z "$gallery_data_json" ]]; then
        log_error "Failed to generate gallery data"
        exit 1
    fi

    # Write JavaScript file with metadata
    log_info "✅ Writing gallery data to '$OUTPUT_JS'..."
    cat > "$OUTPUT_JS" << EOF
// Auto-generated by Wallpaper Gallery Generator v${SCRIPT_VERSION}
// Generated on: $(date)
// Source directory: $SRC_DIR
// Total images processed: ${#all_images[@]}

const galleryData = $gallery_data_json;

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = galleryData;
}
EOF

    log_info "✅ Gallery generation completed successfully!"
    log_info "📊 Statistics:"
    log_info "   - Images processed: ${#all_images[@]}"
    log_info "   - Output file: $OUTPUT_JS"
    log_info "   - Log file: $LOG_FILE"
}

# Run main function with all arguments
main "$@"
