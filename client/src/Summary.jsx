const LEVELS = ['INFO', 'WARN', 'ERROR'];

export default function Summary({ summary }) {
  const total = Math.max(1, summary.valid);
  return (
    <section aria-labelledby="result-title" className="result">
      <h2 id="result-title">Summary</h2>

      <dl className="totals">
        <div><dt>Valid lines</dt><dd data-testid="valid">{summary.valid}</dd></div>
        <div><dt>Malformed lines</dt><dd data-testid="malformed">{summary.malformed}</dd></div>
      </dl>

      <h3>Lines per level</h3>
      <ul className="levels">
        {LEVELS.map((level) => (
          <li key={level}>
            <span className="name">{level}</span>
            <span className="bar" aria-hidden="true"><span className={`fill ${level.toLowerCase()}`} style={{ width: `${(summary.levels[level] / total) * 100}%` }} /></span>
            <span className="count">{summary.levels[level]}</span>
          </li>
        ))}
      </ul>

      <h3>Most frequent messages</h3>
      {summary.topMessages.length === 0 ? (
        <p>No valid lines, so there are no messages to rank.</p>
      ) : (
        <table>
          <thead><tr><th scope="col">Message</th><th scope="col">Count</th></tr></thead>
          <tbody>
            {summary.topMessages.map((m) => (<tr key={m.message}><td>{m.message}</td><td>{m.count}</td></tr>))}
          </tbody>
        </table>
      )}

      <details>
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      </details>
    </section>
  );
}
