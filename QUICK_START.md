# Quick Start Guide for Wrecked Apartment

## Step 1: Install Node.js (if you don't have it)

**For Mac:**
1. Go to https://nodejs.org/
2. Download the "LTS" version (recommended)
3. Run the installer and follow the instructions
4. Restart your terminal after installation

**To check if Node.js is installed:**
Open Terminal and type:
```bash
node --version
```
If you see a version number (like v18.17.0), you're good to go!

## Step 2: Install the App Dependencies

Open Terminal and run these commands one by one:

```bash
# Navigate to the project folder
cd /Users/mcgregorjordan/Code

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

**OR** use the setup script (easier!):
```bash
cd /Users/mcgregorjordan/Code
./setup.sh
```

## Step 3: Start the Application

From the `/Users/mcgregorjordan/Code` folder, run:

```bash
npm run dev
```

This will start both the backend and frontend servers.

## Step 4: Open the App

Open your web browser and go to:
**http://localhost:3000**

You should see the "Wrecked Apartment" app!

## Step 5: Using the App

1. **View Mode (for fabrication team):**
   - Browse projects
   - View 3D models
   - See project details

2. **Admin Mode (for you):**
   - Click "⚙️ Admin Mode" button in the top right
   - Add projects
   - Add models with Fusion 360 links
   - Add project details (colors, finishing, etc.)
   - Control which models are visible

## Troubleshooting

**If you get "command not found" errors:**
- Make sure Node.js is installed (see Step 1)
- Restart your terminal after installing Node.js

**If ports are already in use:**
- Close other applications using ports 3000 or 3001
- Or change the ports in the configuration files

**To stop the app:**
- Press `Ctrl + C` in the terminal where it's running

## Making it Accessible on Shop Laptop

Once everything is working:

1. **Keep the app running** on your computer
2. **On the shop laptop**, open a browser and go to:
   - `http://[your-computer-ip-address]:3000`
   - To find your IP: Run `ifconfig` in Terminal and look for your IP address

**OR** for a permanent solution:
- Deploy to a server
- Or set up the app to run automatically on the shop laptop

