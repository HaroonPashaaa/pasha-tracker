# Deployment Guide

> Deploying Pasha Tracker to production

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Monitoring](#monitoring)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Solana RPC endpoint (Helius recommended)

## Docker Deployment

### Quick Start

```bash
# Clone repository
git clone https://github.com/HaroonPashaaa/pasha-tracker.git
cd pasha-tracker

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run seed
```

### Services

- **app**: Main API server (port 3000)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)

## Manual Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Create database
createdb pasha_tracker

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### 3. Setup Redis

```bash
# Install Redis
# Ubuntu/Debian:
sudo apt-get install redis-server

# macOS:
brew install redis
brew services start redis
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 5. Build and Start

```bash
npm run build
npm start
```

## Cloud Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render

1. Connect GitHub repository
2. Add environment variables
3. Deploy

### AWS ECS

```bash
# Build image
docker build -t pasha-tracker .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URL
docker tag pasha-tracker:latest $ECR_URL/pasha-tracker:latest
docker push $ECR_URL/pasha-tracker:latest

# Deploy to ECS
aws ecs update-service --cluster pasha-tracker --service api --force-new-deployment
```

## Monitoring

### Health Checks

- `GET /health` - Service health
- `GET /stats` - Rate limiting stats
- `GET /metrics` - Prometheus metrics

### Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all levels)
- `logs/error.log` (errors only)

### Alerts

Set up alerts for:
- High error rates
- Rate limit exhaustion
- Database connection failures
- RPC endpoint failures

## SSL/TLS

### With Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name api.pasha-tracker.io;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backup

### Database

```bash
# Backup
pg_dump pasha_tracker > backup.sql

# Restore
psql pasha_tracker < backup.sql
```

### Redis

```bash
# Backup
redis-cli SAVE
cp /var/lib/redis/dump.rdb backup.rdb
```
