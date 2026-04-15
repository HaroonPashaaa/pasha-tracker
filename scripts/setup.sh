#!/bin/bash
# Setup script for Pasha Tracker

set -e

echo "🚀 Setting up Pasha Tracker..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Found: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your API keys"
fi

# Setup database
echo "🗄️  Setting up database..."
npx prisma generate

# Create logs directory
mkdir -p logs

# Build project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Start PostgreSQL and Redis (docker-compose up -d db redis)"
echo "3. Run migrations: npx prisma migrate dev"
echo "4. Start development: npm run dev"
echo ""
