const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLine, summarize } = require('../src/summarize');

const sample = fs.readFileSync(path.join(__dirname, '..', 'samples', 'sample.log'), 'utf8');

test('parseLine reads a valid line', () => {
  assert.deepEqual(parseLine('2026-10-16T10:00:00Z WARN disk usage at 85%'), {
    timestamp: '2026-10-16T10:00:00Z', level: 'WARN', message: 'disk usage at 85%',
  });
});

test('malformed lines are not parsed (bad shape, unknown level, impossible date, no message)', () => {
  for (const bad of ['this line is malformed', '2026-10-16T10:00:00Z DEBUG nope', '2026-13-45T10:00:00Z INFO impossible date', '2026-10-16T10:00:00Z INFO']) {
    assert.equal(parseLine(bad), null, bad);
  }
});

test('malformed lines are counted and skipped without stopping', () => {
  const r = summarize('garbage line\n2026-10-16T10:00:00Z INFO ok\nmore garbage');
  assert.deepEqual([r.valid, r.malformed], [1, 2]);
});

test('the sample log produces exactly the expected summary', () => {
  assert.deepEqual(summarize(sample), {
    valid: 6, malformed: 1, levels: { INFO: 2, WARN: 1, ERROR: 3 },
    topMessages: [
      { message: 'failed to connect to database', count: 2 },
      { message: 'disk usage at 85%', count: 1 },
      { message: 'server restarted', count: 1 },
    ],
  });
});

test('ties are broken alphabetically by message', () => {
  const log = ['b-msg', 'c-msg', 'a-msg', 'd-msg'].map((m) => `2026-10-16T10:00:00Z INFO ${m}`).join('\n');
  assert.deepEqual(summarize(log).topMessages.map((t) => t.message), ['a-msg', 'b-msg', 'c-msg']);
});

test('higher counts come first and only the top 3 are returned', () => {
  const lines = [...Array(3).fill('x'), ...Array(2).fill('y'), 'a', 'b', 'c'].map((m) => `2026-10-16T10:00:00Z ERROR ${m}`).join('\n');
  assert.deepEqual(summarize(lines).topMessages, [{ message: 'x', count: 3 }, { message: 'y', count: 2 }, { message: 'a', count: 1 }]);
});

test('all three levels are present even when their count is 0', () => {
  assert.deepEqual(summarize('').levels, { INFO: 0, WARN: 0, ERROR: 0 });
  assert.deepEqual(summarize('2026-10-16T10:00:00Z WARN w').levels, { INFO: 0, WARN: 1, ERROR: 0 });
});

test('blank lines are ignored and Windows (CRLF) line endings work', () => {
  const r = summarize('2026-10-16T10:00:00Z INFO a\r\n\r\n   \r\n2026-10-16T10:00:01Z INFO a\r\n');
  assert.deepEqual([r.valid, r.malformed, r.topMessages[0]], [2, 0, { message: 'a', count: 2 }]);
});
