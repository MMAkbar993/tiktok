import https from 'https';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'TikTok URL is required' });
    }

    // Validate TikTok URL
    if (!url.includes('tiktok.com')) {
      return res.status(400).json({ error: 'Invalid TikTok URL' });
    }

    // Encode the URL for the API request
    const encodedUrl = encodeURIComponent(url);

    const options = {
      method: 'GET',
      hostname: 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com',
      port: null,
      path: `/rich_response/index?url=${encodedUrl}`,
      headers: {
        'x-rapidapi-key': 'f3713ab80cmshf8fa7ee8ed43cd6p1b12bejsn5c6316c36605',
        'x-rapidapi-host': 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com'
      }
    };

    return new Promise((resolve) => {
      const apiRequest = https.request(options, (apiRes) => {
        const chunks = [];

        apiRes.on('data', (chunk) => {
          chunks.push(chunk);
        });

        apiRes.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            const data = JSON.parse(body.toString());
            res.status(200).json(data);
            resolve();
          } catch (error) {
            console.error('Error parsing API response:', error);
            res.status(500).json({ error: 'Failed to parse API response' });
            resolve();
          }
        });
      });

      apiRequest.on('error', (error) => {
        console.error('API request error:', error);
        res.status(500).json({ error: 'Failed to fetch video data' });
        resolve();
      });

      apiRequest.end();
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

