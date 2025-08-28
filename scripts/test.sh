#!/bin/bash

# FoodDrop Test Runner Script

echo "🧪 Running FoodDrop Tests"
echo "========================"

# Exit on any error
set -e

# Run shared package type checking
echo "📝 Type checking shared package..."
npm run typecheck --workspace=packages/shared

# Build shared package
echo "🔨 Building shared package..."
npm run build --workspace=packages/shared

# Run web app linting
echo "🔍 Linting web app..."
npm run lint --workspace=apps/web

# Run web app type checking  
echo "📝 Type checking web app..."
npm run typecheck --workspace=apps/web

# Run web app tests
echo "🧪 Running web app tests..."
npm run test --workspace=apps/web

# Build web app
echo "🔨 Building web app..."
npm run build --workspace=apps/web

echo "✅ All tests passed!"