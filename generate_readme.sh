#!/usr/bin/env bash

# Configuration
COLUMNS=3
IMAGE_WIDTH="300px"
README_FILE="README.md"
TITLE="Wallpapers"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Generate a README.md with wallpaper images in a table format"
    echo ""
    echo "Options:"
    echo "  -c, --columns NUM     Number of columns (default: 3)"
    echo "  -w, --width SIZE      Image width (default: 300px)"
    echo "  -t, --title TITLE     Table title (default: Wallpapers)"
    echo "  -o, --output FILE     Output file (default: README.md)"
    echo "  -h, --help           Show this help message"
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--columns)
            COLUMNS="$2"
            shift 2
            ;;
        -w|--width)
            IMAGE_WIDTH="$2"
            shift 2
            ;;
        -t|--title)
            TITLE="$2"
            shift 2
            ;;
        -o|--output)
            README_FILE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Validate columns is a positive integer
if ! [[ "$COLUMNS" =~ ^[1-9][0-9]*$ ]]; then
    echo -e "${RED}Error: Columns must be a positive integer${NC}"
    exit 1
fi

echo -e "${YELLOW}Generating $README_FILE...${NC}"

# Find and sort images (case-insensitive extensions)
mapfile -t images < <(find . -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" \) | sort -V)

# Check if any images were found
if [[ ${#images[@]} -eq 0 ]]; then
    echo -e "${RED}No image files found in current directory${NC}"
    exit 1
fi

echo -e "${GREEN}Found ${#images[@]} images${NC}"

# Generate README header
{
    echo "# $TITLE"
    echo ""
    echo "*Generated on $(date '+%Y-%m-%d %H:%M:%S')*"
    echo ""
    echo "Total images: **${#images[@]}**"
    echo ""
    echo "<table>"
} > "$README_FILE"

count=0
row_open=false

# Process each image
for img in "${images[@]}"; do
    # Start new row if needed
    if (( count % COLUMNS == 0 )); then
        echo "  <tr>" >> "$README_FILE"
        row_open=true
    fi
    
    # Clean up image path and get filename for alt text
    img_clean="${img#./}"
    img_name=$(basename "$img_clean" | sed 's/\.[^.]*$//')  # Remove extension for cleaner name
    
    # Add table cell with image
    {
        echo "    <td align=\"center\" width=\"${IMAGE_WIDTH}\">"
        echo "      <img src=\"$img_clean\" width=\"$IMAGE_WIDTH\" alt=\"$img_name\"><br>"
        echo "      <em>$img_name</em>"
        echo "    </td>"
    } >> "$README_FILE"
    
    ((count++))
    
    # Close row if needed
    if (( count % COLUMNS == 0 )); then
        echo "  </tr>" >> "$README_FILE"
        row_open=false
    fi
done

# Close last row if it's still open
if $row_open; then
    echo "  </tr>" >> "$README_FILE"
fi

# Generate README footer
{
    echo "</table>"
    echo ""
    echo "---"
    echo "*Last updated: $(date '+%Y-%m-%d %H:%M:%S')*"
} >> "$README_FILE"

echo -e "${GREEN}$README_FILE updated successfully!${NC}"
echo -e "${GREEN}Generated table with $count images in $(( (count + COLUMNS - 1) / COLUMNS )) rows${NC}"