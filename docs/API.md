# API Documentation

> Complete reference for Pasha Tracker REST API

## Base URL

```
Production: https://api.pasha-tracker.io/v1
Local: http://localhost:3000/api/v1
```

## Authentication

All API endpoints require authentication via JWT token.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Wallet Tracing

#### POST /trace/origin

Trace funds backward from a wallet to their origin.

**Request:**
```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "maxDepth": 10,
  "includeExchanges": true
}
```

**Response:**
```json
{
  "originWallet": "3fG9...hJ2p",
  "destinationWallet": "7xKX...gAsU",
  "hops": [
    {
      "from": "3fG9...hJ2p",
      "to": "Binance_Hot_1",
      "amount": 1000.5,
      "timestamp": "2026-04-15T10:25:00Z",
      "signature": "8k2m...4n7b"
    },
    {
      "from": "Binance_Hot_1",
      "to": "7xKX...gAsU",
      "amount": 1000.0,
      "timestamp": "2026-04-15T10:30:00Z",
      "signature": "5x7a...9k2m"
    }
  ],
  "pathLength": 2,
  "duration": 300000
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| walletAddress | string | Yes | Solana wallet address (32-44 chars) |
| maxDepth | integer | No | Maximum trace depth (1-20, default: 10) |
| includeExchanges | boolean | No | Include exchange identification |

#### POST /trace/forward

Trace funds forward from a wallet to their destination.

**Request:**
```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "maxDepth": 10
}
```

**Response:** Similar to /trace/origin

### Bundle Detection

#### POST /detect/bundles

Detect wallet bundles buying the same token.

**Request:**
```json
{
  "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "timeWindow": "24h",
  "minWallets": 3
}
```

**Response:**
```json
{
  "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "bundles": [
    {
      "id": "bundle_1",
      "wallets": ["wallet1", "wallet2", "wallet3"],
      "confidence": 0.85,
      "totalVolume": 50000,
      "firstPurchase": "2026-04-15T10:00:00Z"
    }
  ],
  "totalBundles": 1
}
```

### Wallet Profile

#### GET /wallet/:address/profile

Get comprehensive wallet profile.

**Response:**
```json
{
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "balance": 5000.5,
  "transactionCount": 150,
  "firstSeen": "2025-01-15T00:00:00Z",
  "labels": ["whale", "active_trader"],
  "riskScore": 0.3,
  "relatedWallets": ["wallet1", "wallet2"],
  "exchangeDeposits": [
    {
      "exchange": "Binance",
      "totalVolume": 100000,
      "lastDeposit": "2026-04-15T10:30:00Z"
    }
  ]
}
```

### System

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T12:00:00Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

#### GET /stats

Get API rate limiting and usage statistics.

**Response:**
```json
{
  "rateLimitStats": {
    "totalCalls": 1500,
    "failedCalls": 5,
    "averageDuration": 245,
    "retryRate": 2
  },
  "status": "operational"
}
```

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid JWT |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Rate Limits

- **Authenticated:** 100 requests per 15 minutes
- **Unauthenticated:** 10 requests per 15 minutes

## WebSocket API

Connect for real-time updates:

```javascript
const ws = new WebSocket('wss://api.pasha-tracker.io/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    walletAddress: '7xKX...gAsU'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New transaction:', data);
};
```
