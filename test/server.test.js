const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/server');

let server;
let base;
before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (body, type = 'text/plain') => fetch(`${base}/api/summarize`, { method: 'POST', headers: { 'Content-Type': type }, body });

test('POST /api/summarize returns the summary for text/plain', async () => {
  const res = await post('2026-10-16T10:00:00Z ERROR boom\nnot a log line\n');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { valid: 1, malformed: 1, levels: { INFO: 0, WARN: 0, ERROR: 1 }, topMessages: [{ message: 'boom', count: 1 }] });
});

test('an empty body or another content type is a 400 with a helpful message', async () => {
  for (const res of [await post('   '), await post('{"a":1}', 'application/json')]) {
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /text\/plain/);
  }
});

test('a body over 1 MB is a 413', async () => {
  const res = await post('x'.repeat(1024 * 1024 + 10));
  assert.equal(res.status, 413);
});

test('GET /api/health answers ok', async () => {
  assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { status: 'ok' });
});
