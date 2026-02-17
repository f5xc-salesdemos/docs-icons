#!/usr/bin/env node

/**
 * Orchestrates build scripts for all icon packages that require them.
 *
 * Packages with build steps:
 * - f5-brand: SVG → Iconify JSON (from local SVGs)
 * - f5xc: SVG → Iconify JSON (from local SVGs)
 * - hashicorp-flight: SVG → Iconify JSON (from @hashicorp/flight-icons)
 *
 * Iconify wrapper packages (lucide, mdi, carbon, phosphor, tabler) do not
 * need a build step — they import directly from their @iconify-json/* deps.
 */

import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const builds = [
  { name: 'f5-brand', script: 'packages/f5-brand/scripts/build.mjs' },
  { name: 'hashicorp-flight', script: 'packages/hashicorp-flight/scripts/build.mjs' },
  { name: 'f5xc', script: 'packages/f5xc/scripts/build.mjs' },
];

let failed = false;

for (const { name, script } of builds) {
  console.log(`\n--- Building ${name} ---`);
  try {
    execSync(`node ${join(root, script)}`, { stdio: 'inherit', cwd: root });
  } catch (err) {
    console.error(`FAILED: ${name}`);
    failed = true;
  }
}

if (failed) {
  console.error('\nSome builds failed.');
  process.exit(1);
} else {
  console.log('\nAll builds succeeded.');
}
