#!/usr/bin/env node

/**
 * Orchestrates build scripts for all icon packages.
 *
 * Custom packages (SVG → Iconify JSON):
 * - f5-brand: from local SVGs
 * - f5xc: from local SVGs
 * - hashicorp-flight: from @hashicorp/flight-icons
 * - gcp: from AwesomeLogos/google-cloud-icons GitHub SVGs
 *
 * Wrapper packages (copy/transform icons.json from deps):
 * - lucide, carbon, mdi, phosphor, tabler, simple-icons
 * - azure: from azureiconkento npm (with gradient ID namespacing)
 *
 * Fetched packages (pre-built Iconify JSON from GitHub):
 * - aws: from awslabs/aws-icons-for-plantuml
 */

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const builds = [
  { name: "f5-brand", script: "packages/f5-brand/scripts/build.mjs" },
  { name: "hashicorp-flight", script: "packages/hashicorp-flight/scripts/build.mjs" },
  { name: "f5xc", script: "packages/f5xc/scripts/build.mjs" },
  { name: "lucide", script: "packages/lucide/scripts/build.mjs" },
  { name: "carbon", script: "packages/carbon/scripts/build.mjs" },
  { name: "mdi", script: "packages/mdi/scripts/build.mjs" },
  { name: "phosphor", script: "packages/phosphor/scripts/build.mjs" },
  { name: "tabler", script: "packages/tabler/scripts/build.mjs" },
  { name: "simple-icons", script: "packages/simple-icons/scripts/build.mjs" },
  { name: "aws", script: "packages/aws/scripts/build.mjs" },
  { name: "azure", script: "packages/azure/scripts/build.mjs" },
  { name: "gcp", script: "packages/gcp/scripts/build.mjs" },
];

let failed = false;

for (const { name, script } of builds) {
  console.log(`\n--- Building ${name} ---`);
  try {
    execSync(`node ${join(root, script)}`, { stdio: "inherit", cwd: root });
  } catch (err) {
    console.error(`FAILED: ${name}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nSome builds failed.");
  process.exit(1);
} else {
  console.log("\nAll builds succeeded.");
}
