#!/usr/bin/env node
const fs = require('node:fs');
const { summarize } = require('./summarize');

/** Runs the CLI and returns the process exit code (0 on success, 1 on any failure). */
function run(argv, io = { out: console.log, err: console.error }) {
  const filePath = argv[0];
  if (!filePath) {
    io.err('Usage: node src/cli.js <path-to-log-file>');
    return 1;
  }
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    io.err(error.code === 'ENOENT'
      ? `Error: the file "${filePath}" does not exist.`
      : `Error: could not read "${filePath}" (${error.code ?? error.message}).`);
    return 1;
  }
  io.out(JSON.stringify(summarize(text), null, 2));
  return 0;
}

if (require.main === module) {
  process.exitCode = run(process.argv.slice(2));
}

module.exports = { run };
