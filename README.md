# TikTok Video Downloader

A web application to download TikTok videos without watermarks using RapidAPI.

## Features

- Download TikTok videos without watermarks
- Download audio from TikTok videos
- Download cover images
- Beautiful, modern UI with Tailwind CSS
- Responsive design

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Usage

1. Make sure both backend and frontend servers are running
2. Open your browser and go to the frontend URL (usually `http://localhost:5173`)
3. Paste a TikTok video URL in the input field
4. Click "Download Video"
5. Once the video is loaded, you can preview it and download it using the download buttons

## API Configuration

The RapidAPI key is configured in `backend/server.js`. Make sure to keep your API key secure and never expose it in the frontend code.

## Project Structure

```
tiktok/
├── backend/
│   ├── server.js          # Express server with RapidAPI integration
│   └── package.json       # Backend dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   └── App.css        # Styles
    └── package.json       # Frontend dependencies
```

