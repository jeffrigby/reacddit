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

  /**
   * Fetch a recent post from a subreddit for testing
   * @param subreddit - Subreddit to fetch from (default: 'test')
   * @param limit - Number of posts to fetch (default: 1)
   * @returns Post ID without the 't3_' prefix, or null if none found
   */
  async fetchRecentPost(subreddit = 'test', limit = 1): Promise<string | null> {
    try {
      console.log(`📥 Fetching recent post from /r/${subreddit}...`);
      const response = await this.axiosInstance.get(`/r/${subreddit}/new`, {
        params: { limit, raw_json: 1 }
      });

      const posts = response.data?.data?.children;
      if (!posts || posts.length === 0) {
        console.warn('⚠️  No posts found in subreddit');
        return null;
      }

      const postId = posts[0].data.id;
      const postTitle = posts[0].data.title?.substring(0, 50) || 'Untitled';
      console.log(`✓ Found post: ${postId} - "${postTitle}..."`);

      return postId;
    } catch (error) {
      console.error('✗ Failed to fetch recent post:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  /**
   * Fetch a recent comment from a post for testing
   * @param subreddit - Subreddit name
   * @param postId - Post ID (without t3_ prefix)
   * @returns Comment ID without the 't1_' prefix, or null if none found
   */
  async fetchRecentComment(subreddit: string, postId: string): Promise<string | null> {
    try {
      console.log(`📥 Fetching comments from post ${postId}...`);
      const response = await this.axiosInstance.get(`/r/${subreddit}/comments/${postId}`, {
        params: { limit: 1, raw_json: 1 }
      });

      // Comments are in the second element of the response array
      const comments = response.data[1]?.data?.children;
      if (!comments || comments.length === 0) {
        console.warn('⚠️  No comments found in post');
        return null;
      }

      const commentId = comments[0].data.id;
      const commentBody = comments[0].data.body?.substring(0, 50) || 'Empty comment';
      console.log(`✓ Found comment: ${commentId} - "${commentBody}..."`);

      return commentId;
    } catch (error) {
      console.error('✗ Failed to fetch recent comment:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  /**
   * Clean up test data by removing votes and unsaving posts
   * @param postId - Post ID with or without 't3_' prefix
   */
  async cleanupTestPost(postId: string): Promise<void> {
    const fullname = postId.startsWith('t3_') ? postId : `t3_${postId}`;

    try {
      console.log(`🧹 Cleaning up test data for ${postId}...`);

      // Remove vote (set dir to 0)
      const voteData = new URLSearchParams();
      voteData.append('id', fullname);
      voteData.append('dir', '0');

      await this.axiosInstance.post('/api/vote', voteData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Unsave the post
      const unsaveData = new URLSearchParams();
      unsaveData.append('id', fullname);

      await this.axiosInstance.post('/api/unsave', unsaveData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      console.log('✓ Cleanup complete');
    } catch (error) {
      console.warn('⚠️  Cleanup failed (this is usually okay):', error instanceof Error ? error.message : error);
    }
  }

  /**
   * Get the authenticated username
   * @returns Username or null if not authenticated
   */
  async getAuthenticatedUser(): Promise<string | null> {
    try {
      const response = await this.axiosInstance.get('/api/v1/me', {
        params: { raw_json: 1 }
      });

      const username = response.data?.name;
      if (username) {
        console.log(`✓ Authenticated as: ${username}`);
        return username;
      }

      return null;
    } catch (error) {
      console.warn('⚠️  Could not get authenticated user');
      return null;
    }
  }

  /**
   * Fetch a post with a substantial number of comments for testing
   * @param subreddit - Subreddit to fetch from (default: 'programming')
   * @param minComments - Minimum number of comments required (default: 50)
   * @returns Object with post ID, subreddit, and number of comments, or null if none found
   */
  async fetchPostWithComments(
    subreddit = 'programming',
    minComments = 50
  ): Promise<{ postId: string; subreddit: string; numComments: number; title: string } | null> {
    try {
      console.log(`📥 Fetching post with ${minComments}+ comments from /r/${subreddit}...`);
      const response = await this.axiosInstance.get(`/r/${subreddit}/hot`, {
        params: { limit: 25, raw_json: 1 }
      });

      const posts = response.data?.data?.children;
      if (!posts || posts.length === 0) {
        console.warn('⚠️  No posts found in subreddit');
        return null;
      }

      // Find first post with enough comments
      const postWithComments = posts.find(
        (post: any) => post.data.num_comments >= minComments
      );

      if (!postWithComments) {
        console.warn(`⚠️  No posts found with ${minComments}+ comments`);
        return null;
      }

      const postId = postWithComments.data.id;
      const numComments = postWithComments.data.num_comments;
      const title = postWithComments.data.title?.substring(0, 50) || 'Untitled';
      console.log(`✓ Found post: ${postId} with ${numComments} comments - "${title}..."`);

      return { postId, subreddit, numComments, title };
    } catch (error) {
      console.error('✗ Failed to fetch post with comments:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  /**
   * Extract "more children" IDs from a comments response for testing
   * @param subreddit - Subreddit name
   * @param postId - Post ID (without t3_ prefix)
   * @returns Comma-separated list of child comment IDs, or null if none found
   */
  async extractMoreChildrenIds(subreddit: string, postId: string): Promise<string | null> {
    try {
      console.log(`📥 Fetching comment tree to extract "more children" IDs...`);
      const response = await this.axiosInstance.get(`/r/${subreddit}/comments/${postId}`, {
        params: { limit: 10, raw_json: 1 }
      });

      // Comments are in the second element of the response array
      const commentsListing = response.data[1];
      if (!commentsListing?.data?.children) {
        console.warn('⚠️  No comments found in post');
        return null;
      }

      // Find "more" children objects
      const moreChildren = commentsListing.data.children.filter(
        (child: any) => child.kind === 'more'
      );

      if (moreChildren.length === 0) {
        console.warn('⚠️  No "more children" found');
        return null;
      }

      // Get the first "more" object's children IDs
      const childrenIds = moreChildren[0].data.children;
      if (!childrenIds || childrenIds.length === 0) {
        console.warn('⚠️  "More children" object has no child IDs');
        return null;
      }

      const childrenList = childrenIds.slice(0, 10).join(','); // Limit to first 10 for testing
      console.log(`✓ Found ${childrenIds.length} more children IDs (using first 10)`);

      return childrenList;
    } catch (error) {
      console.error('✗ Failed to extract more children IDs:', error instanceof Error ? error.message : error);
      return null;
    }
  }
}