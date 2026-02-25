import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import './AdminPanel.css'

// ---- Login Gate ----
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.verifyAdmin(password)
      api.setAdminPassword(password)
      onLogin()
    } catch {
      setError('Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Admin Login</h2>
        <p>Enter the admin password to manage projects and models.</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

// ---- Main Admin Panel ----
export default function AdminPanel() {
  const [authed, setAuthed] = useState(!!api.getAdminPassword())
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [models, setModels] = useState([])
  const [details, setDetails] = useState([])
  const [tab, setTab] = useState('projects')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadProjects = useCallback(async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [])

  const loadModels = useCallback(async (pid) => {
    try {
      const data = await api.getAdminModels(pid)
      setModels(data)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [])

  const loadDetails = useCallback(async (pid) => {
    try {
      const data = await api.getProject(pid)
      setDetails(data.details || [])
    } catch (e) {
      showToast(e.message, 'error')
    }
  }, [])

  useEffect(() => {
    if (authed) loadProjects()
  }, [authed, loadProjects])

  useEffect(() => {
    if (selectedProjectId && authed) {
      loadModels(selectedProjectId)
      loadDetails(selectedProjectId)
    }
  }, [selectedProjectId, authed, loadModels, loadDetails])

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="admin-panel">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h1>Admin</h1>
        <button
          className="btn btn-ghost"
          onClick={() => { api.clearAdminPassword(); setAuthed(false) }}
        >
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
          Projects
        </button>
        <button
          className={`admin-tab ${tab === 'models' ? 'active' : ''}`}
          onClick={() => setTab('models')}
          disabled={!selectedProjectId}
        >
          Models
        </button>
        <button
          className={`admin-tab ${tab === 'details' ? 'active' : ''}`}
          onClick={() => setTab('details')}
          disabled={!selectedProjectId}
        >
          Details
        </button>

        {selectedProject && (
          <span className="admin-tab-context">
            Editing: <strong>{selectedProject.name}</strong>
          </span>
        )}
      </div>

      {tab === 'projects' && (
        <ProjectsTab
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={(id) => { setSelectedProjectId(id); setTab('models') }}
          onRefresh={loadProjects}
          showToast={showToast}
        />
      )}
      {tab === 'models' && selectedProjectId && (
        <ModelsTab
          projectId={selectedProjectId}
          models={models}
          onRefresh={() => loadModels(selectedProjectId)}
          showToast={showToast}
        />
      )}
      {tab === 'details' && selectedProjectId && (
        <DetailsTab
          projectId={selectedProjectId}
          details={details}
          onRefresh={() => loadDetails(selectedProjectId)}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// ---- Projects Tab ----
function ProjectsTab({ projects, selectedId, onSelect, onRefresh, showToast }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.createProject({ name, description })
      setName('')
      setDescription('')
      setShowForm(false)
      onRefresh()
      showToast('Project created')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its models?')) return
    try {
      await api.deleteProject(id)
      onRefresh()
      showToast('Project deleted')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="admin-section">
      <div className="section-toolbar">
        <h3>All Projects</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form">
          <input
            placeholder="Project name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
          <button type="submit" className="btn btn-primary btn-sm">Create</button>
        </form>
      )}

      <div className="admin-items">
        {projects.map(p => (
          <div key={p.id} className={`admin-item ${selectedId === p.id ? 'selected' : ''}`}>
            <div className="item-info" onClick={() => onSelect(p.id)}>
              <span className="item-name">{p.name}</span>
              {p.description && <span className="item-desc">{p.description}</span>}
              <span className="item-meta">{p.model_count} model{p.model_count !== 1 ? 's' : ''}</span>
            </div>
            <div className="item-actions">
              <Link to={`/p/${p.slug}`} className="btn btn-ghost btn-sm" target="_blank">
                View
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={() => onSelect(p.id)}>
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="admin-empty">No projects yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}

// ---- Models Tab ----
function ModelsTab({ projectId, models, onRefresh, showToast }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = React.useRef()

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        await api.uploadModel(projectId, file)
      }
      onRefresh()
      showToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleToggleVisibility = async (model) => {
    try {
      await api.updateModel(model.id, {
        name: model.name,
        notes: model.notes,
        visible: !model.visible,
      })
      onRefresh()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this model file?')) return
    try {
      await api.deleteModel(id)
      onRefresh()
      showToast('Model deleted')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="admin-section">
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".stl,.obj,.gltf,.glb,.3mf,.step,.stp,.fbx"
          style={{ display: 'none' }}
          onChange={(e) => { handleUpload(e.target.files); e.target.value = '' }}
        />
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Drop files here or click to upload</p>
            <span className="upload-hint">STL, OBJ, GLTF, GLB, STEP, FBX, 3MF</span>
          </>
        )}
      </div>

      <div className="admin-items">
        {models.map(m => (
          <ModelItem
            key={m.id}
            model={m}
            onToggleVisibility={() => handleToggleVisibility(m)}
            onDelete={() => handleDelete(m.id)}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        ))}
        {models.length === 0 && (
          <p className="admin-empty">No models yet. Upload files above.</p>
        )}
      </div>
    </div>
  )
}

function ModelItem({ model, onToggleVisibility, onDelete, onRefresh, showToast }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(model.name)
  const [notes, setNotes] = useState(model.notes || '')

  const handleSave = async () => {
    try {
      await api.updateModel(model.id, { name, notes, visible: model.visible })
      setEditing(false)
      onRefresh()
      showToast('Model updated')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="admin-item">
      <div className="item-info">
        {editing ? (
          <div className="inline-edit">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" rows={2} />
            <div className="inline-edit-actions">
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <span className="item-name">{model.name}</span>
            <span className="item-desc">
              {model.original_name} &middot; {model.file_type?.replace('.', '').toUpperCase()}
            </span>
            {model.notes && <span className="item-notes">{model.notes}</span>}
          </>
        )}
      </div>
      <div className="item-actions">
        {!editing && (
          <>
            <button
              className={`btn btn-sm ${model.visible ? 'btn-ghost' : 'btn-warning'}`}
              onClick={onToggleVisibility}
              title={model.visible ? 'Visible to viewers' : 'Hidden from viewers'}
            >
              {model.visible ? 'Visible' : 'Hidden'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
          </>
        )}
      </div>
    </div>
  )
}

// ---- Details Tab ----
function DetailsTab({ projectId, details, onRefresh, showToast }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [category, setCategory] = useState('colors_finishes')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setCategory('colors_finishes')
    setTitle('')
    setContent('')
    setImageUrl('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateDetail(editingId, { category, title, content, image_url: imageUrl })
        showToast('Detail updated')
      } else {
        await api.createDetail(projectId, { category, title, content, image_url: imageUrl })
        showToast('Detail added')
      }
      resetForm()
      onRefresh()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const startEdit = (d) => {
    setEditingId(d.id)
    setCategory(d.category)
    setTitle(d.title)
    setContent(d.content || '')
    setImageUrl(d.image_url || '')
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this detail?')) return
    try {
      await api.deleteDetail(id)
      onRefresh()
      showToast('Detail deleted')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="admin-section">
      <div className="section-toolbar">
        <h3>Project Details</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? 'Cancel' : '+ Add Detail'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="colors_finishes">Colors & Finishes</option>
            <option value="lighting">Lighting</option>
            <option value="vendor_parts">Vendor Parts</option>
            <option value="notes">Notes</option>
          </select>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Content (optional)"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
          />
          <input
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            {editingId ? 'Update' : 'Add'}
          </button>
        </form>
      )}

      <div className="admin-items">
        {details.map(d => (
          <div key={d.id} className="admin-item">
            <div className="item-info">
              <span className="item-badge">{d.category.replace(/_/g, ' ')}</span>
              <span className="item-name">{d.title}</span>
              {d.content && <span className="item-desc">{d.content}</span>}
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(d)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
            </div>
          </div>
        ))}
        {details.length === 0 && (
          <p className="admin-empty">No details yet.</p>
        )}
      </div>
    </div>
  )
}
