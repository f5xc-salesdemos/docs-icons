#!/usr/bin/env node

/**
 * Copies the Iconify JSON file from @iconify-json/ph into this package
 * so it can be exported alongside Icon.astro.
 */

import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const source = require.resolve('@iconify-json/ph/icons.json');
const dest = join(__dirname, '..', 'icons.json');

copyFileSync(source, dest);
console.log(`Copied phosphor icons.json → ${dest}`);
