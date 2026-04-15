# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-04-15

### Added
- Initial release of Pasha Tracker
- Rate-limited Solana RPC client with exponential backoff
- Transaction tracer with backward/forward path reconstruction
- Bundle detection for multi-wallet analysis
- Exchange wallet identification (Binance, Coinbase, Kraken)
- Fiat off-ramp detection system
- REST API with Express.js
- JWT authentication and authorization
- PostgreSQL database with Prisma ORM
- Redis caching layer
- Metrics collection with Prometheus export
- Docker deployment support
- GitHub Actions CI/CD pipeline
- Comprehensive test suite (Jest)
- Full API documentation
- Whitepaper with technical architecture

### Security
- Rate limiting on all external APIs
- JWT-based authentication
- Input validation and sanitization
- Encrypted API key storage

## [Unreleased]

### Planned
- WebSocket real-time updates
- Browser extension
- Additional exchange integrations
- Machine learning for pattern detection
- Mobile app
- Multi-chain support (Ethereum, BSC)
