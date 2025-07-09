#!/usr/bin/env bash

# Setup script for new repositories created from the template.
# This script is designed to be run once by a GitHub Actions workflow.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
TEMPLATE_REPO="Rishabh5321/wallpapers"
TEMPLATE_VERCEL_APP="rishabh5321-wallpapers"
README_FILE="readme.md"
REPO_DESCRIPTION="A curated collection of stunning wallpapers, ready for one-click deployment."

# --- Main Logic ---
echo "🚀 Starting repository setup..."

# 1. Get the current repository name from the environment variable provided by GitHub Actions.
# The GITHUB_REPOSITORY variable is in the format "owner/repo-name".
if [ -z "$GITHUB_REPOSITORY" ]; then
    echo "❌ Error: GITHUB_REPOSITORY environment variable is not set."
    exit 1
fi
CURRENT_REPO="$GITHUB_REPOSITORY"
OWNER=$(echo "$CURRENT_REPO" | cut -d'/' -f1)
REPO_NAME=$(echo "$CURRENT_REPO" | cut -d'/' -f2)
VERCEL_APP_NAME="$OWNER-$REPO_NAME"

echo "✅ Detected repository: $CURRENT_REPO"
echo "✅ Owner: $OWNER"
echo "✅ Repo name: $REPO_NAME"
echo "✅ Vercel app name: $VERCEL_APP_NAME"

# 2. Check if the script is running in the template repository itself.
# If so, exit gracefully to avoid making changes to the template.
if [ "$CURRENT_REPO" == "$TEMPLATE_REPO" ]; then
    echo "✅ This is the template repository. No changes needed. Exiting."
    exit 0
fi

# 3. Replace all occurrences of the template repository URL in the README.md file.
# The 'sed' command is used for in-place replacement.
echo "🔄 Updating URLs in $README_FILE..."
sed -i "s|$TEMPLATE_REPO|$CURRENT_REPO|g" "$README_FILE"
sed -i "s|$TEMPLATE_VERCEL_APP|$VERCEL_APP_NAME|g" "$README_FILE"
echo "✅ README.md updated successfully."

# 4. Update the repository description on GitHub using the GitHub CLI ('gh').
echo "🔄 Updating repository description..."
gh repo edit "$CURRENT_REPO" --description "$REPO_DESCRIPTION"
echo "✅ Repository description updated successfully."

echo "🎉 Repository setup complete!"