# Performance Guide

## Optimization Strategies

### Database

**Indexes**
- All foreign keys are indexed
- Frequently queried fields have indexes
- Composite indexes for common query patterns

**Query Optimization**
- Use Prisma's select to fetch only needed fields
- Batch operations with `Promise.all()`
- Implement cursor-based pagination for large datasets

### Caching

**Redis Strategy**
- Wallet data: 5 minute TTL
- Trace results: 10 minute TTL
- Exchange wallets: 1 hour TTL
- Bundle data: 30 minute TTL

**Cache Invalidation**
- Automatic on new transactions
- Manual via API for corrections
- TTL-based for eventual consistency

### API Rate Limiting

**Tiers**
- Free: 60 req/min
- Pro: 300 req/min  
- Enterprise: 1000 req/min

**Headers**
Response includes:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

### Solana RPC Optimization

**Connection Pooling**
- Maintain persistent WebSocket connections
- Reuse HTTP connections with keep-alive

**Request Batching**
- Batch signature requests
- Parallelize independent calls
- Use getMultipleAccounts where possible

**Caching**
- Cache recent blockhashes (30s TTL)
- Cache account data with slot validation
- Cache transaction metadata

### Memory Management

**Streaming**
- Stream large responses
- Use pagination for lists
- Implement backpressure

**Garbage Collection**
- Avoid memory leaks in long-running processes
- Clear old trace data periodically
- Monitor heap usage

## Benchmarks

### Trace Performance
- Single hop trace: <100ms
- 5-hop trace: <500ms
- 10-hop trace: <2s

### Bundle Detection
- Small dataset (<1000 txs): <1s
- Medium dataset (<10k txs): <5s
- Large dataset (<100k txs): <30s

### API Response Times
- Health check: <10ms
- Wallet profile: <100ms
- Trace request: <2s

## Monitoring

### Key Metrics
- API response times (p50, p95, p99)
- Database query times
- Cache hit ratio
- RPC call volume
- Error rates

### Alerts
- Response time > 5s
- Error rate > 1%
- Cache hit ratio < 80%
- RPC rate limit approaching
