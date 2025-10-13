# Known Build Warnings

This document lists expected warnings that appear during development and production builds. These are informational only and do not indicate problems with the code.

## Sass Deprecation Warnings

### Description
When running `npm start` or `npm run build`, you'll see warnings about Sass `@import` being deprecated:

```
WARNING in ./src/styles/bootstrap.scss
Deprecation Warning: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

### Why This Appears
- We use `@import` statements in `client/src/styles/bootstrap.scss` to import Bootstrap SCSS modules
- Bootstrap 5.x **requires** `@import` syntax for proper mixin/variable sharing across modules
- Using the modern `@use` syntax breaks Bootstrap's internal dependencies

### Is This A Problem?
**No.** This is expected and harmless:
- These are informational warnings, not errors
- The build completes successfully
- All functionality works correctly
- Bootstrap itself uses deprecated `@import` internally

### When Will This Be Fixed?
- **Bootstrap 6** (future release) will migrate to modern Sass `@use` syntax
- When Bootstrap 6 is released, we can update our imports to use `@use` without issues
- Until then, `@import` is the correct and only working solution

### Configuration
We've configured webpack to suppress Bootstrap's internal deprecation warnings via `quietDeps: true` in `webpack/webpack.common.js`. However, warnings from our own SCSS files (like `bootstrap.scss`) will still appear because they need to be visible for debugging.

## Production Build Size Warnings

### Description
When running `npm run build`, you may see warnings about bundle sizes:

```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
```

### Why This Appears
- The vendor bundle includes React, Redux, and other dependencies
- These are necessary for the application to function

### Is This A Problem?
**No.** This is informational:
- The warnings suggest optimization opportunities
- We've already completed Phase 3 tree-shaking optimization
- Further optimization would require code splitting or lazy loading (future enhancement)
- Current bundle sizes are acceptable for the application's complexity

## Summary

All warnings listed in this document are:
- ✅ **Expected** - they will appear on every build
- ✅ **Harmless** - they do not affect functionality
- ✅ **Documented** - this file explains why they exist
- ✅ **Will be resolved** - when Bootstrap 6 is released

**You can safely ignore these warnings during development and deployment.**

---

**Last Updated:** January 2025
**Bootstrap Version:** 5.3.8
**Dart Sass Version:** As specified in package.json
