#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting System Setup for PT Project...${NC}"

# Check if script is run as root for system-level installs
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo for system package installation"
  echo "Usage: sudo ./setup_machine.sh"
  exit 1
fi

# Detect Package Manager (simplified for Debian/Ubuntu based systems which are most common)
if command -v apt-get &> /dev/null; then
    echo "Detected apt-based system (Debian/Ubuntu/Mint)..."
    
    echo "Updating package lists..."
    apt-get update

    echo "Installing essential tools (curl, git, build-essential)..."
    apt-get install -y curl git build-essential

    echo "Installing Python 3 and venv..."
    apt-get install -y python3 python3-pip python3-venv python3-dev

    # Install Node.js
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js (LTS)..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    else
        echo "Node.js is already installed."
    fi

else
    echo "Error: This script supports apt-based systems (Ubuntu, Debian). For other distros, please install python3, python3-venv, and nodejs manually."
    exit 1
fi

# Switch back to regular user for project dependency installation to avoid permission issues
# Logic: The script is run as sudo, so we shouldn't create project files as root.
# However, finding the original user is tricky if just run with sudo.
# It's better to just tell the user to run start_app.sh as a normal user.

echo -e "${GREEN}System dependencies installed successfully!${NC}"
echo "Verifying versions:"
python3 --version
node --version
npm --version

echo -e "${GREEN}------------------------------------------------${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo "Now please run the start script as your NORMAL user (not root):"
echo "./start_app.sh"
