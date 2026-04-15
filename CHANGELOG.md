# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Pasha Tracker
- Comprehensive Solana blockchain transaction tracing
- Rate-limited RPC client with exponential backoff
- Bundle detection for wallet clustering
- Entity profiling with risk scoring
- Exchange wallet identification (Binance, Coinbase, Kraken)
- Fiat off-ramp detection
- Real-time WebSocket monitoring
- REST API with comprehensive endpoints
- PostgreSQL database with Prisma ORM
- Redis caching layer
- Prometheus metrics collection
- Docker deployment support
- GitHub Actions CI/CD pipeline
- Comprehensive test suite

## [1.0.0] - 2026-04-15

### Added
- Core tracing functionality (backward and forward)
- Wallet origin tracking through multiple hops
- Multi-wallet bundle detection algorithm
- Exchange API connectors with rate limiting
- Off-ramp detection for fiat conversion points
- JWT authentication and role-based access
- Request validation with Joi schemas
- Error handling middleware
- WebSocket support for real-time updates
- Comprehensive documentation (README, WHITEPAPER, API docs)
- Docker and docker-compose configuration
- CI/CD pipeline with automated testing
- MIT License

### Security
- Rate limiting on all external APIs
- JWT token authentication
- Input validation on all endpoints
- No secrets committed to repository

### Infrastructure
- PostgreSQL database schema
- Redis caching with tag invalidation
- Prometheus metrics endpoint
- Structured logging with Winston
- Health check endpoints
