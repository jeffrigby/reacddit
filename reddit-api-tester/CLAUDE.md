# Reddit API Testing Tool

Comprehensive Reddit API testing tool to validate responses against TypeScript type definitions.

## Purpose

- Test Reddit API endpoints directly
- Validate responses against types in `client/src/types/redditApi.ts`
- Debug authentication issues
- Generate type mismatch reports
- Test new endpoints before client implementation

## Quick Start

```bash
cd reddit-api-tester

npm run test-api                                    # All tests (anonymous auth)
npm run test-api test -- --reddit                   # With Reddit user auth
npm run test-api test -- --endpoints /api/v1/me     # Specific endpoint
npm run test-api test -- --include-auth             # Include auth-required endpoints
npm run test-api test -- --validate-types --save-raw # Validate types + save responses
npm run test-api test -- --reddit --dynamic --cleanup # Dynamic tests (fresh content)
```

## Authentication

**Anonymous Token (default):** Uses API server at `http://localhost:3001`

**Direct Reddit OAuth:** Use `--reddit` flag with `.env` configuration:
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`
- `REDDIT_USERNAME`, `REDDIT_PASSWORD`
- **Note:** Test account must NOT have 2FA enabled

## Configuration

**Add endpoints** in `src/endpoints.json`:
```json
{
  "endpoint": "/api/v1/me",
  "method": "GET",
  "description": "Get current user info",
  "requiresAuth": true,
  "expectedType": "MeResponse",
  "params": {"raw_json": 1}
}
```

**Environment:** See `.env` for all options (API URLs, credentials, user agent)

## Type Validation

Validates responses against `client/src/types/redditApi.ts`

**On mismatch:**
1. Logged to console with details
2. Full reports saved to `results/`
3. Use reports to fix type definitions

## Testing Workflow (Function Migration)

When migrating JavaScript → TypeScript:

1. **Add test config** in `src/endpoints.json`
2. **Test specific endpoint** (much faster than all tests):
```bash
npm run test-api test -- --endpoints "/r/programming/about"
npm run test-api test -- --endpoints "/r/programming/about,/r/programming/about/rules"
npm run test-api test -- --reddit --endpoints "/api/v1/me"
npm run test-api test -- --endpoints "/api/v1/me" --verbose
DEBUG=true npm run test-api test -- --endpoints "/api/v1/me"
```
3. **Check results** in `results/` directory (`.json` for details, `.md` for summaries)

## Key Files

- `src/index.ts` - CLI entry point
- `src/token-manager.ts` - Token acquisition/caching
- `src/api-tester.ts` - Core testing logic
- `src/type-validator.ts` - Type validation
- `src/endpoints.json` - Endpoints to test
- `results/` - Test results and reports

## Development

```bash
npm run build    # Compile TypeScript
npm test         # Run tests
```

Uses Commander.js for CLI, Axios for HTTP requests, Node.js native modules only.
