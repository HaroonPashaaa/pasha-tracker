# 🔍 Pasha Tracker

> **Comprehensive Solana Blockchain Transaction Tracing & Forensics**

[![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF?style=flat&logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=flat&logo=redis)](https://redis.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Mission

Pasha Tracker goes beyond surface-level wallet tracking. While most tools only show where SOL was sent, we reveal the **entire money trail** — from origin wallet, through every intermediary, through exchanges, and all the way to fiat off-ramp points.

### What Makes Us Different

| Feature | Standard Explorer | Pasha Tracker |
|---------|------------------|---------------|
| Transaction View | Single TX | Full path reconstruction |
| Wallet Analysis | Balance only | Origin tracing + clustering |
| Exchange Detection | Manual | Automated CEX identification |
| Fiat Tracking | ❌ Not available | ✅ Off-ramp flagging |
| Bundle Detection | ❌ Not available | ✅ Multi-wallet entity linking |
| Real-time | Delayed | Live monitoring |

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/HaroonPashaaa/pasha-tracker.git
cd pasha-tracker

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your RPC endpoints and API keys

# Run database migrations
npm run db:migrate

# Start the tracker
npm run dev
```

## 📊 Core Capabilities

### 1. Wallet Origin Tracing
Trace any wallet address back to its origin through unlimited hops:
```typescript
const trace = await tracer.traceOrigin(walletAddress);
// Returns full path: origin → intermediaries → destination
```

### 2. Bundle Detection
Identify when one entity controls multiple wallets:
```typescript
const bundles = await clustering.detectBundles(tokenAddress);
// Returns wallet clusters buying the same token
```

### 3. Transaction Path Visualization
Structured data showing complete money flow:
```json
{
  "origin": "Wallet_A",
  "path": [
    {"wallet": "Wallet_B", "amount": 1000, "time": "2s"},
    {"wallet": "Binance_Hot", "amount": 1000, "time": "5m", "exchange": true},
    {"wallet": "Fiat_Offramp", "amount": 995, "time": "1h", "fiat": true}
  ]
}
```

### 4. Real-Time Monitoring
Live stream of wallet transactions:
```typescript
await indexer.subscribe(walletAddress, (tx) => {
  console.log(`New transaction: ${tx.signature}`);
});
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PASHA TRACKER                        │
├─────────────────────────────────────────────────────────┤
│  CORE LAYER                                             │
│  ├── indexer/        Real-time & historical indexing   │
│  ├── tracer/         Path reconstruction logic         │
│  └── clustering/     Wallet bundle detection           │
├─────────────────────────────────────────────────────────┤
│  EXCHANGE LAYER                                         │
│  ├── known-wallets/  Database of exchange hot wallets  │
│  └── api-connectors/ Exchange API integrations         │
├─────────────────────────────────────────────────────────┤
│  FIAT LAYER                                             │
│  └── offramp-detector/ Fiat conversion identification  │
├─────────────────────────────────────────────────────────┤
│  API LAYER                                              │
│  └── routes/         REST API endpoints                │
├─────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                     │
│  ├── dashboard/      Next.js web interface             │
│  └── extension/      Browser extension (Phase 2)       │
└─────────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints

### Wallet Tracing
```http
POST /api/v1/trace/origin
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "maxDepth": 10,
  "includeExchanges": true
}
```

### Bundle Detection
```http
POST /api/v1/detect/bundles
{
  "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "timeWindow": "24h"
}
```

### Real-Time Monitoring
```http
WS /api/v1/ws/wallet/:address
# WebSocket stream of live transactions
```

## 📁 Project Structure

```
pasha-tracker/
├── README.md                 # This file
├── WHITEPAPER.md            # Detailed vision & architecture
├── LICENSE                  # MIT License
├── .env.example             # Environment template
├── core/                    # Core business logic
│   ├── indexer/            # Blockchain indexing
│   ├── tracer/             # Path reconstruction
│   └── clustering/         # Entity detection
├── exchange-layer/         # Exchange integrations
│   ├── known-wallets/      # Hot wallet database
│   └── api-connectors/     # API clients
├── fiat-layer/             # Fiat off-ramp detection
├── api/                    # REST API
├── dashboard/              # Web UI (Next.js)
├── extension/              # Browser extension
└── docs/                   # Technical documentation
```

## ⚙️ Configuration

### Environment Variables

```bash
# Solana RPC (required)
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
SOLANA_WS_URL=wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Database (required)
DATABASE_URL=postgresql://user:pass@localhost:5432/pasha_tracker
REDIS_URL=redis://localhost:6379/0

# Exchange APIs (optional)
BINANCE_API_KEY=your_key
COINBASE_API_KEY=your_key

# Rate Limiting
RATE_LIMIT_DELAY_MS=200
MAX_RETRIES=3
BACKOFF_MULTIPLIER=2

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
```

## 🛡️ Rate Limit Protection

Pasha Tracker implements comprehensive rate limiting:

- **200ms minimum delay** between external API calls
- **Exponential backoff** on 429 errors
- **Request queuing** for bulk operations
- **Per-API tracking** with individual limits
- **Automatic retry** with jitter

```typescript
// Example: API call with rate limiting
const result = await rateLimiter.execute(async () => {
  return await solanaClient.getTransaction(signature);
});
```

## 📈 Roadmap

### Phase 1: Core Foundation ✅ In Progress
- [x] Repository structure
- [ ] Real-time indexer
- [ ] Historical tracer
- [ ] Bundle detection
- [ ] REST API

### Phase 2: User Interface
- [ ] Next.js dashboard
- [ ] Real-time WebSocket updates
- [ ] Transaction graphs
- [ ] Wallet watchlists

### Phase 3: Browser Extension
- [ ] Chrome/Firefox extension
- [ ] Explorer overlays
- [ ] One-click tracing
- [ ] Live notifications

### Phase 4: Exchange & Fiat Layers
- [ ] Known exchange wallet database
- [ ] API connector integrations
- [ ] Fiat off-ramp detection
- [ ] Compliance reporting

### Phase 5: Public API Platform
- [ ] Tiered API access (free/paid)
- [ ] API key management
- [ ] Usage analytics
- [ ] Enterprise features

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dev dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

## 📚 Documentation

- [Whitepaper](WHITEPAPER.md) - Vision and architecture
- [API Documentation](docs/API.md) - Endpoint reference
- [Architecture](docs/ARCHITECTURE.md) - System design
- [Contributing](docs/CONTRIBUTING.md) - Contribution guide

## ⚠️ Disclaimer

Pasha Tracker is for **educational and research purposes**. Respect privacy and comply with all applicable laws when analyzing blockchain data.

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

**Built with ❤️ by Pasha**

*Tracing the untraceable.*
