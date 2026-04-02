// Serverless proxy for Hack Club AI (avoids CORS and hides API key)
// Supports POST and OPTIONS preflight. Forwards request body to Hack Club proxy
// and returns the response unchanged.

import path from 'path';

// If running in Vercel this import is fine; in dev we'll load .env manually if needed
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: path.resolve(__dirname, '../../../../../.env') });
} catch (e) {
  /* ignore - dotenv may not be installed in production runtime */
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // prefer explicit server env var, fall back to VITE_ var used in .env file
  const HACKCLUB_KEY = process.env.HACKCLUB_API_KEY || process.env.VITE_HACKCLUB_API_KEY;
  if (!HACKCLUB_KEY) {
    res.status(500).json({ error: 'Hack Club API key not configured on server (set HACKCLUB_API_KEY or VITE_HACKCLUB_API_KEY)' });
    return;
  }

  try {
    const upstream = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HACKCLUB_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const text = await upstream.text();

    // If upstream returned 401 or 403, surface a clearer message
    if (upstream.status === 401 || upstream.status === 403) {
      console.error('Hack Club upstream auth failure:', upstream.status, text);
      res.status(502).json({ error: 'Upstream authentication failed (invalid Hack Club API key)' });
      return;
    }

    // Mirror status and body
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err: any) {
    console.error('Hack Club proxy error:', err);
    res.status(502).json({ error: 'Proxy request failed' });
  }
}
