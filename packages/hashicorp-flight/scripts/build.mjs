#!/usr/bin/env node

/**
 * Converts HashiCorp Flight 24px SVGs into a single Iconify JSON file.
 *
 * - Reads SVGs from the installed @hashicorp/flight-icons package
 * - Uses only 24px variants (skips 16px)
 * - Strips the `-24` suffix from icon names
 * - Preserves original colors in color variants (vendor logos)
 * - Extracts SVG body (content between <svg> tags)
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve the flight-icons package SVG directory
const flightIconsDir = join(
  dirname(require.resolve('@hashicorp/flight-icons/package.json')),
  'svg'
);

const outFile = join(__dirname, '..', 'icons.json');

const files = readdirSync(flightIconsDir)
  .filter((f) => f.endsWith('-24.svg'))
  .sort();

const icons = {};
const skipped = [];

for (const file of files) {
  // Derive icon name: strip -24.svg suffix
  const name = basename(file, '-24.svg');

  const raw = readFileSync(join(flightIconsDir, file), 'utf8');

  // Extract viewBox dimensions (default 24x24)
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
  let width = 24;
  let height = 24;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number);
    if (parts.length === 4) {
      width = parts[2];
      height = parts[3];
    }
  }

  // Extract SVG body — content between <svg ...> and </svg>
  const bodyMatch = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!bodyMatch) {
    console.warn(`WARN: Could not extract body from ${file}, skipping`);
    skipped.push(file);
    continue;
  }

  const body = bodyMatch[1].trim();

  icons[name] = { body, width, height };
}

const output = {
  prefix: 'hashicorp-flight',
  icons,
};

writeFileSync(outFile, JSON.stringify(output, null, 2));

console.log(`Built ${Object.keys(icons).length} icons → ${outFile}`);
if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length}: ${skipped.join(', ')}`);
}
