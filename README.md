# 🏠 Wrecked Apartment

A 3D model viewer and project management application for Rec Department's fabrication team.

## Features

- **3D Model Viewing**: View Fusion 360 models and drawings in a web-based viewer
- **Measurement Tools**: Take measurements directly from 3D models
- **Project Management**: Organize models by project with detailed information
- **Project Details**: Store and display colors, finishing details, hardware requirements, and more
- **Admin Panel**: Control which models are visible to the fabrication team
- **Easy Access**: Web-based application accessible from any device with a browser

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

From the root directory, run:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

The application will automatically open in your browser.

### Building for Production

1. **Build the client:**
   ```bash
   cd client
   npm run build
   ```

2. **Start the production server:**
   ```bash
   cd server
   npm start
   ```

The application will be available at `http://localhost:3001`

## Usage

### For Fabrication Team (View Mode)

1. Open the application in a browser
2. Browse available projects
3. Click on a project to view:
   - 3D models and drawings
   - Project details (colors, finishing, hardware, etc.)
4. Use the measurement tool to take measurements from 3D models

### For Administrators (Admin Mode)

1. Click the "⚙️ Admin Mode" button in the header
2. **Manage Projects:**
   - Create new projects
   - View all projects

3. **Manage Models:**
   - Add new models with Fusion 360 links
   - Toggle visibility (visible/hidden from fabrication team)
   - Delete models

4. **Manage Project Details:**
   - Select a project
   - Add details by category:
     - Colors
     - Finishing
     - Products & Hardware
     - Notes
     - Other

## Adding Fusion 360 Models

1. In Fusion 360, export or share your model to get a link
2. Go to Admin Mode → Models
3. Click "Add Model"
4. Select the project
5. Enter the model name and type (3D Model or Drawing)
6. Paste the Fusion 360 link
7. Toggle visibility as needed

**Note:** Fusion 360 links may need to be converted to Autodesk Viewer format for optimal viewing. The current implementation supports iframe embedding of Fusion 360 shared links.

## Project Structure

```
wrecked-apartment/
├── server/           # Backend API
│   ├── index.js      # Express server and API routes
│   └── package.json
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectView.jsx
│   │   │   ├── ModelViewer.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── package.json      # Root package.json
```

## Database

The application uses SQLite for data storage. The database file (`database.sqlite`) is created automatically in the `server` directory on first run.

### Database Schema

- **projects**: Project information
- **models**: 3D models and drawings with visibility settings
- **project_details**: Project-specific details (colors, finishing, etc.)

## Making it Accessible on Shop Laptop

### Option 1: Desktop Shortcut (Recommended)

1. Build the application for production
2. Create a desktop shortcut that opens the browser to `http://localhost:3001`
3. On Windows: Create a `.bat` file:
   ```batch
   @echo off
   start http://localhost:3001
   ```
4. On Mac: Create an AppleScript or use Automator

### Option 2: Install as PWA (Progressive Web App)

The application can be configured as a PWA for installation on the laptop. This requires additional configuration in the client build.

### Option 3: Deploy to a Server

Deploy the application to a local server or cloud service so it's accessible via a URL (e.g., `http://shop-laptop:3001` or a domain name).

## Future Enhancements

- [ ] Authentication system for admin access
- [ ] Support for local file uploads (GLTF, OBJ, etc.)
- [ ] Enhanced measurement tools with precise 3D coordinate picking
- [ ] Autodesk Forge Viewer integration for better Fusion 360 support
- [ ] Image gallery for project photos
- [ ] Search and filter functionality
- [ ] Export measurements to PDF
- [ ] Mobile-responsive improvements

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use, you can change them:
- Client: Edit `client/vite.config.js` and change the `port` value
- Server: Set `PORT` environment variable or edit `server/index.js`

### Database Issues

If you need to reset the database, delete `server/database.sqlite` and restart the server. The database will be recreated with sample data.

## License

MIT

## Support

For issues or questions, contact Rec Department.

# wrecked-apartment
# wrecked-apartment
# wrecked-apartment
# wrecked-apartment
