#!/usr/bin/env bash

# Wallpaper Gallery Generator v5.2 (Responsive Srcset) - Image Generation only

set -uo pipefail

# --- Configuration ---
readonly SCRIPT_VERSION="5.2"
readonly SRC_DIR="${SRC_DIR:-src}"
readonly WEBP_DIR="${WEBP_DIR:-public/webp}"
readonly IMG_EXTENSIONS=("png" "jpg" "jpeg" "gif" "bmp" "tiff" "webp")
readonly WEBP_QUALITY="${WEBP_QUALITY:-78}"
readonly LOG_FILE="${LOG_FILE:-gallery-generator.log}"
readonly RESPONSIVE_WIDTHS=(320 640 1024 1920) # For srcset

# --- Colors & Logging ---
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info()    { echo -e "${GREEN}[INFO]${NC} $*" >&2; echo "[$(date)] INFO: $*" >> "$LOG_FILE"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*" >&2; echo "[$(date)] WARN: $*" >> "$LOG_FILE"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; echo "[$(date)] ERROR: $*" >> "$LOG_FILE"; }
log_debug()   { [[ "${DEBUG:-}" == "1" ]] && { echo -e "${BLUE}[DEBUG]${NC} $*" >&2; echo "[$(date)] DEBUG: $*" >> "$LOG_FILE"; }; }

# --- Cleanup ---
trap 'rm -rf "$TEMP_DIR" 2>/dev/null || true' EXIT INT TERM
readonly TEMP_DIR=$(mktemp -d)

# --- Functions ---

show_usage() {
    cat << EOF
Wallpaper Gallery Generator v${SCRIPT_VERSION}

Generates responsive WebP images.

Usage: $0 [OPTIONS]

OPTIONS:
  -s, --src DIR             Source directory (default: ${SRC_DIR})
  -w, --webp DIR            WebP output directory (default: ${WEBP_DIR})
  -j, --jobs NUM            Number of parallel jobs (default: auto-detect)
  -q, --quality NUM         WebP quality (default: ${WEBP_QUALITY})
  --force                   Force regeneration of all images
  --debug                   Enable debug logging
  -h, --help                Show this help message

ENV:
  DEBUG=1                   Enable debug logging
EOF
}

parse_args() {
    local force_regen=0
    local jobs=""
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--src) SRC_DIR="$2"; shift 2 ;;
            -w|--webp) WEBP_DIR="$2"; shift 2 ;;
            -j|--jobs) jobs="$2"; shift 2 ;;
            -q|--quality) WEBP_QUALITY="$2"; shift 2 ;;
            --force) force_regen=1; shift ;;
            --debug) DEBUG=1; shift ;;
            -h|--help) show_usage; exit 0 ;;
            *) log_error "Unknown option: $1"; show_usage; exit 1 ;;
        esac
    done

    export SRC_DIR WEBP_DIR WEBP_QUALITY FORCE_REGEN=$force_regen DEBUG

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
        log_error "ImageMagick is required but not found. It is essential for image processing."
        exit 1
    fi
    if ! command -v identify &> /dev/null; then
        log_error "'identify' command (part of ImageMagick) is required but not found."
        exit 1
    fi

    MAGICK_CMD=$(command -v magick || command -v convert)
    export MAGICK_CMD

    if ! "$MAGICK_CMD" -list format | grep -qi "WEBP"; then
        log_error "WebP format not supported by your ImageMagick installation."
        exit 1
    fi

    [[ ! -d "$SRC_DIR" ]] && { log_error "Source directory '$SRC_DIR' not found."; exit 1; }
    log_info "Dependencies met. Using ImageMagick: $($MAGICK_CMD -version | head -1)"
}

needs_regeneration() {
    local src_file="$1" dest_file="$2"
    [[ "${FORCE_REGEN:-0}" == "1" ]] && return 0
    [[ ! -f "$dest_file" || ! -s "$dest_file" ]] && return 0
    [[ "$src_file" -nt "$dest_file" ]] && return 0
    return 1
}

generate_responsive_versions() {
    local img_path="$1"
    local rel_path="${img_path#$SRC_DIR/}"
    local base_name
    base_name=$(basename "${rel_path%.*}" | tr -d '\n')
    local dir_name
    dir_name=$(dirname "$rel_path" | tr -d '\n')

    for width in "${RESPONSIVE_WIDTHS[@]}"; do
        local out_path="$WEBP_DIR/$dir_name/${base_name}_${width}w.webp"
        # Correct the path for root-level images where dirname is '.'
        out_path="${out_path//\/.\//\/}"
        mkdir -p "$(dirname "$out_path")"

        if needs_regeneration "$img_path" "$out_path"; then
            log_info "Generating WebP ${width}w for '$img_path'"
            "$MAGICK_CMD" "$img_path[0]" -resize "${width}x" -quality "$WEBP_QUALITY" -strip "$out_path"
        else
            log_debug "Skipping ${width}w for '$img_path' (exists)"
        fi
    done
}

run_parallel() {
    local func_name="$1"
    shift
    local files_to_process=("$@")
    local pids=()

    for file in "${files_to_process[@]}"; do
        while ((${#pids[@]} >= NUM_JOBS)); do
            wait -n "${pids[@]}" 2>/dev/null || true
            # Clean up finished PIDs
            for i in "${!pids[@]}"; do
                ! kill -0 "${pids[i]}" 2>/dev/null && unset 'pids[i]'
            done
        done

        "$func_name" "$file" &
        pids+=($!)
    done

    wait "${pids[@]}" # Wait for all remaining jobs
}

# --- Main Execution ---

main() {
    parse_args "$@"
    check_dependencies
    mkdir -p "$WEBP_DIR"

    log_info "Finding all source images..."
    mapfile -t all_images < <(find "$SRC_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.jpeg" -o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.webp" \) | sort -V)

    if [[ ${#all_images[@]} -eq 0 ]]; then
        log_warn "No images found in '$SRC_DIR'."
        exit 0
    fi

    log_info "Found ${#all_images[@]} images to process."
    log_info "Generating responsive WebP versions..."
    run_parallel generate_responsive_versions "${all_images[@]}"

    log_info "Image generation complete!"
}

export -f generate_responsive_versions needs_regeneration log_info log_debug log_error log_warn
export MAGICK_CMD WEBP_DIR WEBP_QUALITY FORCE_REGEN RESPONSIVE_WIDTHS

main "$@"
exit 0
