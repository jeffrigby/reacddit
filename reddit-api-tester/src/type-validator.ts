import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TypeMismatch {
  path: string;
  expected: string;
  actual: string;
  value: unknown;
}

export interface ValidationResult {
  endpoint: string;
  valid: boolean;
  mismatches: TypeMismatch[];
  unexpectedFields: string[];
  missingFields: string[];
}

export class TypeValidator {
  private typeDefinitions: Map<string, unknown> = new Map();

  constructor() {
    // In a real implementation, we would parse the TypeScript definitions
    // For now, we'll do runtime shape validation
  }

  validateResponse(
    endpoint: string,
    response: unknown,
    expectedType?: string
  ): ValidationResult {
    const result: ValidationResult = {
      endpoint,
      valid: true,
      mismatches: [],
      unexpectedFields: [],
      missingFields: []
    };

    // Perform basic validation based on common Reddit API patterns
    if (this.isRedditThing(response)) {
      this.validateRedditThing(response, result);
    } else if (this.isRedditListing(response)) {
      this.validateRedditListing(response, result);
    }

    // Check for common Reddit API response patterns
    this.checkCommonPatterns(response, result);

    result.valid = result.mismatches.length === 0 && 
                   result.missingFields.length === 0;

    return result;
  }

  private isRedditThing(obj: unknown): obj is { kind: string; data: unknown } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'kind' in obj &&
      'data' in obj
    );
  }

  private isRedditListing(obj: unknown): boolean {
    return this.isRedditThing(obj) && (obj as any).kind === 'Listing';
  }

  private validateRedditThing(thing: any, result: ValidationResult): void {
    // Validate kind field
    if (typeof thing.kind !== 'string') {
      result.mismatches.push({
        path: 'kind',
        expected: 'string',
        actual: typeof thing.kind,
        value: thing.kind
      });
    }

    // Validate data field
    if (typeof thing.data !== 'object' || thing.data === null) {
      result.mismatches.push({
        path: 'data',
        expected: 'object',
        actual: typeof thing.data,
        value: thing.data
      });
    }

    // Validate based on kind
    if (thing.kind && thing.data) {
      switch (thing.kind) {
        case 't1_': // Comment
          this.validateComment(thing.data, result);
          break;
        case 't2_': // Account
          this.validateAccount(thing.data, result);
          break;
        case 't3_': // Link
          this.validateLink(thing.data, result);
          break;
        case 't5_': // Subreddit
          this.validateSubreddit(thing.data, result);
          break;
        case 'Listing':
          this.validateListingData(thing.data, result);
          break;
      }
    }
  }

  private validateComment(data: any, result: ValidationResult): void {
    const requiredFields = ['id', 'author', 'body', 'created_utc', 'score'];
    this.checkRequiredFields(data, requiredFields, result, 'comment');
  }

  private validateAccount(data: any, result: ValidationResult): void {
    const requiredFields = ['id', 'name', 'created_utc', 'link_karma', 'comment_karma'];
    this.checkRequiredFields(data, requiredFields, result, 'account');
  }

  private validateLink(data: any, result: ValidationResult): void {
    const requiredFields = ['id', 'title', 'author', 'created_utc', 'score', 'url'];
    this.checkRequiredFields(data, requiredFields, result, 'link');
  }

  private validateSubreddit(data: any, result: ValidationResult): void {
    const requiredFields = ['id', 'display_name', 'created_utc', 'subscribers'];
    this.checkRequiredFields(data, requiredFields, result, 'subreddit');
  }

  private validateListingData(data: any, result: ValidationResult): void {
    const requiredFields = ['children'];
    this.checkRequiredFields(data, requiredFields, result, 'listing');

    // Validate children array
    if (Array.isArray(data.children)) {
      data.children.forEach((child: unknown, index: number) => {
        if (this.isRedditThing(child)) {
          const childResult: ValidationResult = {
            endpoint: `${result.endpoint}.children[${index}]`,
            valid: true,
            mismatches: [],
            unexpectedFields: [],
            missingFields: []
          };
          this.validateRedditThing(child, childResult);
          result.mismatches.push(...childResult.mismatches);
          result.unexpectedFields.push(...childResult.unexpectedFields);
          result.missingFields.push(...childResult.missingFields);
        }
      });
    }
  }

  private checkRequiredFields(
    data: any,
    requiredFields: string[],
    result: ValidationResult,
    context: string
  ): void {
    for (const field of requiredFields) {
      if (!(field in data)) {
        result.missingFields.push(`${context}.${field}`);
      }
    }
  }

  private checkCommonPatterns(response: unknown, result: ValidationResult): void {
    if (typeof response !== 'object' || response === null) {
      return;
    }

    const obj = response as Record<string, unknown>;

    // Check for error responses
    if ('error' in obj || 'errors' in obj) {
      result.unexpectedFields.push('Contains error response');
    }

    // Check for rate limit headers
    if ('ratelimit' in obj) {
      // This is expected, just note it
    }
  }

  async generateTypeReport(validationResults: ValidationResult[]): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      totalEndpoints: validationResults.length,
      validEndpoints: validationResults.filter(r => r.valid).length,
      invalidEndpoints: validationResults.filter(r => !r.valid).length,
      results: validationResults,
      summary: this.generateSummary(validationResults)
    };

    const reportPath = path.join(__dirname, '../results', `type-validation-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return reportPath;
  }

  private generateSummary(results: ValidationResult[]): Record<string, unknown> {
    const allMismatches = results.flatMap(r => r.mismatches);
    const allMissingFields = results.flatMap(r => r.missingFields);
    const allUnexpectedFields = results.flatMap(r => r.unexpectedFields);

    return {
      totalMismatches: allMismatches.length,
      totalMissingFields: allMissingFields.length,
      totalUnexpectedFields: allUnexpectedFields.length,
      mostCommonMismatches: this.getMostCommon(allMismatches.map(m => m.path)),
      mostCommonMissingFields: this.getMostCommon(allMissingFields),
      recommendations: this.generateRecommendations(results)
    };
  }

  private getMostCommon(items: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }

  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];

    // Analyze patterns
    const missingFieldsCount = results.reduce((sum, r) => sum + r.missingFields.length, 0);
    const mismatchCount = results.reduce((sum, r) => sum + r.mismatches.length, 0);

    if (missingFieldsCount > 0) {
      recommendations.push(`Add ${missingFieldsCount} missing fields to type definitions`);
    }

    if (mismatchCount > 0) {
      recommendations.push(`Fix ${mismatchCount} type mismatches in existing definitions`);
    }

    if (results.some(r => r.unexpectedFields.length > 0)) {
      recommendations.push('Review unexpected fields and consider adding them to types');
    }

    return recommendations;
  }
}