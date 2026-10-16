const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const cli = path.join(root, 'src', 'cli.js');
const runCli = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('prints the JSON summary and exits 0 for the sample log', () => {
  const r = runCli(path.join(root, 'samples', 'sample.log'));
  assert.equal(r.status, 0);
  const summary = JSON.parse(r.stdout);
  assert.equal(summary.valid, 6);
  assert.equal(summary.topMessages[0].message, 'failed to connect to database');
});

test('a missing file prints a clear error to stderr, nothing to stdout, and exits with code 1', () => {
  const r = runCli(path.join(root, 'samples', 'does-not-exist.log'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /does not exist/);
  assert.equal(r.stdout, '');
});

test('no file argument shows usage and exits with code 1', () => {
  const r = runCli();
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Usage/);
});
