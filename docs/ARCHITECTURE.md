# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │     CLI      │  │   REST API   │         │
│  │  (Next.js)   │  │   (Node.js)  │  │   Clients    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼────────────────┼────────────────┼───────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                         API GATEWAY                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                       │  │
│  │  - Rate Limiting (per IP/user)                          │  │
│  │  - JWT Authentication                                   │  │
│  │  - Input Validation                                     │  │
│  │  - Error Handling                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      CORE SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   TRACER     │  │   INDEXER    │  │   BUNDLE     │         │
│  │  Service     │  │   Service    │  │  Detector    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CACHE      │  │   DATABASE   │  │   METRICS    │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Solana RPC   │  │   Helius     │  │  Exchanges   │         │
│  │  (Primary)   │  │    API       │  │  (Binance,   │         │
│  └──────────────┘  └──────────────┘  │  Coinbase...)│         │
│                                      └──────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Transaction Tracing

1. Client requests trace for wallet address
2. API validates request and authenticates user
3. Tracer service checks cache first
4. If not cached, fetches from Solana RPC (rate-limited)
5. Processes transactions and builds path graph
6. Checks for exchange/off-ramp matches
7. Stores result in cache and database
8. Returns structured trace to client

### Real-Time Monitoring

1. Client connects via WebSocket
2. Authenticates with JWT
3. Subscribes to wallet addresses
4. Indexer monitors blockchain via WebSocket
5. New transactions trigger broadcasts
6. Clients receive real-time updates

## Database Schema

See `prisma/schema.prisma` for complete schema.

Key entities:
- **Wallet**: Tracked wallets with labels and risk scores
- **Transaction**: All indexed transactions
- **Bundle**: Detected wallet clusters
- **ExchangeWallet**: Known exchange addresses
- **Trace**: Historical trace results

## Rate Limiting Strategy

- **Per API**: 200ms minimum between calls
- **Per User**: Configurable based on tier
- **Per IP**: 100 requests per 15 minutes
- **Retry Logic**: Exponential backoff on 429 errors

## Security Model

- All endpoints require authentication (except health)
- JWT tokens with short expiration
- API keys for programmatic access
- Rate limiting prevents abuse
- No private key storage
- Read-only blockchain operations

## Scalability Considerations

- Stateless API servers (horizontal scaling)
- Redis for distributed caching
- PostgreSQL for persistent storage
- WebSocket rooms for efficient broadcasting
- Queue system for heavy operations
