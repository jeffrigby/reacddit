---
name: Research
description: Research libraries, frameworks, APIs, and best practices using official documentation, code examples, and web resources. Invoke when user asks to research, investigate, look up, or learn about any technology, library, package, or development pattern.
allowed-tools:
  - mcp__context7__resolve-library-id
  - mcp__context7__get-library-docs
  - Bash(gh *)
  - WebSearch
  - WebFetch
---

# Research Skill

This skill provides a systematic approach to researching technologies, libraries, frameworks, APIs, and best practices.

## Workflow

When researching a topic, follow this structured approach:

### 1. Official Documentation (Context7)

**Always start here** - Official docs contain the most accurate, up-to-date information.

```
1. Use mcp__context7__resolve-library-id to find the correct library
2. Use mcp__context7__get-library-docs to retrieve documentation
3. Focus on: current best practices, API changes, migration guides, examples
```

**Tips:**
- Request 8000-10000 tokens for comprehensive topics
- Use the `topic` parameter to focus on specific areas (e.g., "hooks", "routing", "migration")
- Look for version-specific docs if the project uses a particular version

### 2. Code Examples (GitHub)

**Second priority** - Real-world usage patterns and examples.

Use `gh` commands to find examples:
```bash
# Search for code examples in popular repos
gh search code "your search query" --language typescript

# View specific files
gh api repos/owner/repo/contents/path/to/file

# Find issues/discussions about the topic
gh search issues "your topic" --repo owner/repo
```

**What to look for:**
- Common patterns and idioms
- How maintainers structure code
- Solutions to common problems
- Migration examples

### 3. Web Search (Supplementary)

**Use when needed** - For recent changes, community insights, or topics not well-covered in docs.

```
1. Use WebSearch for recent articles, blog posts, announcements
2. Use WebFetch to retrieve and parse specific pages
3. Focus on: official blogs, trusted tech sites, recent Stack Overflow
```

**Good search queries:**
- "[library name] best practices 2025"
- "[library name] migration guide"
- "[library name] [specific feature] tutorial"
- "[library name] vs [alternative]"

## Research Output

Provide findings in this format:

```markdown
# Research: [Topic]

## Official Documentation Summary
- Key points from Context7 docs
- Current best practices
- Important API notes

## Code Examples
- Patterns found in GitHub repos
- Links to relevant examples
- Common implementations

## Additional Findings
- Recent articles or discussions
- Community recommendations
- Gotchas or known issues

## Recommendation
[Your synthesis and recommendation based on all sources]
```

## Examples

### Example 1: Researching Redux Toolkit Query
```
User: "Research RTK Query for data fetching"

Actions:
1. resolve-library-id for "redux toolkit"
2. get-library-docs with topic="RTK Query"
3. gh search code "rtk query" --language typescript
4. WebSearch "RTK Query best practices 2025"
5. WebFetch official Redux blog posts about RTK Query
```

### Example 2: Researching React 19 Features
```
User: "What's new in React 19?"

Actions:
1. resolve-library-id for "react"
2. get-library-docs for /facebook/react (if version 19 available)
3. gh search issues "react 19" --repo facebook/react
4. WebSearch "react 19 new features"
5. WebFetch react.dev blog for announcements
```

## Best Practices

1. **Always check official docs first** - Don't rely solely on web search
2. **Verify recency** - Check dates on articles and examples
3. **Cross-reference** - If docs and examples conflict, investigate why
4. **Note versions** - Best practices change between versions
5. **Cite sources** - Include links so user can verify
6. **Synthesize** - Don't just dump information; provide analysis

## When NOT to Use This Skill

- Simple questions answerable from your training data
- Questions about the current codebase (use code exploration instead)
- Debugging specific code (use appropriate debugging workflow)