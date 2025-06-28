#!/usr/bin/env bash

# 🎨 Wallpaper Gallery Generator (GitHub-Optimized)
#
# Scans the current directory for images and generates a paginated Markdown gallery,
# perfect for GitHub READMEs and repository documentation.

# --- Configuration ---
IMAGES_PER_PAGE=9
COLUMNS=3
IMAGE_WIDTH=300

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Warning: This directory does not appear to be a git repository."
    echo "    Please ensure you are running this script from the correct location."
fi

echo "🎨 Initializing Wallpaper Gallery Generation..."

# Scan for image files and sort them naturally
echo "🔍 Searching for images (.png, .jpg, .jpeg, .gif, .webp)..."
mapfile -t images < <(find ./src -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | sort -V)

total_images=${#images[@]}
if [ $total_images -eq 0 ]; then
    echo "❌ Error: No images found in the current directory."
    echo "    Please add some images and try again."
    exit 1
fi

# Calculate the total number of pages
total_pages=$(( (total_images + IMAGES_PER_PAGE - 1) / IMAGES_PER_PAGE ))

echo "🖼️  Found $total_images images. Generating $total_pages pages..."

# --- Function Definitions ---

# Generates the navigation links for the pages
generate_navigation() {
    local current_page=$1
    local total_pages=$2
    local filename=$3

    echo "" >> "$filename"
    echo "<div align=\"center\">" >> "$filename"
    echo "" >> "$filename"

    # Previous Page Link
    if [ $current_page -gt 1 ]; then
        local prev_page=$((current_page - 1))
        if [ $prev_page -eq 1 ]; then
            echo "  <a href=\"readme.md\">⬅️ Previous</a>" >> "$filename"
        else
            echo "  <a href=\"readme-page-$prev_page.md\">⬅️ Previous</a>" >> "$filename"
        fi
    else
        echo "  <span style=\"color: #999;\">⬅️ Previous</span>" >> "$filename"
    fi

    echo "  &nbsp;&nbsp; | &nbsp;&nbsp;" >> "$filename"
    echo "  Page $current_page of $total_pages" >> "$filename"
    echo "  &nbsp;&nbsp; | &nbsp;&nbsp;" >> "$filename"

    # Next Page Link
    if [ $current_page -lt $total_pages ]; then
        local next_page=$((current_page + 1))
        echo "  <a href=\"readme-page-$next_page.md\">Next ➡️</a>" >> "$filename"
    else
        echo "  <span style=\"color: #999;\">Next ➡️</span>" >> "$filename"
    fi

    echo "" >> "$filename"
    echo "</div>" >> "$filename"

    # Detailed Page Links
    echo "<div align=\"center\" style=\"margin-top: 10px;\">" >> "$filename"
    echo "  <small>" >> "$filename"
    echo -n "  " >> "$filename"
    for ((p=1; p<=total_pages; p++)); do
        if [ $p -eq $current_page ]; then
            echo -n "<strong>[$p]</strong>" >> "$filename"
        else
            if [ $p -eq 1 ]; then
                echo -n "<a href=\"readme.md\">$p</a>" >> "$filename"
            else
                echo -n "<a href=\"readme-page-$p.md\">$p</a>" >> "$filename"
            fi
        fi
        if [ $p -lt $total_pages ]; then
            echo -n " • " >> "$filename"
        fi
    done
    echo "" >> "$filename"
    echo "  </small>" >> "$filename"
    echo "</div>" >> "$filename"
}

# Generates the header for each page
generate_header() {
    local current_page=$1
    local total_pages=$2
    local filename=$3

    {
        echo "# 🖼️ Wallpaper Gallery"
        echo ""
        if [ $total_pages -gt 1 ]; then
            echo "*Page $current_page of $total_pages — Showcasing a collection of $total_images stunning wallpapers.*"
        else
            echo "*A curated collection of $total_images stunning wallpapers.*"
        fi
        echo ""
    } > "$filename"
}

# Generates the image table for the current page
generate_table() {
    local start_idx=$1
    local end_idx=$2
    local filename=$3

    echo "" >> "$filename"
    echo "<table width=\"100%\" align=\"center\">" >> "$filename"

    local count=0
    for ((i=start_idx; i<=end_idx && i<total_images; i++)); do
        if (( count % COLUMNS == 0 )); then
            echo "  <tr align=\"center\">" >> "$filename"
        fi

        local img="${images[i]}"
        local img_clean="${img#./src/}"
        local img_name=$(basename "$img_clean" | sed 's/\.[^.]*$//')

        echo "    <td width=\"${IMAGE_WIDTH}px\" align=\"center\">" >> "$filename"
        echo "      <a href=\"src/$img_clean\">" >> "$filename"
        echo "        <img src=\"src/thumbnails/$img_clean\" width=\"${IMAGE_WIDTH}px\" alt=\"Wallpaper: $img_name\">" >> "$filename"
        echo "      </a>" >> "$filename"
        echo "      <br>" >> "$filename"
        echo "      <small><i>$img_name</i></small>" >> "$filename"
        echo "    </td>" >> "$filename"

        ((count++))

        if (( count % COLUMNS == 0 )) || (( i == end_idx )) || (( i == total_images - 1 )); then
            echo "  </tr>" >> "$filename"
        fi
    done

    echo "</table>" >> "$filename"
}

# --- Page Generation ---

for ((page=1; page<=total_pages; page++)); do
    start_idx=$(( (page - 1) * IMAGES_PER_PAGE ))
    end_idx=$(( start_idx + IMAGES_PER_PAGE - 1 ))

    if [ $page -eq 1 ]; then
        filename="readme.md"
    else
        filename="readme-page-$page.md"
    fi

    echo "📄 Generating $filename..."

    generate_header $page $total_pages "$filename"
    echo "" >> "$filename"
    echo "---" >> "$filename"

    if [ $total_pages -gt 1 ]; then
        generate_navigation $page $total_pages "$filename"
    fi

    generate_table $start_idx $end_idx "$filename"

    if [ $total_pages -gt 1 ]; then
        echo "" >> "$filename"
        echo "---" >> "$filename"
        generate_navigation $page $total_pages "$filename"
    fi

    # Footer with licensing/copyright note
    echo "" >> "$filename"
    echo "---" >> "$filename"
    echo "<div align=\"center\">" >> "$filename"
    echo "  <small>This gallery was automatically generated. ✨</small>" >> "$filename"
    echo "  <br>" >> "$filename"
    echo "</div>" >> "$filename"
done

# --- Index File Generation ---

if [ $total_pages -gt 1 ]; then
    echo "📑 Generating index.md..."
    {
        echo "# 📂 Wallpaper Gallery Index"
        echo ""
        echo "Welcome! This gallery contains **$total_images wallpapers** spread across **$total_pages pages**."
        echo ""
        echo "## Quick Navigation"
        echo ""
        echo "| Page | Wallpapers |"
        echo "|:----:|:----------:|"
        for ((page=1; page<=total_pages; page++)); do
            start_img=$(( (page - 1) * IMAGES_PER_PAGE + 1 ))
            end_img=$(( page * IMAGES_PER_PAGE ))
            [ $end_img -gt $total_images ] && end_img=$total_images

            if [ $page -eq 1 ]; then
                echo "| [**Page $page**](readme.md) | Images $start_img - $end_img |"
            else
                echo "| [**Page $page**](readme-page-$page.md) | Images $start_img - $end_img |"
            fi
        done
        echo ""
        echo "<div align=\"center\">"
        echo "  <a href=\"readme.md\">🚀 Start Browse from Page 1</a>"
        echo "</div>"
        echo ""
        echo "---"
        echo "### 📊 Gallery Stats"
        echo "- **Total Images:** $total_images"
        echo "- **Images per Page:** $IMAGES_PER_PAGE"
        echo "- **Image Formats:** PNG, JPG, JPEG, GIF, WebP"
    } > index.md
fi

# --- Completion ---

echo ""
echo "✅ Done! Your wallpaper gallery has been successfully generated."
echo "---"
echo "📊 **Statistics:**"
echo "   - Total Images: $total_images"
echo "   - Pages Created: $total_pages"
echo "   - Images per Page: $IMAGES_PER_PAGE"
echo ""

if [ $total_pages -gt 1 ]; then
    echo "📁 **Generated Files:**"
    echo "   - readme.md (Page 1)"
    for ((page=2; page<=total_pages; page++)); do
        echo "   - readme-page-$page.md"
    done
    echo "   - index.md"
    echo ""
    echo "🚀 **Get Started by viewing [readme.md](readme.md) or the [index.md](index.md) file.**"
else
    echo "📁 **Generated File:**"
    echo "   - readme.md"
fi
