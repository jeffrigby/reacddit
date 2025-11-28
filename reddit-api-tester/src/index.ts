#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { TokenManager } from './token-manager.js';
import { RedditAPITester, EndpointConfig } from './api-tester.js';
import { TypeValidator } from './type-validator.js';
import { ReportGenerator } from './report-generator.js';
import { DynamicTestRunner } from './dynamic-test-runner.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function loadEndpointConfig(): Promise<{ endpoints: EndpointConfig[] }> {
  const configPath = path.join(__dirname, 'endpoints.json');
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

async function runTests(options: any) {
  console.log('🚀 Reddit API Tester Starting...\n');

  // Initialize components
  const tokenManager = new TokenManager();
  const apiTester = new RedditAPITester(tokenManager);
  const typeValidator = new TypeValidator();
  const reportGenerator = new ReportGenerator();

  // Handle token
  if (options.token) {
    console.log('Using provided authentication token');
    await tokenManager.setAuthToken(options.token);
  } else if (options.reddit) {
    // Use direct Reddit OAuth
    console.log('Using Reddit OAuth credentials...');
    try {
      // Check if we have username/password for user authentication
      if (process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD) {
        console.log(`Authenticating as user: ${process.env.REDDIT_USERNAME}`);
        await tokenManager.getRedditUserToken(
          process.env.REDDIT_USERNAME,
          process.env.REDDIT_PASSWORD
        );
        console.log('✅ Reddit user token obtained\n');
      } else {
        await tokenManager.getRedditAppToken();
        console.log('✅ Reddit app-only token obtained\n');
      }
    } catch (error) {
      console.error('❌ Failed to get Reddit token:', error);
      console.log('Check your Reddit credentials in .env');
      process.exit(1);
    }
  } else {
    console.log('Fetching anonymous token...');
    try {
      await tokenManager.getAnonymousToken();
      console.log('✅ Anonymous token obtained\n');
    } catch (error) {
      console.error('❌ Failed to get anonymous token:', error);
      console.log('Make sure the API server is running at', process.env.API_PATH || 'http://localhost:3001');
      process.exit(1);
    }
  }

  // Load endpoint configuration
  const config = await loadEndpointConfig();
  let endpointsToTest = config.endpoints;

  // Filter endpoints if specific ones requested
  if (options.endpoints) {
    const requestedEndpoints = options.endpoints.split(',').map((e: string) => e.trim());
    endpointsToTest = endpointsToTest.filter(e => 
      requestedEndpoints.some(re => e.endpoint.includes(re))
    );
  }

  // Filter by auth requirements
  const currentToken = await tokenManager.getCurrentToken();
  if (currentToken?.type === 'anonymous' && !options.includeAuth) {
    console.log('📌 Filtering out endpoints that require authentication...\n');
    endpointsToTest = endpointsToTest.filter(e => !e.requiresAuth);
  }

  // Run API tests (dynamic or static)
  let testResults;

  if (options.dynamic) {
    // Use dynamic test runner
    const dynamicRunner = new DynamicTestRunner(apiTester);
    testResults = await dynamicRunner.runDynamicTests(endpointsToTest, {
      cleanup: options.cleanup,
      testSubreddit: options.testSubreddit || 'test',
      verbose: options.verbose
    });

    // Show variables used
    if (options.verbose) {
      console.log('\n📌 Variables used in dynamic tests:');
      const variables = dynamicRunner.getVariables();
      Object.entries(variables).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log();
    }
  } else {
    console.log(`📋 Testing ${endpointsToTest.length} endpoints...\n`);
    testResults = await apiTester.testMultipleEndpoints(endpointsToTest);
  }


  // Validate types if requested
  let validationResults;
  if (options.validateTypes) {
    console.log('\n🔍 Validating response types...\n');
    validationResults = testResults.map(result => {
      if (result.success && result.response) {
        const endpointConfig = endpointsToTest.find(e => e.endpoint === result.endpoint);
        return typeValidator.validateResponse(
          result.endpoint,
          result.response,
          endpointConfig?.expectedType
        );
      }
      return {
        endpoint: result.endpoint,
        valid: false,
        mismatches: [],
        unexpectedFields: [],
        missingFields: ['No response to validate']
      };
    });
  }

  // Generate report
  console.log('\n📊 Generating report...\n');
  const reportPath = await reportGenerator.generateReport(
    apiTester.getResults(),
    validationResults
  );

  // Print summary
  const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
  reportGenerator.printSummary(report, options.verbose || false);

  // Save raw results if requested
  if (options.saveRaw) {
    await apiTester.saveResults();
  }

  console.log('\n✨ Testing complete!');
}

// CLI setup
const program = new Command();

program
  .name('reddit-api-tester')
  .description('Test Reddit API endpoints and validate TypeScript types')
  .version('1.0.0');

program
  .command('test')
  .description('Run API tests')
  .option('-t, --token <token>', 'Use authenticated token instead of anonymous')
  .option('-r, --reddit', 'Use Reddit OAuth credentials from .env')
  .option('-e, --endpoints <endpoints>', 'Comma-separated list of endpoints to test')
  .option('-v, --validate-types', 'Validate response types against TypeScript definitions')
  .option('-s, --save-raw', 'Save raw API responses')
  .option('-a, --include-auth', 'Include endpoints that require authentication (will fail with anonymous token)')
  .option('-d, --dynamic', 'Use dynamic test runner (fetches fresh content for template variables)')
  .option('-c, --cleanup', 'Clean up test data after dynamic tests (remove votes, unsave posts)')
  .option('--test-subreddit <subreddit>', 'Subreddit to use for dynamic tests (default: test)')
  .option('--verbose', 'Show detailed output for all endpoints')
  .action(runTests);

program
  .command('clear-cache')
  .description('Clear cached tokens')
  .action(() => {
    const tokenManager = new TokenManager();
    tokenManager.clearToken();
    console.log('✅ Token cache cleared');
  });

program
  .command('auth-test')
  .description('Test Reddit authentication with username/password')
  .option('-u, --username <username>', 'Reddit username')
  .option('-p, --password <password>', 'Reddit password')
  .action(async (options) => {
    const tokenManager = new TokenManager();
    try {
      console.log('🔐 Testing Reddit authentication...');
      const token = await tokenManager.getRedditUserToken(options.username, options.password);
      console.log('✅ Authentication successful!');
      console.log(`Token type: ${token.type}`);
      console.log(`Scopes: ${token.scopes?.join(', ')}`);
      console.log(`Expires: ${token.expires ? new Date(token.expires * 1000).toLocaleString() : 'Never'}`);
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      process.exit(1);
    }
  });

// Default to test command if no command specified
if (process.argv.length === 2) {
  process.argv.push('test');
}

program.parse(process.argv);