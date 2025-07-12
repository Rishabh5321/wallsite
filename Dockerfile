# Use a Node.js LTS image as a base
FROM node:20-slim

# Install dependencies required for the gallery script
RUN apt-get update && apt-get install -y imagemagick && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package management files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod=false

# Copy application files, but NOT the src directory
# The .dockerignore file will prevent 'src' from being copied
COPY . .

# Create the src directory for mounting, ensuring it exists
RUN mkdir -p /app/src

# Make scripts executable
RUN chmod +x /app/scripts/generate_gallery.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose the port for the esbuild dev server
EXPOSE 8000

# Set the entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]