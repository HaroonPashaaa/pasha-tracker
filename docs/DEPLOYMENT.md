# Deployment Guide

This guide covers deploying Pasha Tracker to production.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 15+ database
- Redis 7+ cache
- Solana RPC endpoint (Helius recommended)

## Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/HaroonPashaaa/pasha-tracker.git
cd pasha-tracker

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Start with Docker Compose
docker-compose up -d
```

## Manual Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 3. Build Application

```bash
npm run build
```

### 4. Start Server

```bash
npm start
```

## Environment Variables

See `.env.example` for all required variables.

### Required

- `SOLANA_RPC_URL` - Solana RPC endpoint
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing

### Optional

- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)
- `METRICS_ENABLED` - Enable Prometheus metrics

## Production Checklist

- [ ] Change default JWT secret
- [ ] Enable SSL/TLS
- [ ] Set up reverse proxy (nginx)
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up log rotation
- [ ] Configure monitoring alerts
- [ ] Test failover procedures

## Monitoring

### Health Checks

```bash
curl http://localhost:3000/health
```

### Metrics

Prometheus metrics available at:
```
http://localhost:9090/metrics
```

### Logs

View logs:
```bash
docker-compose logs -f app
```

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### Database Scaling

- Use read replicas for analytics queries
- Consider connection pooling (PgBouncer)
- Monitor query performance

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli ping
```

### High Memory Usage

- Check cache TTL settings
- Monitor for memory leaks
- Adjust Node.js heap size

## Support

For deployment issues, open an issue on GitHub.
