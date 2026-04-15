# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please DO NOT open an issue. 
Email security concerns to: security@pashatracker.io

We will respond within 48 hours and work to resolve the issue promptly.

## Security Measures

### API Keys and Secrets

- Never commit API keys to the repository
- Use `.env` files for local development (already in `.gitignore`)
- Rotate API keys regularly
- Use environment variables in production

### Rate Limiting

All external API calls are rate-limited to prevent:
- API abuse
- IP bans from service providers
- Excessive costs

### Authentication

- JWT tokens required for protected endpoints
- Tokens expire after 24 hours
- Role-based access control implemented

### Data Protection

- Wallet addresses are public information but stored securely
- No private keys are ever stored or requested
- Database connections use SSL/TLS

### Dependencies

- Regular security audits with `npm audit`
- Automated vulnerability scanning in CI/CD
- Dependabot alerts enabled

## Best Practices for Users

1. **Keep your API keys secure** - Never share them or commit them
2. **Use strong JWT secrets** - Minimum 32 characters in production
3. **Monitor your API usage** - Check rate limit headers
4. **Report suspicious activity** - Contact us if you notice anything unusual
