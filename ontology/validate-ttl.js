#!/usr/bin/env node

/**
 * Validates that one or more Turtle (.ttl) files are syntactically correct,
 * using N3.js's streaming parser. This only checks Turtle syntax — it does
 * not check the ontology's semantics.
 *
 * Usage:
 *   node ontology/validate-ttl.js     .             # validates every *.ttl in this directory
 *   node ontology/validate-ttl.js path/to/file.ttl  # validates specific file(s)
 *
 * The parse-callback pattern below (error / quad / end-of-stream) follows
 * the official N3.js usage guide:
 * @see https://github.com/rdfjs/N3.js/blob/main/README.md#parsing
 */

const fs = require('node:fs');
const path = require('node:path');
const { Parser } = require('n3');

/**
 * Validates a single Turtle file.
 * 
 * @param {string} filePath
 * @returns {Promise<{ file: string, ok: true, tripleCount: number } | { file: string, ok: false, error: Error }>}
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parser = new Parser({ format: 'text/turtle' });

  return new Promise((resolve) => {
    let tripleCount = 0;

    parser.parse(content, (error, quad) => {
      if (error) {
        resolve({ file: filePath, ok: false, error });
        return;
      }

      if (quad) {
        tripleCount += 1;
      } else {
        // N3 calls back one final time with no quad once parsing finishes successfully.
        resolve({ file: filePath, ok: true, tripleCount });
      }
    });
  });
}

/**
 * Resolves which files to validate (either the paths given on the command
 * line, or every `.ttl` file in this directory when none are given),
 * validates each in turn, prints a `[valid]`/`[invalid]` line per file, and
 * sets a non-zero exit code if any file failed.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const args = process.argv.slice(2);
  const files = args.length > 0
    ? args.map((f) => path.resolve(f))
    : fs
        .readdirSync(__dirname)
        .filter((f) => f.endsWith('.ttl'))
        .map((f) => path.join(__dirname, f));

  if (files.length === 0) {
    console.error('No .ttl files found to validate.');
    process.exitCode = 1;
    return;
  }

  let allValid = true;

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    const result = await validateFile(file);

    if (result.ok) {
      console.log(`[valid]   ${relativePath} (${result.tripleCount} triples)`);
    } else {
      allValid = false;
      console.error(`[invalid] ${relativePath} — ${result.error.message}`);
    }
  }

  process.exitCode = allValid ? 0 : 1;
}

main();
