import { EndpointConfig } from './api-tester.js';

export interface TemplateVariables {
  POST_ID?: string;
  COMMENT_ID?: string;
  SUBREDDIT?: string;
  USERNAME?: string;
  POST_WITH_COMMENTS_ID?: string;
  POST_WITH_COMMENTS_SUBREDDIT?: string;
  MORE_CHILDREN_IDS?: string;
  [key: string]: string | undefined;
}

/**
 * Process endpoint templates by replacing variables like {{POST_ID}}
 */
export class EndpointProcessor {
  /**
   * Replace template variables in a string
   */
  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        const pattern = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(pattern, value);
      }
    }

    return result;
  }

  /**
   * Replace template variables in an object recursively
   */
  private replaceVariablesInObject(
    obj: Record<string, unknown>,
    variables: TemplateVariables
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.replaceVariables(value, variables);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.replaceVariablesInObject(value as Record<string, unknown>, variables);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Check if a string contains template variables
   */
  hasTemplateVariables(str: string): boolean {
    return /{{[A-Z_]+}}/.test(str);
  }

  /**
   * Check if an endpoint config is dynamic (contains template variables)
   */
  isDynamic(config: EndpointConfig): boolean {
    // Check endpoint URL
    if (this.hasTemplateVariables(config.endpoint)) {
      return true;
    }

    // Check params
    if (config.params) {
      const paramsStr = JSON.stringify(config.params);
      if (this.hasTemplateVariables(paramsStr)) {
        return true;
      }
    }

    // Check body
    if (config.body) {
      const bodyStr = JSON.stringify(config.body);
      if (this.hasTemplateVariables(bodyStr)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Process an endpoint config by replacing template variables
   */
  processEndpoint(
    config: EndpointConfig,
    variables: TemplateVariables
  ): EndpointConfig {
    const processed: EndpointConfig = {
      ...config,
      endpoint: this.replaceVariables(config.endpoint, variables),
    };

    if (config.params) {
      processed.params = this.replaceVariablesInObject(config.params, variables);
    }

    if (config.body) {
      processed.body = this.replaceVariablesInObject(config.body, variables);
    }

    return processed;
  }

  /**
   * Process multiple endpoint configs
   */
  processEndpoints(
    configs: EndpointConfig[],
    variables: TemplateVariables
  ): EndpointConfig[] {
    return configs.map(config => this.processEndpoint(config, variables));
  }

  /**
   * Extract all variable names from a template string
   */
  extractVariableNames(template: string): string[] {
    const matches = template.match(/{{([A-Z_]+)}}/g);
    if (!matches) {
      return [];
    }

    return matches.map(match => match.replace(/{{|}}/g, ''));
  }

  /**
   * Get all required variables for an endpoint config
   */
  getRequiredVariables(config: EndpointConfig): string[] {
    const variables = new Set<string>();

    // Check endpoint URL
    this.extractVariableNames(config.endpoint).forEach(v => variables.add(v));

    // Check params
    if (config.params) {
      const paramsStr = JSON.stringify(config.params);
      this.extractVariableNames(paramsStr).forEach(v => variables.add(v));
    }

    // Check body
    if (config.body) {
      const bodyStr = JSON.stringify(config.body);
      this.extractVariableNames(bodyStr).forEach(v => variables.add(v));
    }

    return Array.from(variables);
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(
    config: EndpointConfig,
    variables: TemplateVariables
  ): { valid: boolean; missing: string[] } {
    const required = this.getRequiredVariables(config);
    const missing: string[] = [];

    for (const varName of required) {
      if (variables[varName] === undefined) {
        missing.push(varName);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
