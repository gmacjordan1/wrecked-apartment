# Deployment Guide - Wrecked Apartment

This guide covers free deployment options for your Wrecked Apartment application.

## Option 1: Render (Recommended - Easiest for Full-Stack)

Render offers a free tier that's perfect for this application.

### Steps:

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up with GitHub (recommended) or email

2. **Prepare Your Code**
   - Make sure your code is pushed to GitHub
   - Create a `.env` file template (optional, for environment variables)

3. **Deploy the Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `wrecked-apartment-api` (or your choice)
     - **Root Directory**: `server`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Add environment variable: `NODE_ENV=production`
   - Click "Create Web Service"
   - Note the URL (e.g., `https://wrecked-apartment-api.onrender.com`)

4. **Deploy the Frontend**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `wrecked-apartment` (or your choice)
     - **Root Directory**: `client`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   - Add environment variable:
     - `VITE_API_URL` = `https://wrecked-apartment-api.onrender.com` (your backend URL)
   - Click "Create Static Site"

5. **Update Frontend API URL**
   - In `client/src/components/ProjectList.jsx` and other components, change:
     ```javascript
     const API_BASE = '/api'
     ```
     to:
     ```javascript
     const API_BASE = import.meta.env.VITE_API_URL || '/api'
     ```
   - Or create a `.env` file in the `client` folder:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

6. **Update Backend CORS**
   - In `server/index.js`, update CORS to allow your frontend URL:
     ```javascript
     app.use(cors({
       origin: ['https://your-frontend-url.onrender.com', 'http://localhost:3000']
     }))
     ```

### Render Free Tier Limits:
- Services spin down after 15 minutes of inactivity
- 750 hours/month free (enough for always-on if you have one service)
- Automatic SSL certificates
- Custom domains supported

---

## Option 2: Vercel (Great for React)

Vercel is excellent for React apps and can handle the backend with serverless functions.

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd client
   vercel
   ```
   - Follow the prompts
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Deploy Backend as Serverless**
   - Create `api/index.js` in your project root
   - Or use Vercel's serverless functions
   - Update your frontend to use Vercel API routes

**Note**: Vercel is better suited if you convert the backend to serverless functions.

---

## Option 3: Railway (Simple Full-Stack)

Railway offers a simple deployment process.

### Steps:

1. **Sign up at https://railway.app**
2. **Create New Project** → "Deploy from GitHub repo"
3. **Add Service** → Select your repository
4. **Configure**:
   - Root Directory: `server` (for backend)
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**:
   - `NODE_ENV=production`
   - `PORT` (Railway will provide this automatically)
6. **Deploy Frontend** as a separate service

### Railway Free Tier:
- $5 credit/month (usually enough for small apps)
- Automatic deployments from GitHub
- Custom domains

---

## Option 4: Fly.io (Good for Full-Stack)

Fly.io is great for deploying full-stack applications.

### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create `fly.toml`** in your project root:
   ```toml
   app = "wrecked-apartment"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [[services]]
     internal_port = 3001
     protocol = "tcp"
   ```

3. **Deploy**
   ```bash
   fly launch
   ```

---

## ✅ Code is Now Deployment-Ready!

I've updated your code to support deployment:

1. ✅ Created `client/src/config.js` for environment variable support
2. ✅ Updated all components to use the config
3. ✅ Updated backend CORS to support production URLs
4. ✅ Created `render.yaml` for easy Render deployment
5. ✅ Created `.env.example` as a template

### Quick Deploy to Render:

1. **Push your code to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the `render.yaml` file
   - Click "Apply"
   - Render will automatically create both services!

3. **Manual Setup (Alternative)**
   - Follow the steps in the "Option 1: Render" section above
   - Use the environment variables from `.env.example`

---

## Important Notes:

1. **Database**: The SQLite database file will be reset on each deployment. For production, consider:
   - Using a free PostgreSQL database (Render offers this)
   - Or using a cloud SQLite service

2. **File Uploads**: If you add image uploads later, you'll need cloud storage (AWS S3, Cloudinary free tier, etc.)

3. **Environment Variables**: Never commit `.env` files with secrets to GitHub

4. **CORS**: Make sure to update CORS settings to allow your production frontend URL

---

## Recommended: Render Setup

Render is the easiest option for your full-stack app. Would you like me to:
1. Update your code to be deployment-ready?
2. Create the necessary configuration files?
3. Add environment variable support?

Let me know and I'll prepare everything!

