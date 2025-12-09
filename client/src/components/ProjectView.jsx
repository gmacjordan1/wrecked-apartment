import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import ModelViewer from './ModelViewer'
import ProjectDetails from './ProjectDetails'
import { API_BASE } from '../config'
import './ProjectView.css'

function ProjectView() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(null)
  const [activeTab, setActiveTab] = useState('3dmodels')
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  useEffect(() => {
    // When tab changes, select first model of that type
    if (project && project.models) {
      const filtered = project.models.filter(m => 
        activeTab === '3dmodels' ? m.type === '3d_model' : activeTab === 'drawings' ? m.type === 'drawing' : false
      )
      if (filtered.length > 0 && (!selectedModel || !filtered.find(m => m.id === selectedModel.id))) {
        setSelectedModel(filtered[0])
      } else if (filtered.length === 0) {
        setSelectedModel(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, project])

  // Handle ESC key to exit minimized mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isMinimized) {
        setIsMinimized(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isMinimized])

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects/${id}`)
      setProject(response.data)
      if (response.data.models && response.data.models.length > 0) {
        // Select first 3D model by default
        const first3D = response.data.models.find(m => m.type === '3d_model')
        setSelectedModel(first3D || response.data.models[0])
      } else {
        // If no models, default to details tab
        setActiveTab('details')
        setSelectedModel(null)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="project-view">
        <div className="loading">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-view">
        <div className="error">Project not found</div>
      </div>
    )
  }

  return (
    <div className={`project-view ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized && (
        <>
          <Link to="/" className="back-link">← Back to Projects</Link>
          
          <div className="project-header">
            <h2>{project.name}</h2>
            {project.description && (
              <p className="project-description">{project.description}</p>
            )}
          </div>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === '3dmodels' ? 'active' : ''}`}
              onClick={() => setActiveTab('3dmodels')}
            >
              3D Models
            </button>
            <button 
              className={`tab ${activeTab === 'drawings' ? 'active' : ''}`}
              onClick={() => setActiveTab('drawings')}
            >
              Drawings
            </button>
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Project Details
            </button>
          </div>
        </>
      )}

      {isMinimized && (
        <button 
          className="restore-ui-button"
          onClick={() => setIsMinimized(false)}
          title="Restore UI (or press ESC)"
        >
          ↖ Restore UI
        </button>
      )}

      {(activeTab === '3dmodels' || activeTab === 'drawings') && (
        <div className="models-section">
          {project.models && project.models.filter(m => 
            activeTab === '3dmodels' ? m.type === '3d_model' : m.type === 'drawing'
          ).length > 0 ? (
            <>
              {!isMinimized && (
                <div className="model-selector">
                  {project.models
                    .filter(m => activeTab === '3dmodels' ? m.type === '3d_model' : m.type === 'drawing')
                    .map(model => (
                      <button
                        key={model.id}
                        className={`model-button ${selectedModel?.id === model.id ? 'active' : ''}`}
                        onClick={() => setSelectedModel(model)}
                      >
                        {model.name}
                      </button>
                    ))}
                  <button
                    className="minimize-button"
                    onClick={() => setIsMinimized(true)}
                    title="Minimize UI for fullscreen viewing"
                  >
                    ⛶ Minimize UI
                  </button>
                </div>
              )}
              {selectedModel && (
                <div className="viewer-container">
                  <ModelViewer model={selectedModel} />
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No {activeTab === '3dmodels' ? '3D models' : 'drawings'} available for this project.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                Switch to the "Project Details" tab to view project information.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <ProjectDetails details={project.details || []} projectId={project.id} />
      )}
    </div>
  )
}

export default ProjectView

