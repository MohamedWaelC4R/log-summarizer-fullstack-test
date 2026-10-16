import { useState } from 'react';
import Summary from './Summary.jsx';

const EXAMPLE = `2026-10-16T10:00:00Z INFO server started
2026-10-16T10:00:05Z WARN disk usage at 85%
2026-10-16T10:01:12Z ERROR failed to connect to database
2026-10-16T10:01:13Z INFO server restarted
this line is malformed
2026-10-16T10:02:00Z ERROR failed to connect to database
2026-10-16T10:03:00Z ERROR timeout while reading request
`;

export default function App() {
  const [text, setText] = useState(EXAMPLE);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function summarize(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/summarize', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: text });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'The summary could not be created.');
      setSummary(body);
    } catch (e) {
      setSummary(null);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadFile(event) {
    const file = event.target.files?.[0];
    if (file) setText(await file.text());
  }

  return (
    <main>
      <h1>Log Summarizer</h1>
      <p className="lead">Paste a log or choose a file. Each valid line is <code>timestamp LEVEL message</code>.</p>

      <form onSubmit={summarize}>
        <label htmlFor="file">Load a log file</label>
        <input id="file" type="file" accept=".log,.txt,text/plain" onChange={loadFile} />

        <label htmlFor="log">Log text</label>
        <textarea id="log" rows={10} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />

        <button type="submit" disabled={busy || text.trim() === ''}>{busy ? 'Summarizing…' : 'Summarize'}</button>
      </form>

      {error && <p role="alert" className="error">{error}</p>}
      {summary && <Summary summary={summary} />}
    </main>
  );
}
