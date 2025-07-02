import axios from 'axios';
import * as querystring from 'querystring';

export interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class RedditOAuth {
  private credentials: RedditCredentials;

  constructor(credentials: RedditCredentials) {
    this.credentials = credentials;
  }

  /**
   * Get a "script" type app token for the jeffrigby account
   * This requires username and password for script apps
   * Note: This may not work with 2FA enabled accounts
   */
  async getScriptAppToken(username: string, password: string, twoFactorCode?: string): Promise<RedditTokenResponse> {
    const auth = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64');
    
    // For 2FA, Reddit expects the code to be appended to the password with a colon
    const authPassword = twoFactorCode ? `${password}:${twoFactorCode}` : password;
    
    try {
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        querystring.stringify({
          grant_type: 'password',
          username: username,
          password: authPassword
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.credentials.userAgent
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('OAuth Error:', error.response?.data);
        
        // Check for specific 2FA error
        if (error.response?.data?.error === 'invalid_grant' && 
            error.response?.data?.error_description?.includes('two-factor')) {
          throw new Error('Two-factor authentication required. Please provide 2FA code.');
        }
        
        throw new Error(`Failed to get Reddit token: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get an app-only token (no user context)
   * This is useful for read-only public data
   */
  async getAppOnlyToken(): Promise<RedditTokenResponse> {
    const auth = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        querystring.stringify({
          grant_type: 'client_credentials'
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.credentials.userAgent
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('OAuth Error:', error.response?.data);
        throw new Error(`Failed to get Reddit token: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}