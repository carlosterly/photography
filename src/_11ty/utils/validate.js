#!/usr/bin/env node
// Guards the two footguns from UPGRADE_PLAN/ROADMAP: a broken hand-edited
// galleries.json, and stray placeholder/http/leading-space URLs surviving
// into the built output. Run via `npm run validate` (after a build) or as
// part of `npm run build` / the pre-commit hook (see docs/validate.md).
"use strict";

const fs = require("fs");
const path = require("path");
const { validateAgainstSchema } = require("../schemas/jsonSchema.js");

const ROOT = path.join(__dirname, "..", "..", "..");
const GALLERIES_PATH = path.join(ROOT, "src", "_data", "galleries.json");
const GALLERIES_SCHEMA_PATH = path.join(__dirname, "..", "schemas", "galleries.schema.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const CHECKED_EXTENSIONS = [".html", ".xml"];

const errors = [];
const warnings = [];

function validateGalleries() {
  let raw;
  try {
    raw = fs.readFileSync(GALLERIES_PATH, "utf8");
  } catch (e) {
    errors.push(`cannot read ${GALLERIES_PATH}: ${e.message}`);
    return;
  }

  let galleries;
  try {
    galleries = JSON.parse(raw);
  } catch (e) {
    errors.push(`${GALLERIES_PATH} is not valid JSON: ${e.message}`);
    return;
  }

  const schema = JSON.parse(fs.readFileSync(GALLERIES_SCHEMA_PATH, "utf8"));
  for (const err of validateAgainstSchema(schema, galleries)) {
    errors.push(`galleries.json: ${err}`);
  }

  // Not expressible in the schema interpreter (no "uniqueness" keyword):
  // per-photo page URLs are /gallery/<gallery>/<slug>/, so slugs only need
  // to be unique within their own gallery, not globally.
  for (const [galleryName, gallery] of Object.entries(galleries)) {
    if (!Array.isArray(gallery.images)) continue;
    const seen = new Map();
    gallery.images.forEach((image, i) => {
      if (typeof image.slug !== "string") return;
      if (seen.has(image.slug)) {
        errors.push(
          `galleries.json: ${galleryName}.images[${i}].slug "${image.slug}" duplicates images[${seen.get(image.slug)}]`
        );
      } else {
        seen.set(image.slug, i);
      }
    });
  }
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (CHECKED_EXTENSIONS.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function validateBuiltOutput() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    errors.push(`${PUBLIC_DIR} does not exist — run the build before validate`);
    return;
  }

  const errorChecks = [
    { name: "insecure http:// src/href", pattern: /(?:src|href)\s*=\s*"http:\/\//i },
    { name: "leading-space src/href", pattern: /(?:src|href)\s*=\s*"\s+/i },
  ];
  // Non-fatal until ROADMAP.md Phase 2 item 6 replaces the lorem-ipsum
  // articles' placeholder images — promote to errorChecks once that's done.
  const warningChecks = [
    { name: "via.placeholder.com reference", pattern: /via\.placeholder\.com/ },
  ];

  for (const file of walk(PUBLIC_DIR)) {
    const content = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);
    for (const check of errorChecks) {
      if (check.pattern.test(content)) {
        errors.push(`${rel}: found ${check.name}`);
      }
    }
    for (const check of warningChecks) {
      if (check.pattern.test(content)) {
        warnings.push(`${rel}: found ${check.name}`);
      }
    }
  }
}

validateGalleries();
validateBuiltOutput();

if (warnings.length > 0) {
  console.warn(`validate: ${warnings.length} warning(s) (non-fatal):\n`);
  for (const warning of warnings) {
    console.warn(`  - ${warning}`);
  }
  console.warn("");
}

if (errors.length > 0) {
  console.error(`validate: ${errors.length} problem(s) found:\n`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log("validate: OK" + (warnings.length > 0 ? " (with warnings above)" : ""));
