// pages/api/fetch-ical.js
import https from 'https';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        res.setHeader('Content-Type', 'text/calendar');
        res.status(200).send(data);
      });
    }).on('error', (err) => {
      res.status(500).json({ error: 'Failed to fetch iCal data', details: err.message });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
