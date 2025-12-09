import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../config'
import './AdminPanel.css'

function AdminPanel({ isAdmin, setIsAdmin }) {
  const navigate = useNavigate()
  
  // Redirect to home if not in admin mode
  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
    }
  }, [isAdmin, navigate])
  
  const [projects, setProjects] = useState([])
  const [models, setModels] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectDetails, setProjectDetails] = useState([])
  const [activeTab, setActiveTab] = useState('projects')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showModelForm, setShowModelForm] = useState(false)
  const [showDetailForm, setShowDetailForm] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [editingDetail, setEditingDetail] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProjects()
    fetchModels()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.id)
      // Filter models for selected project
      fetchModelsForProject(selectedProject.id)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`)
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/models`)
      setModels(response.data)
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchModelsForProject = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/models`)
      const filtered = response.data.filter(m => m.project_id === projectId)
      setModels(filtered)
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE}/projects/${projectId}`)
      setProjectDetails(response.data.details || [])
    } catch (error) {
      console.error('Error fetching project details:', error)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/admin/projects`, formData)
      setShowProjectForm(false)
      setFormData({})
      fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project')
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all models and details associated with it.')) {
      try {
        await axios.delete(`${API_BASE}/admin/projects/${projectId}`)
        fetchProjects()
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(null)
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Error deleting project')
      }
    }
  }

  const handleCreateModel = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/admin/models`, {
        ...formData,
        is_visible: formData.is_visible !== false
      })
      setShowModelForm(false)
      setEditingModel(null)
      setFormData({})
      fetchModels()
      if (selectedProject) {
        fetchModelsForProject(selectedProject.id)
      }
    } catch (error) {
      console.error('Error creating model:', error)
      alert('Error creating model')
    }
  }

  const handleUpdateModel = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_BASE}/admin/models/${editingModel.id}`, {
        ...formData,
        is_visible: formData.is_visible !== false
      })
      setShowModelForm(false)
      setEditingModel(null)
      setFormData({})
      fetchModels()
      if (selectedProject) {
        fetchModelsForProject(selectedProject.id)
      }
    } catch (error) {
      console.error('Error updating model:', error)
      alert('Error updating model')
    }
  }

  const handleEditModel = (model) => {
    setEditingModel(model)
    setFormData({
      project_id: model.project_id,
      name: model.name,
      type: model.type,
      fusion360_link: model.fusion360_link || '',
      file_path: model.file_path || '',
      notes: model.notes || '',
      is_visible: model.is_visible === 1
    })
    setShowModelForm(true)
  }

  const handleToggleModelVisibility = async (modelId, isVisible) => {
    try {
      await axios.put(`${API_BASE}/admin/models/${modelId}/visibility`, {
        is_visible: !isVisible
      })
      fetchModels()
      if (selectedProject) {
        fetchModelsForProject(selectedProject.id)
      }
    } catch (error) {
      console.error('Error updating model visibility:', error)
    }
  }

  const handleDeleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`${API_BASE}/admin/models/${modelId}`)
        fetchModels()
        if (selectedProject) {
          fetchModelsForProject(selectedProject.id)
        }
      } catch (error) {
        console.error('Error deleting model:', error)
      }
    }
  }

  const handleCreateDetail = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/admin/project-details`, {
        ...formData,
        project_id: selectedProject.id
      })
      setShowDetailForm(false)
      setFormData({})
      fetchProjectDetails(selectedProject.id)
    } catch (error) {
      console.error('Error creating detail:', error)
      alert('Error creating detail')
    }
  }

  const handleUpdateDetail = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_BASE}/admin/project-details/${editingDetail.id}`, formData)
      setShowDetailForm(false)
      setEditingDetail(null)
      setFormData({})
      fetchProjectDetails(selectedProject.id)
    } catch (error) {
      console.error('Error updating detail:', error)
      alert('Error updating detail')
    }
  }

  const handleEditDetail = (detail) => {
    setEditingDetail(detail)
    setFormData({
      category: detail.category,
      title: detail.title,
      content: detail.content || '',
      image_url: detail.image_url || ''
    })
    setShowDetailForm(true)
  }

  const handleDeleteDetail = async (detailId) => {
    if (window.confirm('Are you sure you want to delete this detail?')) {
      try {
        await axios.delete(`${API_BASE}/admin/project-details/${detailId}`)
        fetchProjectDetails(selectedProject.id)
      } catch (error) {
        console.error('Error deleting detail:', error)
      }
    }
  }

  return (
    <div className="admin-panel">
      <Link to="/" className="back-link">← Back to Projects</Link>
      
      <h2>Admin Panel</h2>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button 
          className={`admin-tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          Models & Drawings
        </button>
        <button 
          className={`admin-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Project Details
        </button>
      </div>

      {activeTab === 'projects' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Projects</h3>
            <button 
              className="add-button"
              onClick={() => {
                setShowProjectForm(true)
                setFormData({})
              }}
            >
              + Add Project
            </button>
          </div>

          {showProjectForm && (
            <form className="admin-form" onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="form-actions">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowProjectForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-list">
            {projects.map(project => (
              <div key={project.id} className="admin-item">
                <div>
                  <h4>{project.name}</h4>
                  {project.description && <p>{project.description}</p>}
                </div>
                <div className="item-actions">
                  <Link to={`/project/${project.id}`} className="view-button">
                    View
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Models & Drawings</h3>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === parseInt(e.target.value))
                setSelectedProject(project)
                setFormData({})
              }}
              style={{ marginRight: '1rem' }}
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              className="add-button"
              onClick={() => {
                setShowModelForm(true)
                setEditingModel(null)
                setFormData({
                  project_id: selectedProject?.id || '',
                  type: '3d_model',
                  is_visible: true
                })
              }}
            >
              + Add Model/Drawing
            </button>
          </div>

          {showModelForm && (
            <form className="admin-form" onSubmit={editingModel ? handleUpdateModel : handleCreateModel}>
              <select
                value={formData.project_id || ''}
                onChange={(e) => setFormData({...formData, project_id: parseInt(e.target.value)})}
                required
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Model/Drawing Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="">Select Type</option>
                <option value="3d_model">3D Model</option>
                <option value="drawing">Drawing</option>
              </select>
              <input
                type="text"
                placeholder="Fusion 360 Link (optional)"
                value={formData.fusion360_link || ''}
                onChange={(e) => setFormData({...formData, fusion360_link: e.target.value})}
              />
              <textarea
                placeholder="Notes for fabrication team (optional)"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
              />
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_visible !== false}
                  onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                Visible to fabrication team
              </label>
              <div className="form-actions">
                <button type="submit">{editingModel ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => {
                  setShowModelForm(false)
                  setEditingModel(null)
                  setFormData({})
                }}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-list">
            {models.map(model => (
              <div key={model.id} className="admin-item">
                <div>
                  <h4>{model.name}</h4>
                  <p>Project: {model.project_name} | Type: {model.type}</p>
                  {model.fusion360_link && (
                    <p className="link-text">Link: {model.fusion360_link}</p>
                  )}
                  {model.notes && (
                    <p className="notes-text">Notes: {model.notes}</p>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditModel(model)}
                  >
                    Edit
                  </button>
                  <button
                    className={model.is_visible ? 'visible-button' : 'hidden-button'}
                    onClick={() => handleToggleModelVisibility(model.id, model.is_visible)}
                  >
                    {model.is_visible ? '👁️ Visible' : '🚫 Hidden'}
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteModel(model.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Project Details</h3>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === parseInt(e.target.value))
                setSelectedProject(project)
              }}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedProject && (
              <button 
                className="add-button"
                onClick={() => {
                  setShowDetailForm(true)
                  setEditingDetail(null)
                  setFormData({ category: 'colors_finishes' })
                }}
              >
                + Add Detail
              </button>
            )}
          </div>

          {selectedProject && showDetailForm && (
            <form className="admin-form" onSubmit={editingDetail ? handleUpdateDetail : handleCreateDetail}>
              <select
                value={formData.category || 'colors_finishes'}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="colors_finishes">Colors and Finishes</option>
                <option value="lighting">Lighting</option>
                <option value="outside_vendor_parts">Outside Vendor Parts</option>
              </select>
              <input
                type="text"
                placeholder="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Content/Description"
                value={formData.content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows="4"
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              />
              <div className="form-actions">
                <button type="submit">{editingDetail ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => {
                  setShowDetailForm(false)
                  setEditingDetail(null)
                  setFormData({})
                }}>Cancel</button>
              </div>
            </form>
          )}

          {selectedProject && (
            <div className="admin-list">
              {projectDetails.map(detail => (
                <div key={detail.id} className="admin-item">
                  <div>
                    <h4>{detail.title}</h4>
                    <p>Category: {detail.category}</p>
                    {detail.content && <p>{detail.content}</p>}
                    {detail.image_url && (
                      <img src={detail.image_url} alt={detail.title} style={{ maxWidth: '200px', marginTop: '0.5rem' }} />
                    )}
                  </div>
                  <div className="item-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditDetail(detail)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteDetail(detail.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel
