import { useState } from 'react'
import './App.css'

// Use relative URLs in production, localhost in development
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return '/api/download';
  }
  return 'http://localhost:3001/api/download';
};

const getProxyUrl = () => {
  if (import.meta.env.PROD) {
    return '/api/proxy';
  }
  return 'http://localhost:3001/api/proxy';
};

const API_URL = getApiUrl();
const PROXY_URL = getProxyUrl();

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video');
      }

      // Handle different possible response structures
      console.log('API Response:', data);
      setVideoData(data);
    } catch (err) {
      setError(err.message || 'An error occurred while downloading the video');
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async (videoUrl, filename, event) => {
    try {
      const button = event?.target;
      const originalText = button?.textContent;
      
      if (button) {
        button.disabled = true;
        button.textContent = 'Downloading...';
      }
      
      // Use backend proxy to bypass CORS
      const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(videoUrl)}`;
      
      // Fetch the video as a blob through the proxy
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      const blob = await response.blob();
      
      // Create a blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'tiktok-video.mp4';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      // Restore button
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
      if (event?.target) {
        event.target.disabled = false;
        event.target.textContent = originalText || 'Download Video';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            TikTok Video Downloader
          </h1>
          <p className="text-white/90 text-lg">
            Download TikTok videos without watermark
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleDownload} className="space-y-4">
            <div>
              <label htmlFor="tiktok-url" className="block text-gray-700 font-semibold mb-2">
                TikTok Video URL
              </label>
              <input
                id="tiktok-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@username/video/1234567890"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-gray-800"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Download Video'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {videoData && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Video Ready!</h2>
            
            {/* Handle different response structures */}
            {(() => {
              // Try to find video URL in various possible locations
              let videoUrl = null;
              let musicUrl = null;
              let coverUrl = null;
              let authorInfo = null;
              let description = null;

              // Check for video in different possible structures
              if (videoData.video) {
                videoUrl = Array.isArray(videoData.video) ? videoData.video[0] : videoData.video;
              } else if (videoData.video_url) {
                videoUrl = videoData.video_url;
              } else if (videoData.videoUrl) {
                videoUrl = videoData.videoUrl;
              } else if (videoData.data && videoData.data.video) {
                videoUrl = Array.isArray(videoData.data.video) ? videoData.data.video[0] : videoData.data.video;
              } else if (videoData.data && videoData.data.video_url) {
                videoUrl = videoData.data.video_url;
              } else if (videoData.result && videoData.result.video) {
                videoUrl = Array.isArray(videoData.result.video) ? videoData.result.video[0] : videoData.result.video;
              }

              // Check for music/audio
              if (videoData.music) {
                musicUrl = Array.isArray(videoData.music) ? videoData.music[0] : videoData.music;
              } else if (videoData.music_url) {
                musicUrl = videoData.music_url;
              } else if (videoData.data && videoData.data.music) {
                musicUrl = Array.isArray(videoData.data.music) ? videoData.data.music[0] : videoData.data.music;
              }

              // Check for cover image
              if (videoData.cover) {
                coverUrl = videoData.cover;
              } else if (videoData.cover_url) {
                coverUrl = videoData.cover_url;
              } else if (videoData.thumbnail) {
                coverUrl = videoData.thumbnail;
              } else if (videoData.data && videoData.data.cover) {
                coverUrl = videoData.data.cover;
              }

              // Check for author info
              if (videoData.author) {
                authorInfo = videoData.author;
              } else if (videoData.data && videoData.data.author) {
                authorInfo = videoData.data.author;
              }

              // Check for description
              if (videoData.desc) {
                description = videoData.desc;
              } else if (videoData.description) {
                description = videoData.description;
              } else if (videoData.data && videoData.data.desc) {
                description = videoData.data.desc;
              }

              return (
                <>
                  {videoUrl ? (
                    <div className="border-2 border-gray-200 rounded-lg p-4 mb-6">
                      <div className="mb-4">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full rounded-lg max-h-96"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <button
                        onClick={(e) => downloadVideo(videoUrl, 'tiktok-video.mp4', e)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                      >
                        Download Video
                      </button>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6">
                      <p>Video URL not found in response. Check console for full response data.</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer font-semibold">View Response Data</summary>
                        <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
                          {JSON.stringify(videoData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  {musicUrl && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Audio Available</h3>
                      <div className="mb-4">
                        <audio src={musicUrl} controls className="w-full">
                          Your browser does not support the audio tag.
                        </audio>
                        <button
                          onClick={(e) => downloadVideo(musicUrl, 'tiktok-audio.mp3', e)}
                          className="mt-2 w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 active:scale-95"
                        >
                          Download Audio
                        </button>
                      </div>
                    </div>
                  )}

                  {coverUrl && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Cover Image</h3>
                      <img
                        src={coverUrl}
                        alt="Video cover"
                        className="w-full max-w-md mx-auto rounded-lg mb-4"
                      />
                      <button
                        onClick={(e) => downloadVideo(coverUrl, 'tiktok-cover.jpg', e)}
                        className="w-full max-w-md mx-auto block bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95"
                      >
                        Download Cover Image
                      </button>
                    </div>
                  )}

                  {(authorInfo || description) && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Video Info</h3>
                      <div className="text-gray-600 space-y-1">
                        {authorInfo && authorInfo.nickname && (
                          <p><span className="font-semibold">Author:</span> {authorInfo.nickname}</p>
                        )}
                        {authorInfo && authorInfo.unique_id && (
                          <p><span className="font-semibold">Username:</span> @{authorInfo.unique_id}</p>
                        )}
                        {description && (
                          <p><span className="font-semibold">Description:</span> {description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
