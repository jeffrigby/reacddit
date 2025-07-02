# Reddit API Testing Tool

This directory contains a comprehensive Reddit API testing tool designed to validate API responses against TypeScript type definitions.

## Purpose

Use this tool whenever you need to:
- Test Reddit API endpoints directly
- Validate API responses against TypeScript types in `client/src/types/redditApi.ts`
- Debug authentication issues
- Generate type mismatch reports for fixing type definitions
- Test new endpoints before implementing them in the client

## Quick Start

```bash
cd reddit-api-tester
npm test                    # Test all configured endpoints
npm test -- --endpoint /api/v1/me  # Test specific endpoint
npm test -- --reddit        # Use direct Reddit OAuth instead of API server
```

## Authentication Methods

### 1. Anonymous Token (Default)
- Uses the API server at `http://localhost:3001`
- Good for testing public endpoints
- No Reddit credentials needed

### 2. Direct Reddit OAuth
- Use `--reddit` flag
- Configured via `.env` file:
  - `REDDIT_CLIENT_ID`: OAuth app client ID
  - `REDDIT_CLIENT_SECRET`: OAuth app client secret
  - `REDDIT_USERNAME`: Test account username (Fuzzy_Cantaloupe_252)
  - `REDDIT_PASSWORD`: Test account password

**Important**: The test account does NOT have 2FA enabled. Reddit blocks password grant authentication for accounts with 2FA.

## Project Structure

```
reddit-api-tester/
├── src/
│   ├── index.ts            # CLI entry point
│   ├── token-manager.ts    # Token acquisition and caching
│   ├── reddit-oauth.ts     # Direct Reddit OAuth implementation
│   ├── api-tester.ts       # Core API testing logic
│   ├── type-validator.ts   # TypeScript type validation
│   ├── report-generator.ts # Test result reporting
│   └── endpoints.json      # Endpoints to test
├── results/                # Test results and reports
├── .env                    # Configuration
├── redditAPIDocs.md       # Reddit API documentation
└── CLAUDE.md              # This file
```

## Configuration

### Adding New Endpoints

Edit `src/endpoints.json`:
```json
{
  "endpoint": "/api/v1/me",
  "method": "GET",
  "description": "Get current user info",
  "requiresAuth": true,
  "expectedType": "MeResponse",
  "params": {
    "raw_json": 1
  }
}
```

### Environment Variables

See `.env` for all configuration options:
- API server URLs
- Reddit OAuth credentials
- User agent string
- Test account credentials

## Type Validation

The tool validates API responses against types defined in:
- `client/src/types/redditApi.ts`

When type mismatches are found:
1. They're logged to console with details
2. Full reports are saved to `results/` directory
3. Use these reports to fix type definitions

## Common Issues

### Authentication Failures
- Ensure API server is running for anonymous tokens
- Check Reddit credentials in `.env`
- Verify test account doesn't have 2FA enabled

### Type Mismatches
- Expected - API returns data not in our types
- Use reports to update type definitions
- Some fields may be optional but not marked as such

### Rate Limiting
- Tool caches tokens to minimize requests
- Reddit has rate limits on authentication
- Wait a few minutes if you hit limits

## Development

To modify the testing tool:
1. Update TypeScript files in `src/`
2. Run `npm run build` to compile
3. Test with `npm test`

The tool uses:
- Commander.js for CLI
- Axios for HTTP requests
- Node.js native modules only (no web dependencies)