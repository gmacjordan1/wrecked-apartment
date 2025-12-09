#!/bin/bash

echo "🏠 Setting up Wrecked Apartment..."
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application, run:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Backend server on http://localhost:3001"
echo "  - Frontend on http://localhost:3000"
echo ""

