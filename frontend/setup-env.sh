#!/bin/bash

# Frontend Environment Setup Script

echo "🚀 Setting up frontend environment for API integration..."

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
    echo "✅ Created .env.local with API URL"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend is not running. Please start it with:"
    echo "   cd ../backend && python main.py"
fi

echo "🎉 Frontend environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure backend is running: cd ../backend && python main.py"
echo "2. Start frontend: npm run dev"
echo "3. Open http://localhost:3000 to test the integration"
