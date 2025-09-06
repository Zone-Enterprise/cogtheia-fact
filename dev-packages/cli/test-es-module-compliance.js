#!/usr/bin/env node
// Test for theia-patch.js ES module compliance
// This validates that the CLI script uses proper ES module syntax

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const theiaProjectRoot = process.cwd();
const theiaPathFile = path.join(theiaProjectRoot, 'dev-packages/cli/bin/theia-patch.js');

console.log('🧪 Testing theia-patch.js ES module compliance...\n');

let allTestsPassed = true;

function test(description, condition) {
    if (condition) {
        console.log(`✅ PASS: ${description}`);
    } else {
        console.log(`❌ FAIL: ${description}`);
        allTestsPassed = false;
    }
}

// Test 1: File exists
test('File exists', fs.existsSync(theiaPathFile));

// Test 2: Read file content
const content = fs.readFileSync(theiaPathFile, 'utf8');

// Test 3: Check for required ES module imports
const requiredImports = [
    'import process from "node:process"',
    'import path from "node:path"',
    'import cp from "node:child_process"',
    'import { createRequire } from "node:module"'
];

for (const requiredImport of requiredImports) {
    test(`Contains required import: ${requiredImport}`, content.includes(requiredImport));
}

// Test 4: Check for forbidden CommonJS syntax
const forbiddenPatterns = [
    "const path = require('path')",
    "const cp = require('child_process')",
    "= require('child_process')",
    "= require('path')"
];

for (const forbidden of forbiddenPatterns) {
    test(`No forbidden CommonJS pattern: ${forbidden}`, !content.includes(forbidden));
}

// Test 5: Check for proper createRequire usage
test('Uses createRequire pattern', content.includes('const require = createRequire(import.meta.url)'));

// Test 6: Validate Node.js compatibility
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
test(`Node.js version ${nodeVersion} is >= 20`, majorVersion >= 20);

// Test 7: Syntax validation (try to parse the file without executing)
try {
    // This validates the ES module syntax without running the script
    execSync(`node --check "${theiaPathFile}"`, { encoding: 'utf8' });
    test('File syntax is valid', true);
} catch (error) {
    test(`File syntax is valid: ${error.message}`, false);
}

console.log('\n📊 Final Result:');
if (allTestsPassed) {
    console.log('🎉 SUCCESS: All ES module compliance tests passed!');
    process.exit(0);
} else {
    console.log('💥 FAILURE: Some tests failed. ES module conversion may be incomplete.');
    process.exit(1);
}