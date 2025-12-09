# How to Push Your Code to GitHub

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com
2. Click "Sign up"
3. Create your account (it's free!)

## Step 2: Create a New Repository on GitHub

1. After logging in, click the **"+"** icon in the top right
2. Select **"New repository"**
3. Fill in:
   - **Repository name**: `wrecked-apartment` (or any name you like)
   - **Description**: "3D model viewer for Rec Department fabrication team"
   - **Visibility**: Choose "Private" (recommended) or "Public"
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

## Step 3: Copy Your Repository URL

After creating the repository, GitHub will show you a page with instructions. 
**Copy the HTTPS URL** - it will look like:
```
https://github.com/YOUR_USERNAME/wrecked-apartment.git
```

## Step 4: Open Terminal and Navigate to Your Project

Open Terminal (on Mac) and run:
```bash
cd /Users/mcgregorjordan/Code
```

## Step 5: Initialize Git (if not already done)

```bash
git init
```

## Step 6: Add All Your Files

```bash
git add .
```

## Step 7: Create Your First Commit

```bash
git commit -m "Initial commit - Wrecked Apartment app"
```

## Step 8: Connect to GitHub

Replace `YOUR_USERNAME` and `wrecked-apartment` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/wrecked-apartment.git
```

## Step 9: Push to GitHub

```bash
git push -u origin main
```

**Note**: If you get an error about "main" branch, try:
```bash
git push -u origin master
```

## Step 10: Authenticate

GitHub will ask you to authenticate. You can:
- Use a **Personal Access Token** (recommended)
- Or use GitHub CLI

### To create a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Wrecked Apartment"
4. Select scopes: check **"repo"** (this gives full repository access)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When Git asks for your password, **paste the token** instead of your password

## That's It! 🎉

Your code is now on GitHub! You can:
- View it at: `https://github.com/YOUR_USERNAME/wrecked-apartment`
- Deploy it to Render (see DEPLOY_QUICK_START.md)

## Troubleshooting

**"fatal: not a git repository"**
- Make sure you're in the `/Users/mcgregorjordan/Code` directory
- Run `git init` first

**"remote origin already exists"**
- Run: `git remote remove origin`
- Then run the `git remote add origin` command again

**"Authentication failed"**
- Make sure you're using a Personal Access Token, not your password
- Tokens need "repo" scope

**"Permission denied"**
- Check that you have access to the repository
- Make sure the repository name matches exactly

## Quick Reference - All Commands at Once

```bash
cd /Users/mcgregorjordan/Code
git init
git add .
git commit -m "Initial commit - Wrecked Apartment app"
git remote add origin https://github.com/YOUR_USERNAME/wrecked-apartment.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `wrecked-apartment` with your actual values!

