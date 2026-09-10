#!/usr/bin/env bash
# Quick local runner script for development

echo "Starting VaultGuard Full Stack locally..."

# Start Docker containers if docker is present
if command -v docker &> /dev/null; then
    echo "Starting Docker Compose services..."
    docker compose up -d
else
    echo "Docker not detected on host. Services can be run individually or deployed to Linux host."
fi
