# Frontend Deployment Script for Vercel (PowerShell)
# This script helps prepare and deploy the frontend to Vercel

Write-Host "🚀 Preparing frontend for Vercel deployment..." -ForegroundColor Cyan

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the frontend directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run linting
Write-Host "🔍 Running linter..." -ForegroundColor Yellow
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Linting issues found, but continuing..." -ForegroundColor Yellow
}

# Build the project
Write-Host "🏗️ Building project..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (Test-Path "dist") {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📁 Build output in dist/ directory" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Preview the build locally (optional)
$preview = Read-Host "🔍 Would you like to preview the build locally? (y/n)"
if ($preview -eq "y" -or $preview -eq "Y") {
    Write-Host "🌐 Starting preview server..." -ForegroundColor Cyan
    npm run preview
}

Write-Host ""
Write-Host "🎉 Frontend is ready for Vercel deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub"
Write-Host "2. Connect your repo to Vercel"
Write-Host "3. Set VITE_API_URL environment variable in Vercel dashboard"
Write-Host "4. Deploy!"
Write-Host ""
Write-Host "Environment variable to set in Vercel:" -ForegroundColor Yellow
Write-Host "VITE_API_URL=https://your-backend-api.vercel.app/api" -ForegroundColor White
