const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const { summarize } = require('./summarize');

const MAX_BODY = '1mb';

function createApp() {
  const app = express();

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // The log text is the raw request body (Content-Type: text/plain).
  app.post('/api/summarize', express.text({ type: 'text/plain', limit: MAX_BODY }), (req, res) => {
    if (typeof req.body !== 'string' || req.body.trim() === '') {
      return res.status(400).json({ error: 'Send the log text as text/plain in the request body.' });
    }
    return res.json(summarize(req.body));
  });

  // Serve the built React app when it exists (npm run build).
  const dist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  // Four arguments make this an Express error handler.
  app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ error: `The log is larger than ${MAX_BODY}.` });
    return res.status(500).json({ error: 'Something went wrong.' });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => console.log(`Log summarizer on http://localhost:${port}`));
}

module.exports = { createApp };
