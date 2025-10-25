#!/bin/bash

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🧹 Cleaning up Docker images..."
docker-compose build --no-cache backend

echo "🚀 Starting containers..."
docker-compose up -d

echo "📋 Showing logs..."
docker-compose logs -f backend