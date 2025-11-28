import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RedditOAuth, RedditCredentials } from './reddit-oauth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TokenInfo {
  accessToken: string;
  type: 'anonymous' | 'authenticated';
  expires?: number;
  scopes?: string[];
}

export class TokenManager {
  private currentToken: TokenInfo | null = null;
  private tokenCachePath = path.join(__dirname, '../.token-cache.json');
  private redditOAuth: RedditOAuth | null = null;

  constructor() {
    // Initialize RedditOAuth if credentials are available
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      this.redditOAuth = new RedditOAuth({
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        userAgent: process.env.REDDIT_USER_AGENT || 'RedditAPITester/1.0.0'
      });
    }
  }

  async getAnonymousToken(): Promise<TokenInfo> {
    try {
      console.log('Fetching anonymous token from API server...');
      const apiPath = process.env.API_PATH || 'http://localhost:3001';
      const response = await axios.get(`${apiPath}/api/bearer`);
      
      if (response.data.accessToken) {
        const token: TokenInfo = {
          accessToken: response.data.accessToken,
          type: 'anonymous',
          expires: response.data.expires
        };
        
        this.currentToken = token;
        await this.saveTokenCache(token);
        return token;
      }
      
      throw new Error('No access token received from API server');
    } catch (error) {
      console.error('Failed to get anonymous token:', error);
      throw error;
    }
  }

  async setAuthToken(token: string, scopes?: string[]): Promise<TokenInfo> {
    const tokenInfo: TokenInfo = {
      accessToken: token,
      type: 'authenticated',
      scopes: scopes || []
    };
    
    this.currentToken = tokenInfo;
    await this.saveTokenCache(tokenInfo);
    return tokenInfo;
  }

  async getCurrentToken(): Promise<TokenInfo | null> {
    if (this.currentToken) {
      // Check if token is expired
      if (this.currentToken.expires) {
        const now = Math.floor(Date.now() / 1000);
        if (this.currentToken.expires < now) {
          console.log('Token expired, fetching new one...');
          if (this.currentToken.type === 'anonymous') {
            return await this.getAnonymousToken();
          }
          return null;
        }
      }
      return this.currentToken;
    }

    // Try to load from cache
    const cached = await this.loadTokenCache();
    if (cached) {
      this.currentToken = cached;
      return cached;
    }

    return null;
  }

  private async saveTokenCache(token: TokenInfo): Promise<void> {
    try {
      await fs.writeFile(
        this.tokenCachePath,
        JSON.stringify(token, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.warn('Failed to save token cache:', error);
    }
  }

  private async loadTokenCache(): Promise<TokenInfo | null> {
    try {
      const data = await fs.readFile(this.tokenCachePath, 'utf-8');
      return JSON.parse(data) as TokenInfo;
    } catch {
      return null;
    }
  }

  clearToken(): void {
    this.currentToken = null;
    fs.unlink(this.tokenCachePath).catch(() => {});
  }

  /**
   * Get a Reddit app-only token using client credentials
   */
  async getRedditAppToken(): Promise<TokenInfo> {
    if (!this.redditOAuth) {
      throw new Error('Reddit OAuth credentials not configured');
    }

    try {
      console.log('Fetching app-only token from Reddit...');
      const tokenResponse = await this.redditOAuth.getAppOnlyToken();
      
      const token: TokenInfo = {
        accessToken: tokenResponse.access_token,
        type: 'anonymous',
        expires: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
        scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : []
      };

      this.currentToken = token;
      await this.saveTokenCache(token);
      return token;
    } catch (error) {
      console.error('Failed to get Reddit app token:', error);
      throw error;
    }
  }

  /**
   * Get a Reddit user token using username/password (for script apps)
   */
  async getRedditUserToken(username: string, password: string): Promise<TokenInfo> {
    if (!this.redditOAuth) {
      throw new Error('Reddit OAuth credentials not configured');
    }

    try {
      console.log('Fetching user token...');
      const tokenResponse = await this.redditOAuth.getScriptAppToken(username, password);
      
      const token: TokenInfo = {
        accessToken: tokenResponse.access_token,
        type: 'authenticated',
        expires: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
        scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : []
      };

      this.currentToken = token;
      await this.saveTokenCache(token);
      return token;
    } catch (error) {
      console.error('Failed to get Reddit user token:', error);
      throw error;
    }
  }
}