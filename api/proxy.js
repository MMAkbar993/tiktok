import https from 'https';
import http from 'http';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Set headers to allow download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="download"`);

    // Proxy the request with redirect handling
    const makeRequest = (requestUrl, followRedirects = true) => {
      return new Promise((resolve, reject) => {
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
              return makeRequest(fullRedirectUrl, true).then(resolve).catch(reject);
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
          proxyRes.on('end', resolve);
        });

        proxyReq.on('error', (error) => {
          console.error('Proxy request error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch resource' });
          }
          reject(error);
        });

        proxyReq.end();
      });
    };

    return makeRequest(url, true).catch((error) => {
      console.error('Proxy error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

