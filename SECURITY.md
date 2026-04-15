# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security@pasha-tracker.io
3. Allow 48 hours for initial response
4. Allow 90 days for fix before public disclosure

## Security Measures

### API Security

- JWT authentication required for all endpoints
- Rate limiting per IP and per user
- Input validation on all parameters
- SQL injection protection via Prisma ORM

### Data Protection

- API keys stored encrypted
- No private keys stored
- Database connections use SSL
- Redis connections use authentication

### Blockchain Security

- Read-only operations (no transactions)
- Rate limited RPC calls
- No exposure of sensitive wallet data
- Public blockchain data only

## Best Practices

### For Users

1. Use strong JWT secrets
2. Rotate API keys regularly
3. Monitor rate limit usage
4. Report suspicious activity

### For Developers

1. Never commit .env files
2. Use parameterized queries
3. Validate all inputs
4. Keep dependencies updated

## Known Limitations

- Free tier APIs have rate limits
- Blockchain data is public
- No guarantee of complete trace coverage
- Exchange wallet databases may be incomplete
