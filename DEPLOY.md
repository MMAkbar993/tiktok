# Deploying to Vercel

## Steps to Deploy:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the project root**:
   ```bash
   vercel
   ```

   Or deploy to production directly:
   ```bash
   vercel --prod
   ```

## Project Structure for Vercel:

- `/api` - Serverless functions (automatically detected by Vercel)
  - `/api/download.js` - TikTok video info endpoint
  - `/api/proxy.js` - Video/audio/image proxy endpoint
- `/frontend` - React frontend application
- `vercel.json` - Vercel configuration

## Important Notes:

1. **API Routes**: The API functions are automatically available at:
   - `https://your-domain.vercel.app/api/download`
   - `https://your-domain.vercel.app/api/proxy`

2. **Frontend**: The frontend will automatically use relative URLs (`/api/...`) in production, so it will work with your Vercel domain.

3. **Environment Variables**: If you need to change the RapidAPI key, you can set it as an environment variable in Vercel dashboard:
   - Go to your project settings
   - Add environment variable: `RAPIDAPI_KEY`
   - Update `api/download.js` to use `process.env.RAPIDAPI_KEY`

## Troubleshooting:

- If you get 404 errors, make sure:
  - The `/api` folder is at the root of your project
  - The `vercel.json` is configured correctly
  - You're deploying from the project root directory

- If API calls fail:
  - Check Vercel function logs in the dashboard
  - Make sure the RapidAPI key is valid
  - Verify CORS headers are set correctly

