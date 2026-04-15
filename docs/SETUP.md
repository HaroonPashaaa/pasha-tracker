# Environment Setup Guide

## Quick Start

### Prerequisites

- Node.js 18+ (`node -v`)
- npm 9+ (`npm -v`)
- Docker (optional, for local database)

### 1. Clone Repository

```bash
git clone https://github.com/HaroonPashaaa/pasha-tracker.git
cd pasha-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required variables:
- `SOLANA_RPC_URL` - Helius RPC recommended
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Random string for JWT signing

### 4. Setup Database

**Option A: Docker (Recommended)**
```bash
docker-compose up -d db redis
```

**Option B: Local Installation**
```bash
# PostgreSQL
createdb pasha_tracker

# Redis
redis-server
```

### 5. Run Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Seed Data

```bash
npm run seed
```

### 7. Start Development Server

```bash
npm run dev
```

## Verification

Check if everything works:

```bash
# API health
curl http://localhost:3000/health

# Run tests
npm test

# Check linting
npm run lint
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check Redis
redis-cli ping
```

### Module Not Found

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

## IDE Setup

### VS Code Extensions

- ESLint
- Prettier
- Prisma
- TypeScript Importer

### Recommended Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.workingDirectories": ["./"]
}
```

## Next Steps

- Read [API Documentation](API.md)
- Check [Architecture Guide](ARCHITECTURE.md)
- Review [Contributing Guidelines](CONTRIBUTING.md)
