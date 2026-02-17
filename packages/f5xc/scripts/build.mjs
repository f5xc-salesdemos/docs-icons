#!/usr/bin/env node

/**
 * Converts F5 Distributed Cloud (XC) service SVGs into a single Iconify JSON file.
 *
 * - Reads SVGs from the local svg/ directory
 * - Strips common suffixes like -24x24, _24_x_24 from filenames
 * - Replaces hard-coded dark colors with `currentColor` for theme adaptability
 * - Preserves `fill="none"` and `fill="#fff"` (structural/white fills)
 * - Extracts SVG body (content between <svg> tags)
 * - Reads viewBox dimensions from the <svg> element
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgDir = join(__dirname, '..', 'svg');
const outFile = join(__dirname, '..', 'icons.json');

const files = readdirSync(svgDir).filter((f) => f.endsWith('.svg')).sort();

const icons = {};
const skipped = [];

for (const file of files) {
  // Derive icon name: strip .svg, then clean up size suffixes
  let name = basename(file, '.svg');

  // Remove size suffixes: -24x24, _24_x_24, -464-384, etc.
  name = name.replace(/[-_]\d+[-x_]+\d+$/i, '');
  // Remove trailing -image if present (e.g. platform-image)
  name = name.replace(/-image$/, '');

  const raw = readFileSync(join(svgDir, file), 'utf8');

  // Extract viewBox dimensions
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

  let body = bodyMatch[1].trim();

  // Replace dark colors with currentColor for theme adaptability
  body = body.replace(/fill="#231f20"/gi, 'fill="currentColor"');
  body = body.replace(/fill="#0{3,6}"/gi, 'fill="currentColor"');
  body = body.replace(/stroke="#231f20"/gi, 'stroke="currentColor"');
  body = body.replace(/stroke="#0{3,6}"/gi, 'stroke="currentColor"');
  body = body.replace(/stroke="#222"/gi, 'stroke="currentColor"');

  // If icon name already exists (e.g. platform from platform.svg and platform-image-464-384.svg),
  // keep the first one (smaller/simpler icon)
  if (icons[name]) {
    console.log(`SKIP duplicate name "${name}" from ${file}`);
    continue;
  }

  icons[name] = { body, width, height };
}

const output = {
  prefix: 'f5xc',
  icons,
};

writeFileSync(outFile, JSON.stringify(output, null, 2));

console.log(`Built ${Object.keys(icons).length} icons → ${outFile}`);
if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length}: ${skipped.join(', ')}`);
}
