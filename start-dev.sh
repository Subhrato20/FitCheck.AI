#!/bin/bash

# FitCheck.AI Development Startup Script
echo "🚀 Starting FitCheck.AI Development Environment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the FitCheck.AI root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Start backend
echo "📡 Starting Flask Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run backend setup first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one from env.template"
    echo "   Make sure to add your GOOGLE_API_KEY"
fi

# Start backend in background
if check_port 8080; then
    echo "⚠️  Port 8080 is already in use. Backend might already be running."
else
    echo "🔄 Starting Flask server on http://localhost:8080"
    python app.py &
    BACKEND_PID=$!
    echo "✅ Backend started with PID: $BACKEND_PID"
fi

# Go back to root and start frontend
cd ../frontend

echo ""
echo "🎨 Starting React Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Start frontend
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Frontend might already be running."
else
    echo "🔄 Starting Vite dev server on http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started with PID: $FRONTEND_PID"
fi

echo ""
echo "🎉 Development environment started!"
echo "=================================="
echo "📡 Backend:  http://localhost:8080"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ All services stopped"; exit 0' INT

# Keep script running
wait
