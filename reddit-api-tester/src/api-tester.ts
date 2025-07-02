import axios, { AxiosInstance, AxiosError } from 'axios';
import { TokenManager, TokenInfo } from './token-manager.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestResult {
  endpoint: string;
  method: string;
  params?: Record<string, unknown>;
  success: boolean;
  statusCode?: number;
  response?: unknown;
  error?: string;
  responseTime: number;
  timestamp: string;
}

export interface EndpointConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  requiresAuth?: boolean;
  expectedType?: string;
}

export class RedditAPITester {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private results: TestResult[] = [];

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
    this.axiosInstance = axios.create({
      baseURL: 'https://oauth.reddit.com',
      headers: {
        'User-Agent': process.env.REDDIT_USER_AGENT || 'RedditAPITester/1.0.0 (by /u/jeffrigby)'
      }
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.tokenManager.getCurrentToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token.accessToken}`;
      }
      return config;
    });
  }

  async testEndpoint(config: EndpointConfig): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      endpoint: config.endpoint,
      method: config.method,
      params: config.params,
      success: false,
      responseTime: 0,
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`Testing ${config.method} ${config.endpoint}...`);

      let response;
      switch (config.method) {
        case 'GET':
          response = await this.axiosInstance.get(config.endpoint, {
            params: config.params
          });
          break;
        case 'POST':
          // Reddit API expects form-encoded data for POST requests
          const postData = config.body || config.params;
          const formData = new URLSearchParams();
          if (postData) {
            Object.entries(postData).forEach(([key, value]) => {
              formData.append(key, String(value));
            });
          }
          response = await this.axiosInstance.post(config.endpoint, formData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          break;
        default:
          throw new Error(`Unsupported method: ${config.method}`);
      }

      result.success = true;
      result.statusCode = response.status;
      result.response = response.data;
      result.responseTime = Date.now() - startTime;

      console.log(`✓ Success: ${config.endpoint} (${result.responseTime}ms)`);
    } catch (error) {
      result.responseTime = Date.now() - startTime;
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        result.statusCode = axiosError.response?.status;
        result.error = axiosError.message;
        
        if (axiosError.response?.data) {
          result.response = axiosError.response.data;
        }

        console.error(`✗ Failed: ${config.endpoint} - ${axiosError.message}`);
      } else {
        result.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Failed: ${config.endpoint} - ${result.error}`);
      }
    }

    this.results.push(result);
    return result;
  }

  async testMultipleEndpoints(configs: EndpointConfig[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const config of configs) {
      const result = await this.testEndpoint(config);
      results.push(result);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  async saveResults(filename?: string): Promise<string> {
    const resultsDir = path.join(__dirname, '../results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = filename || `test-results-${timestamp}.json`;
    const outputPath = path.join(resultsDir, outputFile);
    
    await fs.writeFile(
      outputPath,
      JSON.stringify(this.results, null, 2),
      'utf-8'
    );
    
    console.log(`Results saved to: ${outputPath}`);
    return outputPath;
  }

  getResults(): TestResult[] {
    return this.results;
  }

  clearResults(): void {
    this.results = [];
  }

  // Helper method to test the wrapper methods from redditApiTs.ts
  async testWrapperMethod(
    methodName: string,
    methodFn: () => Promise<unknown>
  ): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      endpoint: `wrapper:${methodName}`,
      method: 'GET',
      success: false,
      responseTime: 0,
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`Testing wrapper method: ${methodName}...`);
      const response = await methodFn();
      
      result.success = true;
      result.response = response;
      result.responseTime = Date.now() - startTime;
      
      console.log(`✓ Success: ${methodName} (${result.responseTime}ms)`);
    } catch (error) {
      result.responseTime = Date.now() - startTime;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`✗ Failed: ${methodName} - ${result.error}`);
    }

    this.results.push(result);
    return result;
  }
}