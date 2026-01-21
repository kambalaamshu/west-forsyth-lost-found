#!/bin/bash

echo "================================================"
echo "West Forsyth Lost & Found - Setup Script"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "================================================"
echo "⚙️  Firebase Setup Required"
echo "================================================"
echo ""
echo "Before running the app, you need to:"
echo ""
echo "1. Create a Firebase project at https://console.firebase.google.com"
echo "2. Enable Authentication, Firestore, and Storage"
echo "3. Copy .env.local.template to .env.local"
echo "4. Add your Firebase credentials to .env.local"
echo ""
echo "Commands:"
echo "  cp .env.local.template .env.local"
echo "  # Then edit .env.local with your Firebase config"
echo ""
echo "================================================"
echo "🚀 Ready to Start!"
echo "================================================"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see README.md"
echo "================================================"
