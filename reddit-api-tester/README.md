# Reddit API Tester

A standalone testing tool for the Reddit API. This tool helps validate API responses, check TypeScript type definitions, and generate comprehensive reports on API endpoints.

## Features

- **Token Management**: Supports both anonymous tokens (from API server) and authenticated tokens
- **API Testing**: Direct testing of Reddit API endpoints with real requests
- **Type Validation**: Compares actual API responses with expected TypeScript type shapes
- **Report Generation**: Creates detailed JSON and Markdown reports with findings
- **Rate Limiting Protection**: Built-in delays between requests to avoid hitting rate limits

## Installation

```bash
cd reddit-api-tester
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` to set your API server path (default: `http://localhost:3001`)

## Usage

### Basic Testing (Anonymous Token)

```bash
npm run test-api
```

This will fetch an anonymous token from your API server and test public endpoints.

### Testing with Authentication Token

```bash
npm run test-api test -- --token "YOUR_REDDIT_ACCESS_TOKEN"
```

### Testing with Type Validation

```bash
npm run test-api test -- --validate-types
```

### Advanced Options

```bash
npm run test-api -- --help
```

Options:
- `-t, --token <token>`: Use authenticated token instead of anonymous
- `-e, --endpoints <endpoints>`: Comma-separated list of endpoints to test
- `-v, --validate-types`: Validate response types against TypeScript definitions
- `-s, --save-raw`: Save raw API responses
- `-a, --include-auth`: Include endpoints that require authentication

### Examples

Test specific endpoints:
```bash
npm run test-api test -- --endpoints "/hot,/new,/api/v1/me"
```

Test with auth token and type validation:
```bash
npm run test-api test -- --token "YOUR_TOKEN" --validate-types --save-raw
```

## Configuration

Edit `src/endpoints.json` to add or modify endpoints to test:

```json
{
  "endpoints": [
    {
      "endpoint": "/api/v1/me",
      "method": "GET",
      "description": "Get current user info",
      "requiresAuth": true,
      "expectedType": "MeResponse"
    }
  ]
}
```

### Endpoint Configuration Fields

- `endpoint`: The Reddit API endpoint path
- `method`: HTTP method (GET, POST, etc.)
- `description`: Human-readable description
- `params`: Optional query parameters or request body
- `requiresAuth`: Whether the endpoint requires authentication
- `expectedType`: Expected TypeScript type name for validation

## Reports

Reports are generated in the `results/` directory:
- `report-{timestamp}.json`: Detailed JSON report with all test data
- `report-{timestamp}.md`: Human-readable Markdown summary
- `test-results-{timestamp}.json`: Raw API responses (when using `--save-raw`)

### Report Contents

- Summary statistics (success/failure rates, response times)
- Detailed results for each endpoint tested
- Type validation issues (if `--validate-types` is used)
- Recommendations for improvements

## Token Sources

1. **Anonymous Token**: Automatically fetched from the API server at the path specified in `.env`
2. **Authenticated Token**: Manually provided via command line for testing authenticated endpoints

### Getting an Authenticated Token

To test authenticated endpoints, you have several options:

1. **Use Reddit OAuth Credentials** (App-only token):
   ```bash
   npm run test-api test -- --reddit
   ```
   This uses the credentials in your `.env` file to get an app-only token.

2. **Use Reddit OAuth with Username/Password** (Script app):
   ```bash
   npm run test-api auth-test -- --username "jeffrigby" --password "your-password"
   ```
   Then use the cached token for testing.

3. **Use the Reacddit API server** to get a token through the OAuth flow

4. **Provide a token directly**:
   ```bash
   npm run test-api test -- --token "YOUR_TOKEN"
   ```

## Development

### Project Structure

```
reddit-api-tester/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── token-manager.ts  # Token handling logic
│   ├── api-tester.ts     # API testing core
│   ├── type-validator.ts # Response validation
│   ├── report-generator.ts # Report generation
│   └── endpoints.json    # Endpoint configuration
├── results/              # Test results and reports
├── package.json
└── tsconfig.json
```

### Running in Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

## Troubleshooting

### "Failed to get anonymous token"

Make sure:
1. The API server is running (check your `.env` for the correct path)
2. The API_PATH in `.env` is correct
3. Your network allows connections to the API server

### 401/403 Errors

Some endpoints require authentication. To test these:
1. Obtain a valid Reddit access token
2. Use the `--token` option to provide it
3. Or skip auth endpoints by not using `--include-auth`

### Type Validation Issues

The type validator performs basic shape validation. For more accurate type checking:
1. Ensure endpoint configurations specify correct `expectedType` values
2. Check that your type definitions match actual Reddit API responses
3. Use `--save-raw` to inspect actual response data

## Contributing

To add more endpoints:
1. Edit `src/endpoints.json`
2. Add the endpoint configuration
3. Run tests to verify it works
4. Submit a pull request with your additions

## License

This tool is part of the Reacddit project and follows the same license.