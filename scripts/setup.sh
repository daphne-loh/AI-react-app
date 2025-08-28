#!/bin/bash

# FoodDrop Local Development Setup Script

echo "🍜 FoodDrop Development Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI installed"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

echo "📦 Installing workspace dependencies..."
npm install --workspace=apps/web
npm install --workspace=packages/shared

# Build shared package
echo "🔨 Building shared package..."
npm run build --workspace=packages/shared

# Copy environment variables template
if [ ! -f .env.local ]; then
    echo "📝 Creating environment variables file..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your Firebase configuration"
fi

# Initialize Firebase (if not already done)
if [ ! -f .firebaserc ]; then
    echo "🔥 Initializing Firebase project..."
    echo "Please run 'firebase init' manually to configure your Firebase project"
else
    echo "✅ Firebase project already initialized"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Firebase configuration"
echo "2. Run 'firebase init' if not done already"
echo "3. Start development server: npm run dev"
echo "4. Open http://localhost:5173"
echo ""
echo "Happy coding! 🚀"