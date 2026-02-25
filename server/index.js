const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// --- File upload config ---
const ALLOWED_EXTENSIONS = ['.stl', '.obj', '.gltf', '.glb', '.3mf', '.step', '.stp', '.fbx'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  }
});

// --- Database ---
const db = new Database(path.join(__dirname, 'database.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    file_type TEXT NOT NULL,
    notes TEXT DEFAULT '',
    visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// --- Helpers ---
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function uniqueSlug(name) {
  let slug = slugify(name);
  if (!slug) slug = 'project';
  const existing = db.prepare('SELECT slug FROM projects WHERE slug LIKE ?').all(`${slug}%`);
  const slugs = new Set(existing.map(r => r.slug));
  if (!slugs.has(slug)) return slug;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${slug}-${i}`;
    if (!slugs.has(candidate)) return candidate;
  }
  return `${slug}-${crypto.randomBytes(4).toString('hex')}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Simple admin password check (set ADMIN_PASSWORD env var, defaults to "admin")
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  next();
}

// --- Public Routes ---

// List all projects
app.get('/api/projects', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, COUNT(m.id) as model_count
    FROM projects p
    LEFT JOIN models m ON m.project_id = p.id AND m.visible = 1
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `).all();
  res.json(projects);
});

// Get project by slug (public view)
app.get('/api/projects/:slug', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE slug = ? OR id = ?')
    .get(req.params.slug, req.params.slug);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const models = db.prepare(
    'SELECT * FROM models WHERE project_id = ? AND visible = 1 ORDER BY sort_order, created_at'
  ).all(project.id);

  const details = db.prepare(
    'SELECT * FROM project_details WHERE project_id = ? ORDER BY category, sort_order, created_at'
  ).all(project.id);

  res.json({ ...project, models, details });
});

// Get a single model's file (for download)
app.get('/api/models/:id/download', (req, res) => {
  const model = db.prepare('SELECT * FROM models WHERE id = ?').get(req.params.id);
  if (!model) return res.status(404).json({ error: 'Model not found' });

  const filePath = path.join(UPLOAD_DIR, model.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  res.download(filePath, model.original_name);
});

// --- Admin Routes ---

// Verify admin password
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, error: 'Invalid password' });
  }
});

// Create project
app.post('/api/admin/projects', requireAdmin, (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Project name is required' });

  const slug = uniqueSlug(name.trim());
  const result = db.prepare(
    'INSERT INTO projects (name, slug, description) VALUES (?, ?, ?)'
  ).run(name.trim(), slug, description || '');

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.json(project);
});

// Update project
app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
  const { name, description } = req.body;
  db.prepare(
    "UPDATE projects SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(name, description || '', req.params.id);
  res.json({ success: true });
});

// Delete project
app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  // Delete associated model files
  const models = db.prepare('SELECT filename FROM models WHERE project_id = ?').all(req.params.id);
  for (const model of models) {
    const filePath = path.join(UPLOAD_DIR, model.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Get all models for a project (including hidden, for admin)
app.get('/api/admin/projects/:id/models', requireAdmin, (req, res) => {
  const models = db.prepare(
    'SELECT * FROM models WHERE project_id = ? ORDER BY sort_order, created_at'
  ).all(req.params.id);
  res.json(models);
});

// Upload model file
app.post('/api/admin/projects/:id/models', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const name = req.body.name || path.basename(req.file.originalname, ext);
  const notes = req.body.notes || '';

  const result = db.prepare(`
    INSERT INTO models (project_id, name, filename, original_name, file_size, file_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, name, req.file.filename, req.file.originalname, req.file.size, ext, notes);

  // Update project timestamp
  db.prepare("UPDATE projects SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

  const model = db.prepare('SELECT * FROM models WHERE id = ?').get(result.lastInsertRowid);
  res.json(model);
});

// Update model metadata
app.put('/api/admin/models/:id', requireAdmin, (req, res) => {
  const { name, notes, visible } = req.body;
  db.prepare(
    'UPDATE models SET name = ?, notes = ?, visible = ? WHERE id = ?'
  ).run(name, notes || '', visible ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// Delete model
app.delete('/api/admin/models/:id', requireAdmin, (req, res) => {
  const model = db.prepare('SELECT * FROM models WHERE id = ?').get(req.params.id);
  if (model) {
    const filePath = path.join(UPLOAD_DIR, model.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM models WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

// Create project detail
app.post('/api/admin/projects/:id/details', requireAdmin, (req, res) => {
  const { category, title, content, image_url } = req.body;
  const result = db.prepare(
    'INSERT INTO project_details (project_id, category, title, content, image_url) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, category, title, content || '', image_url || '');

  const detail = db.prepare('SELECT * FROM project_details WHERE id = ?').get(result.lastInsertRowid);
  res.json(detail);
});

// Update project detail
app.put('/api/admin/details/:id', requireAdmin, (req, res) => {
  const { category, title, content, image_url } = req.body;
  db.prepare(
    'UPDATE project_details SET category = ?, title = ?, content = ?, image_url = ? WHERE id = ?'
  ).run(category, title, content || '', image_url || '', req.params.id);
  res.json({ success: true });
});

// Delete project detail
app.delete('/api/admin/details/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM project_details WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Serve client in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// --- Error handler for multer ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Wrecked Apartment server running on http://localhost:${PORT}`);
});
