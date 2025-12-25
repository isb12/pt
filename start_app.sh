#!/bin/bash
set -e

echo "Setting up Backend Environment..."

cd backend

# Create venv if it doesn't exist or is broken
if [ -d "venv" ] && [ ! -f "venv/bin/activate" ]; then
    echo "Detected broken venv. Removing..."
    rm -rf venv
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    # Try creating venv with pip
    if ! python3 -m venv venv; then
        echo "Standard venv creation failed. Trying without pip..."
        python3 -m venv venv --without-pip
        
        echo "Activating venv..."
        source venv/bin/activate
        
        echo "Bootstrapping pip..."
        curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
        python get-pip.py
        rm get-pip.py
    else
        echo "Venv created successfully."
        source venv/bin/activate
    fi
else
    echo "Virtual environment already exists."
    source venv/bin/activate
fi

echo "Installing requirements..."
pip uninstall -y bcrypt
pip install -r requirements.txt

echo "Starting Backend Server..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Backend running on http://localhost:8000"

cd ../frontend

echo "Installing Frontend Dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "Starting Frontend..."
npm run dev -- --host &
FRONTEND_PID=$!

echo "Frontend running on http://localhost:5173"

# Cleanup function
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT

wait
