#!/usr/bin/env bash

# Setup script for new repositories created from the template.
# This script is designed to be run once by a GitHub Actions workflow.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
TEMPLATE_REPO="Rishabh5321/wallsite"
TEMPLATE_VERCEL_PROJECT="Rishabh5321-wallsite"
README_FILE="readme.md"

# --- Main Logic ---
echo "🚀 Starting repository setup..."

# 1. Get the current repository name from the environment variable provided by GitHub Actions.
if [ -z "$GITHUB_REPOSITORY" ]; then
    echo "❌ Error: GITHUB_REPOSITORY environment variable is not set."
    exit 1
fi
CURRENT_REPO="$GITHUB_REPOSITORY"
OWNER=$(echo "$CURRENT_REPO" | cut -d'/' -f1)
REPO_NAME=$(echo "$CURRENT_REPO" | cut -d'/' -f2)
NEW_VERCEL_PROJECT="$OWNER-$REPO_NAME"

echo "✅ Detected repository: $CURRENT_REPO"

# 2. Check if the script is running in the template repository itself.
if [ "$CURRENT_REPO" == "$TEMPLATE_REPO" ]; then
    echo "✅ This is the template repository. No changes needed. Exiting."
    exit 0
fi

# 3. Replace URLs in README.md
echo "🔄 Updating URLs in $README_FILE..."

# 3a. Replace repository URL for deployment buttons
sed -i "s|$TEMPLATE_REPO|$CURRENT_REPO|g" "$README_FILE"

# 3b. Replace Vercel project name for status badge and live gallery link
sed -i "s|$TEMPLATE_VERCEL_PROJECT|$NEW_VERCEL_PROJECT|g" "$README_FILE"

# 3c. Remove the Netlify status badge as the site ID cannot be predicted.
sed -i '/img.shields.io\/netlify/d' "$README_FILE"

echo "✅ README.md updated successfully."
echo "🎉 Repository setup complete!"