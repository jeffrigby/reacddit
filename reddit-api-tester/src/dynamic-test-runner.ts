import { RedditAPITester, EndpointConfig, TestResult } from './api-tester.js';
import { EndpointProcessor, TemplateVariables } from './endpoint-processor.js';

export interface DynamicTestOptions {
  cleanup?: boolean;
  testSubreddit?: string;
  verbose?: boolean;
}

/**
 * Orchestrates dynamic API tests that require fresh data
 */
export class DynamicTestRunner {
  private apiTester: RedditAPITester;
  private processor: EndpointProcessor;
  private variables: TemplateVariables = {};
  private testPostId: string | null = null;

  constructor(apiTester: RedditAPITester) {
    this.apiTester = apiTester;
    this.processor = new EndpointProcessor();
  }

  /**
   * Prepare dynamic variables by fetching fresh content
   */
  async prepareDynamicVariables(
    configs: EndpointConfig[],
    options: DynamicTestOptions = {}
  ): Promise<TemplateVariables> {
    const subreddit = options.testSubreddit || 'test';
    console.log(`\n🔧 Preparing dynamic test data...\n`);

    // Collect all required variables from configs
    const requiredVars = new Set<string>();
    configs.forEach(config => {
      if (this.processor.isDynamic(config)) {
        this.processor.getRequiredVariables(config).forEach(v => requiredVars.add(v));
      }
    });

    if (options.verbose) {
      console.log(`Required variables: ${Array.from(requiredVars).join(', ')}`);
    }

    // Fetch fresh post if needed
    if (requiredVars.has('POST_ID')) {
      this.testPostId = await this.apiTester.fetchRecentPost(subreddit);
      if (this.testPostId) {
        this.variables.POST_ID = `t3_${this.testPostId}`;
        console.log(`✓ POST_ID set to: ${this.variables.POST_ID}`);
      } else {
        console.warn('⚠️  Could not fetch POST_ID, skipping related tests');
      }
    }

    // Fetch comment if needed
    if (requiredVars.has('COMMENT_ID') && this.testPostId) {
      const commentId = await this.apiTester.fetchRecentComment(subreddit, this.testPostId);
      if (commentId) {
        this.variables.COMMENT_ID = `t1_${commentId}`;
        console.log(`✓ COMMENT_ID set to: ${this.variables.COMMENT_ID}`);
      } else {
        console.warn('⚠️  Could not fetch COMMENT_ID, skipping related tests');
      }
    }

    // Get authenticated username if needed
    if (requiredVars.has('USERNAME')) {
      const username = await this.apiTester.getAuthenticatedUser();
      if (username) {
        this.variables.USERNAME = username;
        console.log(`✓ USERNAME set to: ${this.variables.USERNAME}`);
      } else {
        console.warn('⚠️  Could not fetch USERNAME, skipping related tests');
      }
    }

    // Set subreddit if needed
    if (requiredVars.has('SUBREDDIT')) {
      this.variables.SUBREDDIT = subreddit;
      console.log(`✓ SUBREDDIT set to: ${this.variables.SUBREDDIT}`);
    }

    // Fetch post with comments if needed
    if (requiredVars.has('POST_WITH_COMMENTS_ID') || requiredVars.has('POST_WITH_COMMENTS_SUBREDDIT')) {
      const postWithComments = await this.apiTester.fetchPostWithComments('programming', 50);
      if (postWithComments) {
        this.variables.POST_WITH_COMMENTS_ID = postWithComments.postId;
        this.variables.POST_WITH_COMMENTS_SUBREDDIT = postWithComments.subreddit;
        console.log(`✓ POST_WITH_COMMENTS_ID set to: ${this.variables.POST_WITH_COMMENTS_ID}`);
        console.log(`✓ POST_WITH_COMMENTS_SUBREDDIT set to: ${this.variables.POST_WITH_COMMENTS_SUBREDDIT}`);

        // Extract more children IDs if needed
        if (requiredVars.has('MORE_CHILDREN_IDS')) {
          const moreChildrenIds = await this.apiTester.extractMoreChildrenIds(
            postWithComments.subreddit,
            postWithComments.postId
          );
          if (moreChildrenIds) {
            this.variables.MORE_CHILDREN_IDS = moreChildrenIds;
            console.log(`✓ MORE_CHILDREN_IDS set to: ${this.variables.MORE_CHILDREN_IDS.substring(0, 50)}...`);
          } else {
            console.warn('⚠️  Could not fetch MORE_CHILDREN_IDS, skipping related tests');
          }
        }
      } else {
        console.warn('⚠️  Could not fetch post with comments, skipping related tests');
      }
    }

    console.log(`\n✓ Dynamic variables prepared\n`);
    return this.variables;
  }

  /**
   * Filter configs to only those that can be processed with available variables
   */
  filterValidConfigs(configs: EndpointConfig[]): {
    valid: EndpointConfig[];
    skipped: EndpointConfig[];
  } {
    const valid: EndpointConfig[] = [];
    const skipped: EndpointConfig[] = [];

    for (const config of configs) {
      if (!this.processor.isDynamic(config)) {
        // Static configs are always valid
        valid.push(config);
        continue;
      }

      const validation = this.processor.validateVariables(config, this.variables);
      if (validation.valid) {
        valid.push(config);
      } else {
        console.warn(
          `⚠️  Skipping ${config.endpoint} - missing variables: ${validation.missing.join(', ')}`
        );
        skipped.push(config);
      }
    }

    return { valid, skipped };
  }

  /**
   * Process and run dynamic tests
   */
  async runDynamicTests(
    configs: EndpointConfig[],
    options: DynamicTestOptions = {}
  ): Promise<TestResult[]> {
    // Prepare dynamic variables
    await this.prepareDynamicVariables(configs, options);

    // Filter to valid configs
    const { valid, skipped } = this.filterValidConfigs(configs);

    if (skipped.length > 0) {
      console.log(`📋 Testing ${valid.length} endpoints (${skipped.length} skipped)\n`);
    } else {
      console.log(`📋 Testing ${valid.length} endpoints...\n`);
    }

    // Process configs to replace variables
    const processedConfigs = valid.map(config => {
      if (this.processor.isDynamic(config)) {
        return this.processor.processEndpoint(config, this.variables);
      }
      return config;
    });

    // Run tests
    const results = await this.apiTester.testMultipleEndpoints(processedConfigs);

    // Cleanup if requested
    if (options.cleanup && this.testPostId) {
      console.log('\n');
      await this.apiTester.cleanupTestPost(this.testPostId);
    }

    return results;
  }

  /**
   * Get the variables used in this test run
   */
  getVariables(): TemplateVariables {
    return { ...this.variables };
  }

  /**
   * Check if any configs require dynamic processing
   */
  static hasDynamicEndpoints(configs: EndpointConfig[]): boolean {
    const processor = new EndpointProcessor();
    return configs.some(config => processor.isDynamic(config));
  }

  /**
   * Separate dynamic and static configs
   */
  static separateConfigs(configs: EndpointConfig[]): {
    dynamic: EndpointConfig[];
    static: EndpointConfig[];
  } {
    const processor = new EndpointProcessor();
    const dynamic: EndpointConfig[] = [];
    const static_: EndpointConfig[] = [];

    for (const config of configs) {
      if (processor.isDynamic(config)) {
        dynamic.push(config);
      } else {
        static_.push(config);
      }
    }

    return { dynamic, static: static_ };
  }
}
