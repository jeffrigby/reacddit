# Deployment Guide

This guide covers both local development setup with SSL and production deployment to AWS.

## Local Development with SSL

**SSL is required to run reacddit.** Since the app loads HTTPS iframes and embedded content, the main site must also be served over HTTPS to avoid mixed content blocking.

### Recommended Setup

1. Run the dev servers (client on port 3000, API on port 3001)
2. Use a reverse proxy (nginx, Apache, Caddy, etc.) to:
   - Proxy requests to the dev servers
   - Terminate SSL and apply your certificate
   - Serve the site over HTTPS
   - Enable WebSocket support for Webpack HMR (Hot Module Replacement)

### Proxy Configuration

**API routes**: Proxy `/api` requests to the API server (port 3001)
**Client routes**: Proxy all other requests to the client server (port 3000)
**WebSocket support**: Configure WebSocket proxying for `/ws` and `/sockjs-node` endpoints (required for HMR during development)
**HTTP/2**: Enable HTTP/2 for better performance

### SSL Certificate Options

- [Let's Encrypt](https://letsencrypt.org/) (recommended and free)
- Any valid SSL certificate from a certificate authority
- Self-signed certificate for local development (will show browser warnings)

See `nginx.conf.example` in the repo for a complete nginx configuration example.

---

## Production Deployment

### AWS Deployment (Recommended)

The project includes a complete AWS SAM template that provisions all necessary infrastructure.

#### Prerequisites

- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed
- ACM certificate for your domain (must be in us-east-1 for CloudFront)
- Environment variables stored in AWS Systems Manager Parameter Store

#### Deployment Steps

**1. Build the client:**
```bash
cd client
npm run build
# Upload dist/ contents to S3 bucket (created by SAM) at /dist path
```

**2. Deploy with SAM:**
```bash
cd api
sam build
sam deploy --guided  # First deployment - provide parameters
sam deploy           # Subsequent deployments
```

#### What SAM Creates

The `api/template.yaml` provisions a complete serverless infrastructure:

- **Lambda Function** - OAuth2 API running on Node.js 22 (arm64)
- **S3 Bucket** - Static site hosting for the client with encryption and versioning
- **CloudFront Distribution** - CDN with custom domain and SSL
  - Primary origin: S3 bucket (serves client at `/dist`)
  - Secondary origin: Lambda Function URL (serves API at `/api/*`)
- **Origin Access Control** - Secure S3 access from CloudFront only
- **IAM Roles** - Necessary permissions for Lambda and S3

#### Parameters Required

When running `sam deploy --guided`, you'll be prompted for:

- `Domain` - Your custom domain name
- `ACMCertificateArn` - SSL certificate ARN (must be in us-east-1)
- `ENVSsmParam` - SSM Parameter Store path containing environment variables

#### Configuration

**SSM Parameter Store Setup:**

Store your production environment variables in AWS Systems Manager Parameter Store at the path you specify in `ENVSsmParam`. Include:

```bash
CLIENT_PATH=https://yourdomain.com
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_CALLBACK_URI=https://yourdomain.com/api/callback
SALT=your_32_character_encryption_salt
SESSION_LENGTH_SECS=2592000
IV_LENGTH=16
ENCRYPTION_ALGORITHM=aes-256-cbc
```

**Reddit OAuth Setup:**

1. Create a Reddit app at https://www.reddit.com/prefs/apps
2. Set the redirect URI to `https://yourdomain.com/api/callback`
3. Store the client ID and secret in SSM Parameter Store

For detailed API configuration and all available environment variables, see [api/README.md](api/README.md).

#### Post-Deployment

1. **Upload client build to S3:**
   ```bash
   aws s3 sync client/dist/ s3://your-bucket-name/dist/
   ```
   (Get bucket name from SAM outputs: `sam list stack-outputs`)

2. **Configure DNS:**
   - Point your domain to the CloudFront distribution
   - Use Route 53 or your external DNS provider
   - CloudFront domain available in SAM outputs

3. **Verify:**
   - Visit `https://yourdomain.com` - should serve the client
   - Visit `https://yourdomain.com/api/bearer` - should return API status
   - All traffic is served over HTTPS via CloudFront (required for Reddit OAuth and embedded content)

#### Outputs

After deployment, SAM provides these outputs:

- `CloudFrontDistribution` - Distribution ID
- `CloudFrontDomain` - CloudFront domain name for DNS configuration
- `ReacdditAPIBucket` - S3 bucket name for uploading client builds
- `ReacdditAPIUrl` - Lambda function URL (proxied through CloudFront)

#### Updating the Application

**Client updates:**
```bash
cd client
npm run build
aws s3 sync dist/ s3://your-bucket-name/dist/
# Invalidate CloudFront cache if needed
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**API updates:**
```bash
cd api
sam build
sam deploy  # Uses saved parameters from previous deployment
```

---

## Infrastructure Details

See `api/template.yaml` for complete SAM configuration including:
- CloudFront cache policies and behaviors
- S3 bucket lifecycle rules and encryption
- Lambda function configuration and environment variables
- Origin Access Control security settings

---

## Alternative Deployment Methods

While AWS SAM is the recommended approach, you can deploy using alternative methods:

### Manual AWS Setup

1. Deploy client to S3 bucket with static website hosting
2. Deploy API as Lambda function
3. Configure CloudFront with S3 and Lambda origins
4. Set up appropriate IAM roles and policies

### Other Platforms

The client is a standard React SPA and the API is a Node.js application, so they can be deployed to any platform that supports:
- Static site hosting (client)
- Node.js 22+ runtime (API)
- Environment variable configuration
- HTTPS/SSL (required)

Note: You'll need to manually configure the equivalent infrastructure (CDN, serverless functions, etc.)
