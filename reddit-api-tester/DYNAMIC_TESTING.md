# Dynamic API Testing System

The Reddit API tester now includes a robust dynamic testing system that automatically fetches fresh content for testing endpoints that require specific IDs or user data.

## What's New

### Template Variables
Endpoint configurations can now use template variables that are automatically replaced with fresh data:

- `{{POST_ID}}` - A recent post ID from a test subreddit
- `{{COMMENT_ID}}` - A recent comment ID from that post
- `{{USERNAME}}` - The authenticated user's username
- `{{SUBREDDIT}}` - The test subreddit name

### Dynamic Test Flow

1. **Preparation Phase**
   - Analyzes endpoint configs to determine required variables
   - Fetches fresh post from `/r/test` (or specified subreddit)
   - Gets authenticated user info if needed
   - Fetches recent comment if needed

2. **Execution Phase**
   - Replaces template variables with actual values
   - Filters out endpoints with missing variables
   - Runs tests with fresh, valid IDs

3. **Cleanup Phase** (optional)
   - Removes test votes (sets dir to 0)
   - Unsaves test posts
   - Leaves no trace on the test account

## Usage Examples

### Basic Dynamic Test
```bash
npm run test-api test -- --reddit --dynamic
```

### Test Specific Dynamic Endpoints
```bash
npm run test-api test -- --reddit --dynamic --endpoints "vote,save,unsave"
```

### With Cleanup
```bash
npm run test-api test -- --reddit --dynamic --cleanup
```

### Custom Test Subreddit
```bash
npm run test-api test -- --reddit --dynamic --test-subreddit javascript
```

### Type Validation with Dynamic Tests
```bash
npm run test-api test -- --reddit --dynamic --validate-types --save-raw
```

### Verbose Mode
```bash
npm run test-api test -- --reddit --dynamic --verbose --cleanup
```

## Benefits

### ✅ Always Valid IDs
- No more archived posts causing test failures
- Fresh content for every test run
- Posts are always < 6 months old (not archived)

### ✅ Automated Cleanup
- Optional cleanup flag removes test data
- No manual cleanup needed
- Test account stays clean

### ✅ Comprehensive Coverage
Tests now work reliably for:
- Vote endpoints (`/api/vote`)
- Save/unsave endpoints (`/api/save`, `/api/unsave`)
- Comment fetching (`/r/{subreddit}/comments/{post}`)
- User activity (`/user/{username}/submitted`)
- Any endpoint requiring dynamic data

### ✅ Type Validation
- Validates actual API responses against TypeScript types
- Identifies type mismatches
- Saves raw responses for manual inspection
- Generates detailed reports

## Example Test Run

```bash
$ npm run test-api test -- --reddit --dynamic --endpoints "vote,save,unsave" --cleanup --verbose

🚀 Reddit API Tester Starting...

Using Reddit OAuth credentials...
✅ Reddit user token obtained

🔧 Preparing dynamic test data...

Required variables: POST_ID
📥 Fetching recent post from /r/test...
✓ Found post: 1o6h6o6 - "Testing a new, low-effort daily routine—what tiny ..."
✓ POST_ID set to: t3_1o6h6o6

📋 Testing 5 endpoints...

Testing POST /api/vote...
✓ Success: /api/vote (96ms)

Testing POST /api/save...
✓ Success: /api/save (102ms)

Testing POST /api/unsave...
✓ Success: /api/unsave (92ms)

🧹 Cleaning up test data for 1o6h6o6...
✓ Cleanup complete

📊 Test Summary:
Total Tests: 5
✅ Successful: 5
❌ Failed: 0
⏱️  Average Response Time: 120ms

✨ Testing complete!
```

## Configuration

### Endpoint Templates in `endpoints.json`

```json
{
  "endpoint": "/api/vote",
  "method": "POST",
  "description": "Upvote a post (dynamic POST_ID)",
  "body": {
    "id": "{{POST_ID}}",
    "dir": 1
  },
  "requiresAuth": true,
  "expectedType": "VoteResponse"
}
```

### Multiple Variables

```json
{
  "endpoint": "/r/{{SUBREDDIT}}/comments/{{POST_ID}}",
  "method": "GET",
  "description": "Get comments (dynamic)",
  "params": {
    "limit": 5,
    "raw_json": 1
  }
}
```

## Command-Line Options

| Flag | Description |
|------|-------------|
| `-d, --dynamic` | Enable dynamic test runner |
| `-c, --cleanup` | Clean up test data after run |
| `--test-subreddit <name>` | Subreddit for fetching test content (default: test) |
| `--verbose` | Show detailed output including variables used |
| `-s, --save-raw` | Save raw API responses to JSON files |
| `-v, --validate-types` | Validate responses against TypeScript types |

## Testing Core Client Endpoints

The client (`client/src/reddit/redditApiTs.ts`) uses these endpoints most frequently:

### High Priority (Core Data)
```bash
npm run test-api test -- --reddit --dynamic \
  --endpoints "/api/v1/me,/r/programming/hot,/r/programming/about,comments" \
  --validate-types --save-raw
```

### User Actions (Write Operations)
```bash
npm run test-api test -- --reddit --dynamic \
  --endpoints "vote,save,unsave,subscribe" \
  --cleanup
```

### Multi/Search Features
```bash
npm run test-api test -- --reddit --dynamic \
  --endpoints "/api/multi/mine,/api/search_subreddits,submitted" \
  --save-raw
```

## Architecture

### New Files
- `src/endpoint-processor.ts` - Template variable replacement
- `src/dynamic-test-runner.ts` - Orchestrates dynamic tests

### Enhanced Files
- `src/api-tester.ts` - Added helpers for fetching fresh content
- `src/index.ts` - Integrated dynamic test runner
- `src/endpoints.json` - Added dynamic endpoint templates

## Future Enhancements

Potential improvements:
- Support for more variable types (MULTIREDDIT_PATH, etc.)
- Parallel dynamic tests with different post IDs
- Test data pooling (reuse same post for multiple tests)
- Custom variable injection via CLI
- Dynamic test scenarios (test full workflows)
