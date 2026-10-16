# Log Summarizer (CLI + Express API + React UI)

Reads a plain-text log and returns a JSON summary: valid and malformed line counts, counts per level (`INFO`, `WARN`, `ERROR`, always all three) and the 3 most frequent messages (highest count first, ties broken alphabetically).

A valid line is `<ISO-8601 timestamp> <LEVEL> <message>`, for example `2026-10-16T10:00:00Z ERROR failed to connect`. The timestamp must be a real date. Anything else is malformed, counted and skipped. Blank lines are ignored. LF and CRLF files both work.

## Requirements

Node.js 20 or newer.

## Setup

```bash
npm run install:all     # installs the server and the React client
```

## Run

| What | Command |
|---|---|
| CLI | `node src/cli.js samples/sample.log` (or `npm run cli`) |
| One server for API + UI | `npm run build` then `npm start`, open <http://localhost:3000> |
| Development (hot reload) | `npm run dev:server` and, in a second terminal, `npm run dev:client`, open <http://localhost:5174> |

CLI: a missing or unreadable file prints a clear message to standard error and exits with code 1 (so does a missing argument).

API: `POST /api/summarize` with `Content-Type: text/plain` and the log as the body.

```bash
curl -X POST http://localhost:3000/api/summarize -H "Content-Type: text/plain" --data-binary @samples/sample.log
```

An empty body or another content type returns `400`; a body over 1 MB returns `413`. `GET /api/health` returns `{"status":"ok"}`.

## Tests

```bash
npm test
```

15 tests with Node's built-in runner: parsing, malformed lines, the sample output, the tie-break, top-3 ordering, zero-count levels, blank lines and CRLF, the CLI (success, missing file exit code 1, no argument) and the API (success, 400, 413, health).

## Limitation

The whole log is read into memory (the CLI reads the file at once; the API accepts at most 1 MB), so very large files are not suitable. The API has no authentication, so run it only on a trusted network.
