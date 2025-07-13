# Use a Node.js LTS image as a base, which is good for running build tools
FROM node:20-slim

# Install dependencies required for the gallery script (ImageMagick) and pnpm
RUN apt-get update && \
    apt-get install -y imagemagick && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy package management files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies, including devDependencies needed for the build
RUN pnpm install --prod=false

# Copy the rest of the application files.
# The .dockerignore file should prevent the local 'src', 'public', and 'node_modules'
# from being copied, which is what we want.
COPY . .

# Ensure the entrypoint script is executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose the port the server will run on
EXPOSE 8000

# Set the entrypoint to our custom script.
# This will run every time the container starts.
ENTRYPOINT ["./docker-entrypoint.sh"]