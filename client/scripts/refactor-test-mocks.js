#!/usr/bin/env node

/**
 * Script to help identify test files that could benefit from using global mocks
 * Run with: node scripts/refactor-test-mocks.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to look for in test files
const mockPatterns = [
  {
    name: 'React Router',
    patterns: [
      /const mockNavigate = vi\.fn\(\)/,
      /vi\.mock\(['"]react-router['"]/,
      /useNavigate: \(\) => mockNavigate/,
    ],
    globalImport: 'mockNavigate, mockUseLocation',
  },
  {
    name: 'React Router DOM',
    patterns: [
      /vi\.mock\(['"]react-router-dom['"]/,
      /NavLink:.*=>/,
    ],
    globalImport: 'mockNavigate, mockUseLocation',
  },
  {
    name: 'Query String',
    patterns: [
      /vi\.mock\(['"]query-string['"]/,
      /parse: vi\.fn\(\)/,
      /stringify: vi\.fn\(\)/,
    ],
    globalImport: 'mockQueryString',
  },
  {
    name: 'React Device Detect',
    patterns: [
      /vi\.mock\(['"]react-device-detect['"]/,
      /isMobile: false/,
    ],
    globalImport: 'mockDeviceDetect',
  },
  {
    name: 'Common Module',
    patterns: [
      /vi\.mock\(['"]@\/common['"]/,
      /hotkeyStatus.*vi\.fn/,
    ],
    globalImport: 'mockHotkeyStatus',
  },
  {
    name: 'Date-fns',
    patterns: [
      /vi\.mock\(['"]date-fns['"]/,
      /formatDistanceToNow.*vi\.fn/,
    ],
    globalImport: 'mockFormatDistanceToNow',
  },
  {
    name: 'Window ScrollTo',
    patterns: [
      /window\.scrollTo.*vi\.fn/,
      /Object\.defineProperty.*scrollTo/,
    ],
    globalImport: 'use mockWindowScrollTo() from utils',
  },
];

// Find all test files
const testFiles = glob.sync('src/**/*.test.{ts,tsx}', {
  cwd: process.cwd(),
});

console.log(`Found ${testFiles.length} test files\n`);

const results = [];

// Analyze each test file
testFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const foundMocks = [];
  
  mockPatterns.forEach((mock) => {
    const hasMatch = mock.patterns.some(pattern => pattern.test(content));
    if (hasMatch) {
      foundMocks.push(mock);
    }
  });
  
  if (foundMocks.length > 0) {
    results.push({
      file,
      mocks: foundMocks,
      lineCount: content.split('\n').length,
    });
  }
});

// Sort by number of mocks found
results.sort((a, b) => b.mocks.length - a.mocks.length);

// Display results
console.log('Test files that could use global mocks:\n');
console.log('=' .repeat(80));

results.forEach(({ file, mocks, lineCount }) => {
  console.log(`\n📄 ${file}`);
  console.log(`   Lines: ${lineCount}`);
  console.log('   Mocks found:');
  
  mocks.forEach(mock => {
    console.log(`   - ${mock.name} → import { ${mock.globalImport} } from '@/test/globalMocks'`);
  });
  
  // Estimate lines that could be saved
  const estimatedSaving = mocks.length * 8; // Rough estimate
  console.log(`   💡 Estimated lines saved: ~${estimatedSaving}`);
});

console.log('\n' + '=' .repeat(80));
console.log(`\nTotal files that could be refactored: ${results.length}`);

const totalEstimatedSaving = results.reduce((sum, r) => sum + (r.mocks.length * 8), 0);
console.log(`Total estimated lines saved: ~${totalEstimatedSaving}\n`);

// Generate import statements
console.log('Example import statement for global mocks:');
console.log("import {");
console.log("  mockNavigate,");
console.log("  mockUseLocation,");
console.log("  mockQueryString,");
console.log("  mockHotkeyStatus,");
console.log("  mockDeviceDetect,");
console.log("  mockFormatDistanceToNow,");
console.log("} from '@/test/globalMocks';");
console.log("\nFor window.scrollTo:");
console.log("import { mockWindowScrollTo } from '@/test/utils';");