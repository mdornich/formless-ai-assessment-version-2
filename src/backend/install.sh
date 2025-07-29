#!/bin/bash

echo "🚀 Setting up Formless AI Assessment Backend..."

# Check Node.js version
node_version=$(node --version | cut -d'v' -f2)
required_version="18.0.0"

if ! node -e "process.exit(require('semver').gte('$node_version', '$required_version'))" 2>/dev/null; then
    echo "❌ Node.js version $required_version or higher is required. Current version: $node_version"
    exit 1
fi

echo "✅ Node.js version check passed ($node_version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your actual configuration values."
else
    echo "✅ .env file already exists"
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Run type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi

echo "✅ Type check passed"

echo ""
echo "🎉 Backend setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with actual configuration values:"
echo "   - SUPABASE_URL and SUPABASE_ANON_KEY"
echo "   - GEMINI_API_KEY"
echo "   - Other optional configurations"
echo ""
echo "2. Ensure your Supabase database has the required schema"
echo "   (see ../../infrastructure/supabase_schema.sql)"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Test the API endpoints:"
echo "   curl http://localhost:5000/health"
echo ""
echo "Happy coding! 🚀"