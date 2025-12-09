const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development, restrict in production
    }
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Models table (Fusion 360 models/drawings)
  db.run(`CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    fusion360_link TEXT,
    file_path TEXT,
    notes TEXT,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )`);

  // Project details table (colors, finishing, products, etc.)
  db.run(`CREATE TABLE IF NOT EXISTS project_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )`);

  // Add notes column to models if it doesn't exist
  db.run(`ALTER TABLE models ADD COLUMN notes TEXT`, (err) => {
    // Ignore error if column already exists
  });
  
  // Add image_url column to project_details if it doesn't exist
  db.run(`ALTER TABLE project_details ADD COLUMN image_url TEXT`, (err) => {
    // Ignore error if column already exists
  });

  // Insert sample data
  db.run(`INSERT OR IGNORE INTO projects (id, name, description) VALUES 
    (1, 'Sample Project', 'A sample project to get started')`);
  
  db.run(`INSERT OR IGNORE INTO models (project_id, name, type, fusion360_link, is_visible) VALUES 
    (1, 'Main Assembly', '3d_model', 'https://example.com/fusion360/model1', 1),
    (1, 'Detail Drawing', 'drawing', 'https://example.com/fusion360/drawing1', 1)`);
  
  db.run(`INSERT OR IGNORE INTO project_details (project_id, category, title, content) VALUES 
    (1, 'colors', 'Primary Color', 'RAL 9010 Pure White'),
    (1, 'finishing', 'Surface Finish', 'Matte powder coat'),
    (1, 'products', 'Hardware', 'Blum soft-close hinges required')`);
});

// API Routes

// Get all visible projects
app.get('/api/projects', (req, res) => {
  db.all(`SELECT * FROM projects ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get project by ID with models and details
app.get('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  
  // Get project
  db.get(`SELECT * FROM projects WHERE id = ?`, [projectId], (err, project) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get visible models
    db.all(`SELECT * FROM models WHERE project_id = ? AND is_visible = 1 ORDER BY created_at`, 
      [projectId], (err, models) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Get project details
        db.all(`SELECT * FROM project_details WHERE project_id = ? ORDER BY category, created_at`, 
          [projectId], (err, details) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              ...project,
              models: models || [],
              details: details || []
            });
          });
      });
  });
});

// Admin: Get all models (including hidden)
app.get('/api/admin/models', (req, res) => {
  db.all(`SELECT m.*, p.name as project_name FROM models m 
    JOIN projects p ON m.project_id = p.id 
    ORDER BY m.created_at DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Admin: Create project
app.post('/api/admin/projects', (req, res) => {
  const { name, description } = req.body;
  db.run(`INSERT INTO projects (name, description) VALUES (?, ?)`, 
    [name, description], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, description });
    });
});

// Admin: Update project
app.put('/api/admin/projects/:id', (req, res) => {
  const { name, description } = req.body;
  const projectId = req.params.id;
  db.run(`UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
    [name, description, projectId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

// Admin: Create model
app.post('/api/admin/models', (req, res) => {
  const { project_id, name, type, fusion360_link, file_path, notes, is_visible } = req.body;
  db.run(`INSERT INTO models (project_id, name, type, fusion360_link, file_path, notes, is_visible) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [project_id, name, type, fusion360_link, file_path, notes || null, is_visible ? 1 : 0], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, project_id, name, type, fusion360_link, file_path, notes, is_visible });
    });
});

// Admin: Update model
app.put('/api/admin/models/:id', (req, res) => {
  const { name, type, fusion360_link, file_path, notes, is_visible } = req.body;
  const modelId = req.params.id;
  db.run(`UPDATE models SET name = ?, type = ?, fusion360_link = ?, file_path = ?, notes = ?, is_visible = ? WHERE id = ?`, 
    [name, type, fusion360_link, file_path, notes || null, is_visible ? 1 : 0, modelId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

// Admin: Update model visibility
app.put('/api/admin/models/:id/visibility', (req, res) => {
  const { is_visible } = req.body;
  const modelId = req.params.id;
  db.run(`UPDATE models SET is_visible = ? WHERE id = ?`, 
    [is_visible ? 1 : 0, modelId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

// Admin: Delete model
app.delete('/api/admin/models/:id', (req, res) => {
  const modelId = req.params.id;
  db.run(`DELETE FROM models WHERE id = ?`, [modelId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Admin: Create project detail
app.post('/api/admin/project-details', (req, res) => {
  const { project_id, category, title, content, image_url } = req.body;
  db.run(`INSERT INTO project_details (project_id, category, title, content, image_url) 
    VALUES (?, ?, ?, ?, ?)`, 
    [project_id, category, title, content, image_url || null], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, project_id, category, title, content, image_url });
    });
});

// Admin: Update project detail
app.put('/api/admin/project-details/:id', (req, res) => {
  const { category, title, content, image_url } = req.body;
  const detailId = req.params.id;
  db.run(`UPDATE project_details SET category = ?, title = ?, content = ?, image_url = ? WHERE id = ?`, 
    [category, title, content, image_url || null, detailId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

// Admin: Delete project detail
app.delete('/api/admin/project-details/:id', (req, res) => {
  const detailId = req.params.id;
  db.run(`DELETE FROM project_details WHERE id = ?`, [detailId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Admin: Delete project
app.delete('/api/admin/projects/:id', (req, res) => {
  const projectId = req.params.id;
  // First delete related models and details
  db.run(`DELETE FROM models WHERE project_id = ?`, [projectId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    db.run(`DELETE FROM project_details WHERE project_id = ?`, [projectId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // Then delete the project
      db.run(`DELETE FROM projects WHERE id = ?`, [projectId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      });
    });
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Wrecked Apartment server running on http://localhost:${PORT}`);
});

