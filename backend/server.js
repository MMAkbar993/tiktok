import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// TikTok download endpoint
app.post('/api/download', async (req, res) => {
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

    const apiRequest = https.request(options, (apiRes) => {
      const chunks = [];

      apiRes.on('data', (chunk) => {
        chunks.push(chunk);
      });

      apiRes.on('end', () => {
        try {
          const body = Buffer.concat(chunks);
          const data = JSON.parse(body.toString());
          res.json(data);
        } catch (error) {
          console.error('Error parsing API response:', error);
          res.status(500).json({ error: 'Failed to parse API response' });
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('API request error:', error);
      res.status(500).json({ error: 'Failed to fetch video data' });
    });

    apiRequest.end();

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy endpoint to download video/audio/image (bypasses CORS)
app.get('/api/proxy', (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Determine content type based on URL
    let contentType = 'application/octet-stream';
    if (url.includes('.mp4') || url.includes('video')) {
      contentType = 'video/mp4';
    } else if (url.includes('.mp3') || url.includes('music') || url.includes('audio')) {
      contentType = 'audio/mpeg';
    } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('cover')) {
      contentType = 'image/jpeg';
    } else if (url.includes('.png')) {
      contentType = 'image/png';
    }

    // Parse the URL to determine if it's http or https
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    // Set headers to allow download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="download"`);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Proxy the request with redirect handling
    const makeRequest = (requestUrl, followRedirects = true) => {
      const urlObj = new URL(requestUrl);
      const isHttps = urlObj.protocol === 'https:';
      const clientModule = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Referer': 'https://www.tiktok.com/'
        }
      };

      const proxyReq = clientModule.request(options, (proxyRes) => {
        // Handle redirects
        if (followRedirects && (proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308)) {
          const redirectUrl = proxyRes.headers.location;
          if (redirectUrl) {
            // Handle relative redirects
            const fullRedirectUrl = redirectUrl.startsWith('http') 
              ? redirectUrl 
              : `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
            return makeRequest(fullRedirectUrl, true);
          }
        }

        // Set content type from response if available
        if (proxyRes.headers['content-type']) {
          res.setHeader('Content-Type', proxyRes.headers['content-type']);
        }

        // Set content length if available
        if (proxyRes.headers['content-length']) {
          res.setHeader('Content-Length', proxyRes.headers['content-length']);
        }

        // Pipe the response
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (error) => {
        console.error('Proxy request error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to fetch resource' });
        }
      });

      proxyReq.end();
    };

    makeRequest(url, true);

    req.on('close', () => {
      // Request closed by client
    });

  } catch (error) {
    console.error('Proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

