import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { TestResult } from './api-tester.js';
import { ValidationResult } from './type-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestReport {
  timestamp: string;
  summary: {
    totalTests: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    endpoints: EndpointSummary[];
  };
  typeValidation?: {
    totalValidated: number;
    passedValidation: number;
    failedValidation: number;
    issues: TypeIssue[];
  };
  recommendations: string[];
  detailedResults: TestResult[];
}

interface EndpointSummary {
  endpoint: string;
  method: string;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
}

interface TypeIssue {
  endpoint: string;
  issueType: 'mismatch' | 'missing' | 'unexpected';
  details: string;
}

export class ReportGenerator {
  async generateReport(
    testResults: TestResult[],
    validationResults?: ValidationResult[]
  ): Promise<string> {
    const report: TestReport = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(testResults),
      recommendations: this.generateRecommendations(testResults, validationResults),
      detailedResults: testResults
    };

    if (validationResults) {
      report.typeValidation = this.generateTypeValidationSummary(validationResults);
    }

    const reportPath = await this.saveReport(report);
    await this.generateMarkdownReport(report);
    
    return reportPath;
  }

  private generateSummary(results: TestResult[]): TestReport['summary'] {
    const successful = results.filter(r => r.success).length;
    const totalResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0);

    const endpoints: EndpointSummary[] = results.map(r => ({
      endpoint: r.endpoint,
      method: r.method,
      success: r.success,
      responseTime: r.responseTime,
      statusCode: r.statusCode,
      error: r.error
    }));

    return {
      totalTests: results.length,
      successful,
      failed: results.length - successful,
      averageResponseTime: results.length > 0 ? totalResponseTime / results.length : 0,
      endpoints
    };
  }

  private generateTypeValidationSummary(
    validationResults: ValidationResult[]
  ): TestReport['typeValidation'] {
    const issues: TypeIssue[] = [];

    validationResults.forEach(result => {
      result.mismatches.forEach(mismatch => {
        issues.push({
          endpoint: result.endpoint,
          issueType: 'mismatch',
          details: `${mismatch.path}: expected ${mismatch.expected}, got ${mismatch.actual}`
        });
      });

      result.missingFields.forEach(field => {
        issues.push({
          endpoint: result.endpoint,
          issueType: 'missing',
          details: `Missing field: ${field}`
        });
      });

      result.unexpectedFields.forEach(field => {
        issues.push({
          endpoint: result.endpoint,
          issueType: 'unexpected',
          details: `Unexpected field: ${field}`
        });
      });
    });

    return {
      totalValidated: validationResults.length,
      passedValidation: validationResults.filter(r => r.valid).length,
      failedValidation: validationResults.filter(r => !r.valid).length,
      issues
    };
  }

  private generateRecommendations(
    testResults: TestResult[],
    validationResults?: ValidationResult[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze test results
    const failedTests = testResults.filter(r => !r.success);
    const authErrors = failedTests.filter(r => r.statusCode === 401 || r.statusCode === 403);
    
    if (authErrors.length > 0) {
      recommendations.push(
        `${authErrors.length} endpoints failed with authentication errors. Consider using an authenticated token for better coverage.`
      );
    }

    const slowEndpoints = testResults.filter(r => r.responseTime > 2000);
    if (slowEndpoints.length > 0) {
      recommendations.push(
        `${slowEndpoints.length} endpoints had slow response times (>2s). Consider implementing caching or pagination.`
      );
    }

    // Analyze validation results
    if (validationResults) {
      const invalidEndpoints = validationResults.filter(r => !r.valid);
      if (invalidEndpoints.length > 0) {
        recommendations.push(
          `${invalidEndpoints.length} endpoints have type definition issues. Update TypeScript types to match actual API responses.`
        );
      }

      const totalMissingFields = validationResults.reduce(
        (sum, r) => sum + r.missingFields.length,
        0
      );
      if (totalMissingFields > 0) {
        recommendations.push(
          `Found ${totalMissingFields} missing fields across all endpoints. These should be added to the type definitions.`
        );
      }
    }

    // General recommendations
    if (testResults.length === 0) {
      recommendations.push('No tests were run. Configure endpoints to test in endpoints.json');
    }

    return recommendations;
  }

  private async saveReport(report: TestReport): Promise<string> {
    const resultsDir = path.join(__dirname, '../results');
    await fs.mkdir(resultsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `report-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nReport saved to: ${filepath}`);

    return filepath;
  }

  private async generateMarkdownReport(report: TestReport): Promise<void> {
    const resultsDir = path.join(__dirname, '../results');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `report-${timestamp}.md`;
    const filepath = path.join(resultsDir, filename);

    let markdown = `# Reddit API Test Report\n\n`;
    markdown += `Generated: ${report.timestamp}\n\n`;

    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- Total Tests: ${report.summary.totalTests}\n`;
    markdown += `- Successful: ${report.summary.successful}\n`;
    markdown += `- Failed: ${report.summary.failed}\n`;
    markdown += `- Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms\n\n`;

    // Endpoint Results
    markdown += `## Endpoint Results\n\n`;
    markdown += `| Endpoint | Method | Status | Response Time | Status Code | Error |\n`;
    markdown += `|----------|--------|--------|---------------|-------------|-------|\n`;
    
    report.summary.endpoints.forEach(endpoint => {
      const status = endpoint.success ? '✅' : '❌';
      const error = endpoint.error || '-';
      const statusCode = endpoint.statusCode || '-';
      markdown += `| ${endpoint.endpoint} | ${endpoint.method} | ${status} | ${endpoint.responseTime}ms | ${statusCode} | ${error} |\n`;
    });

    // Type Validation
    if (report.typeValidation) {
      markdown += `\n## Type Validation\n\n`;
      markdown += `- Total Validated: ${report.typeValidation.totalValidated}\n`;
      markdown += `- Passed: ${report.typeValidation.passedValidation}\n`;
      markdown += `- Failed: ${report.typeValidation.failedValidation}\n\n`;

      if (report.typeValidation.issues.length > 0) {
        markdown += `### Issues Found\n\n`;
        report.typeValidation.issues.forEach(issue => {
          markdown += `- **${issue.endpoint}** (${issue.issueType}): ${issue.details}\n`;
        });
      }
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += `\n## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    await fs.writeFile(filepath, markdown, 'utf-8');
    console.log(`Markdown report saved to: ${filepath}`);
  }

  printSummary(report: TestReport, verbose: boolean = false): void {
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏱️  Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`);

    // Show failed endpoints details
    const failedEndpoints = report.summary.endpoints.filter(e => !e.success);
    if (failedEndpoints.length > 0) {
      console.log('\n❌ Failed Endpoints:');
      failedEndpoints.forEach(endpoint => {
        console.log(`  • ${endpoint.method} ${endpoint.endpoint}`);
        console.log(`    Status: ${endpoint.statusCode || 'N/A'}`);
        console.log(`    Error: ${endpoint.error || 'Unknown error'}`);
      });
    }

    // Show slow endpoints
    const slowEndpoints = report.summary.endpoints.filter(e => e.responseTime > 2000);
    if (slowEndpoints.length > 0 && verbose) {
      console.log('\n🐌 Slow Endpoints (>2s):');
      slowEndpoints.forEach(endpoint => {
        console.log(`  • ${endpoint.method} ${endpoint.endpoint}: ${endpoint.responseTime}ms`);
      });
    }

    if (report.typeValidation) {
      console.log('\n🔍 Type Validation:');
      console.log(`Validated: ${report.typeValidation.totalValidated}`);
      console.log(`Passed: ${report.typeValidation.passedValidation}`);
      console.log(`Failed: ${report.typeValidation.failedValidation}`);

      // Show type validation issues
      if (report.typeValidation.issues.length > 0) {
        console.log('\n⚠️  Type Issues:');
        
        // Group issues by endpoint
        const issuesByEndpoint = report.typeValidation.issues.reduce((acc, issue) => {
          if (!acc[issue.endpoint]) {
            acc[issue.endpoint] = [];
          }
          acc[issue.endpoint].push(issue);
          return acc;
        }, {} as Record<string, TypeIssue[]>);

        Object.entries(issuesByEndpoint).forEach(([endpoint, issues]) => {
          console.log(`\n  ${endpoint}:`);
          issues.forEach(issue => {
            const icon = issue.issueType === 'mismatch' ? '🔄' : 
                        issue.issueType === 'missing' ? '❓' : '➕';
            console.log(`    ${icon} ${issue.details}`);
          });
        });
      }
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    // Show all endpoint results in verbose mode
    if (verbose) {
      console.log('\n📋 All Endpoint Results:');
      console.log('─'.repeat(80));
      report.summary.endpoints.forEach(endpoint => {
        const status = endpoint.success ? '✅' : '❌';
        console.log(`${status} ${endpoint.method} ${endpoint.endpoint}`);
        console.log(`   Response Time: ${endpoint.responseTime}ms`);
        console.log(`   Status Code: ${endpoint.statusCode || 'N/A'}`);
        if (endpoint.error) {
          console.log(`   Error: ${endpoint.error}`);
        }
        console.log('─'.repeat(80));
      });
    }
  }
}