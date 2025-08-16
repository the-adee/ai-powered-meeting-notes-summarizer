#!/bin/bash

# Frontend Deployment Script for Vercel
# This script helps prepare and deploy the frontend to Vercel

echo "🚀 Preparing frontend for Vercel deployment..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the project
echo "🏗️ Building project..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in dist/ directory"
else
    echo "❌ Build failed!"
    exit 1
fi

# Preview the build locally (optional)
read -p "🔍 Would you like to preview the build locally? (y/n): " preview
if [ "$preview" = "y" ] || [ "$preview" = "Y" ]; then
    echo "🌐 Starting preview server..."
    npm run preview
fi

echo ""
echo "🎉 Frontend is ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repo to Vercel"
echo "3. Set VITE_API_URL environment variable in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "Environment variable to set in Vercel:"
echo "VITE_API_URL=https://your-backend-api.vercel.app/api"
