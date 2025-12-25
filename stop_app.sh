#!/bin/bash

# Script to stop the application and free up ports

echo "Stopping application processes..."

# 1. Kill processes running on known ports
echo "Cleaning up ports 8000 (Backend) and 5173 (Frontend)..."
fuser -k -n tcp 8000 2>/dev/null || true
fuser -k -n tcp 5173 2>/dev/null || true

# 2. Kill lingering uvicorn, vite, and start scripts
echo "Stopping background scripts and servers..."
pkill -9 -f "uvicorn app.main:app" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "start_app.sh" 2>/dev/null || true

echo "Done. All application processes have been stopped."
