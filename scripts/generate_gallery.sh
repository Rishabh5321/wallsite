#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator v4.0 (Enhanced & Optimized)

set -euo pipefail

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

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info()    { echo -e "${GREEN}[INFO]${NC} $*" >&2; echo "[$(date)] INFO: $*" >> "$LOG_FILE"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*" >&2; echo "[$(date)] WARN: $*" >> "$LOG_FILE"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; echo "[$(date)] ERROR: $*" >> "$LOG_FILE"; }
log_debug()   { [[ "${DEBUG:-}" == "1" ]] && { echo -e "${BLUE}[DEBUG]${NC} $*" >&2; echo "[$(date)] DEBUG: $*" >> "$LOG_FILE"; }; }

cleanup() {
    local exit_code=$?
    log_debug "Cleaning up temporary directory: $TEMP_DIR"
    rm -rf "$TEMP_DIR" 2>/dev/null || true
    [[ $exit_code -eq 0 ]] && log_info "Script completed successfully" || log_error "Script failed with exit code $exit_code"
    exit $exit_code
}

trap cleanup EXIT INT TERM

show_usage() {
    cat << EOF
🎨 Wallpaper Gallery Generator v${SCRIPT_VERSION}

Usage: $0 [OPTIONS]

OPTIONS:
  -s, --src DIR             Source directory (default: src)
  -t, --thumbnail DIR       Thumbnail directory (default: public/thumbnails)
  -w, --webp DIR            WebP directory (default: public/webp)
  -o, --output FILE         Output JS file (default: public/js/gallery-data.js)
  -j, --jobs NUM            Number of parallel jobs (default: auto)
  -q, --quality NUM         WebP quality (default: 82)
  --thumb-quality NUM       Thumbnail quality (default: 85)
  --thumb-width NUM         Thumbnail width (default: 400)
  --force                   Force regenerate
  --debug                   Enable debug logs
  -h, --help                Show this help

ENV:
  DEBUG=1                   Enable debug
  SKIP_WEBP=1               Skip WebP generation
  SKIP_THUMBNAILS=1         Skip thumbnails

EOF
}

parse_args() {
    local force_regen=0
    local jobs=""
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--src) SRC_DIR="$2"; shift 2 ;;
            -t|--thumbnail) THUMBNAIL_DIR="$2"; shift 2 ;;
            -w|--webp) WEBP_DIR="$2"; shift 2 ;;
            -o|--output) OUTPUT_JS="$2"; shift 2 ;;
            -j|--jobs) jobs="$2"; shift 2 ;;
            -q|--quality) WEBP_QUALITY="$2"; shift 2 ;;
            --thumb-quality) THUMBNAIL_QUALITY="$2"; shift 2 ;;
            --thumb-width) THUMBNAIL_WIDTH="$2"; shift 2 ;;
            --force) force_regen=1; shift ;;
            --debug) DEBUG=1; shift ;;
            -h|--help) show_usage; exit 0 ;;
            *) log_error "Unknown option: $1"; show_usage; exit 1 ;;
        esac
    done

    export SRC_DIR THUMBNAIL_DIR WEBP_DIR OUTPUT_JS THUMBNAIL_WIDTH
    export WEBP_QUALITY THUMBNAIL_QUALITY WEBP_THUMB_QUALITY FORCE_REGEN=$force_regen DEBUG

    if [[ -n "$jobs" ]]; then
        NUM_JOBS="$jobs"
    elif command -v nproc &> /dev/null; then
        NUM_JOBS=$(nproc)
    else
        NUM_JOBS=4
    fi
    export NUM_JOBS
}

check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
        log_error "ImageMagick is required but not found."
        exit 1
    fi

    if ! command -v identify &> /dev/null; then
        log_error "'identify' command missing."
        exit 1
    fi

    MAGICK_CMD=$(command -v magick || command -v convert)
    export MAGICK_CMD

    log_info "Using ImageMagick command: $MAGICK_CMD"
    log_info "ImageMagick version: $("$MAGICK_CMD" -version | head -1)"

    if ! "$MAGICK_CMD" -list format | grep -q "WEBP"; then
        log_warn "WebP format not supported by ImageMagick."
        SKIP_WEBP=1
        export SKIP_WEBP
    fi

    [[ ! -d "$SRC_DIR" ]] && log_error "Source directory '$SRC_DIR' missing." && exit 1

    log_info "Using up to $NUM_JOBS parallel jobs"
}

needs_regeneration() {
    local src_file="$1" dest_file="$2"
    [[ "${FORCE_REGEN:-0}" == "1" ]] && return 0
    [[ ! -f "$dest_file" || ! -s "$dest_file" ]] && return 0
    return 1
}

generate_thumbnail() {
    local img="$1"
    local rel="${img#$SRC_DIR/}"
    local out="$THUMBNAIL_DIR/$rel"
    mkdir -p "$(dirname "$out")"
    if needs_regeneration "$img" "$out"; then
        log_info "Generating thumbnail for '$img'..."
        "$MAGICK_CMD" "$img[0]" -resize "${THUMBNAIL_WIDTH}x" -quality "$THUMBNAIL_QUALITY" "$out" || return 1
    else
        log_info "Skipping thumbnail for '$img' (already exists)."
    fi
}

generate_webp() {
    local img="$1"
    local rel="${img#$SRC_DIR/}"
    local out="$WEBP_DIR/$(dirname "$rel")/$(basename "${img%.*}").webp"
    mkdir -p "$(dirname "$out")"
    if needs_regeneration "$img" "$out"; then
        log_info "Generating WebP for '$img'..."
        "$MAGICK_CMD" "$img[0]" -quality "$WEBP_QUALITY" "$out" || return 1
    else
        log_info "Skipping WebP for '$img' (already exists)."
    fi
}

generate_webp_thumbnail() {
    local img="$1"
    local rel="${img#$SRC_DIR/}"
    local out="$THUMBNAIL_DIR/$(dirname "$rel")/$(basename "${img%.*}").webp"
    mkdir -p "$(dirname "$out")"
    if needs_regeneration "$img" "$out"; then
        log_info "Generating WebP thumbnail for '$img'..."
        "$MAGICK_CMD" "$img[0]" -resize "${THUMBNAIL_WIDTH}x" -quality "$WEBP_THUMB_QUALITY" "$out" || return 1
    else
        log_info "Skipping WebP thumbnail for '$img' (already exists)."
    fi
}

run_parallel() {
    local func="$1"
    shift
    local files=("$@")
    local pids=()
    local status=0

    for file in "${files[@]}"; do
        while [[ "${#pids[@]}" -ge $NUM_JOBS ]]; do
            wait "${pids[0]}" || status=1
            pids=("${pids[@]:1}")
        done

        (
            if ! "$func" "$file"; then
                echo -e "${RED}[ERROR]${NC} $func failed for $file" >&2
                exit 1
            fi
        ) &
        pids+=($!)
    done

    for pid in "${pids[@]}"; do
        wait "$pid" || status=1
    done

    return $status
}

main() {
    log_info "🎨 Initializing Wallpaper Gallery Generation (v$SCRIPT_VERSION)..."
    parse_args "$@"
    check_dependencies
    mkdir -p "$THUMBNAIL_DIR" "$WEBP_DIR" "$(dirname "$OUTPUT_JS")"

    log_info "🔍 Finding source images..."
    local find_args=()
    for ext in "${IMG_EXTENSIONS[@]}"; do
        [[ ${#find_args[@]} -gt 0 ]] && find_args+=(-o)
        find_args+=(-iname "*.$ext")
    done

    mapfile -t all_images < <(find "$SRC_DIR" -type f \( "${find_args[@]}" \) -not -path "*/thumbnails/*" -not -path "*/webp/*" 2>/dev/null | sort -V)
    log_info "Found ${#all_images[@]} images to process"

    if [[ ${#all_images[@]} -eq 0 ]]; then
        echo "const galleryData = {};" > "$OUTPUT_JS"
        log_info "No images found. Wrote empty gallery data to $OUTPUT_JS"
        return 0
    fi

    if [[ "${SKIP_THUMBNAILS:-0}" != "1" ]]; then
        log_info "🖼️  Generating thumbnails..."
        run_parallel generate_thumbnail "${all_images[@]}"
        if [[ "${SKIP_WEBP:-0}" != "1" ]]; then
            log_info "🖼️  Generating WebP thumbnails..."
            run_parallel generate_webp_thumbnail "${all_images[@]}"
        fi
    fi

    if [[ "${SKIP_WEBP:-0}" != "1" ]]; then
        log_info "🖼️  Generating WebP versions..."
        run_parallel generate_webp "${all_images[@]}"
    fi

    log_info "✅ Processing complete."
}

export -f generate_thumbnail generate_webp generate_webp_thumbnail needs_regeneration log_debug log_error

main "$@"