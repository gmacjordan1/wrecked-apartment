# Quick Deploy to Render (5 Minutes)

## Step 1: Push to GitHub

```bash
# If you haven't already
git init
git add .
git commit -m "Ready for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Deploy on Render

1. **Go to https://render.com** and sign up (free)

2. **Click "New +" → "Blueprint"**
   - Connect your GitHub account
   - Select your repository
   - Render will detect the `render.yaml` file automatically
   - Click "Apply"

3. **Wait for deployment** (5-10 minutes)
   - Render will create both backend and frontend services
   - You'll get URLs like:
     - Backend: `https://wrecked-apartment-api.onrender.com`
     - Frontend: `https://wrecked-apartment.onrender.com`

4. **Update Environment Variables** (if needed)
   - Go to your frontend service settings
   - Add environment variable:
     - Key: `VITE_API_URL`
     - Value: Your backend URL (from step 3)

5. **Done!** Your app is live! 🎉

## Important Notes:

- **Free tier spins down after 15 min inactivity** - first request may be slow
- **Database resets on each deploy** - consider using Render's PostgreSQL (free tier available)
- **Custom domain** - You can add your own domain in Render settings

## Troubleshooting:

- **CORS errors?** Check that `ALLOWED_ORIGINS` in backend includes your frontend URL
- **API not working?** Make sure `VITE_API_URL` is set in frontend environment variables
- **Database issues?** The SQLite file resets - consider PostgreSQL for production

## Next Steps:

For persistent data, add a PostgreSQL database:
1. In Render: "New +" → "PostgreSQL"
2. Update `server/index.js` to use PostgreSQL instead of SQLite
3. Your data will persist across deployments!

