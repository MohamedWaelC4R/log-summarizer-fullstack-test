// A valid line is: <ISO-8601 timestamp (UTC or offset)> <LEVEL> <message>
const LEVELS = ['INFO', 'WARN', 'ERROR'];
const LINE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}) (INFO|WARN|ERROR) (\S.*)$/;
const TOP_MESSAGE_LIMIT = 3;

function isRealDate(year, month, day, hour, minute, second) {
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
    && hour < 24 && minute < 60 && second < 60;
}

/** Parses one line into { timestamp, level, message }, or returns null when the line is malformed. */
function parseLine(line) {
  const match = LINE_PATTERN.exec(line);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  if (!isRealDate(+y, +mo, +d, +h, +mi, +s)) return null;
  const timestamp = line.slice(0, line.indexOf(' '));
  return { timestamp, level: match[7], message: match[8] };
}

function compareMessages(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Summarizes log text. Blank lines are ignored; every other line is valid or malformed. Handles LF and CRLF. */
function summarize(text) {
  const lines = String(text).split(/\r?\n/).filter((line) => line.trim() !== '');
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  const counts = new Map();
  let valid = 0;
  let malformed = 0;

  for (const line of lines) {
    const record = parseLine(line);
    if (!record) {
      malformed += 1;
      continue;
    }
    valid += 1;
    levels[record.level] += 1;
    counts.set(record.message, (counts.get(record.message) ?? 0) + 1);
  }

  const topMessages = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || compareMessages(a[0], b[0]))
    .slice(0, TOP_MESSAGE_LIMIT)
    .map(([message, count]) => ({ message, count }));

  return { valid, malformed, levels, topMessages };
}

module.exports = { parseLine, summarize };
