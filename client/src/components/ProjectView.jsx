import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject } from '../api'
import ModelViewer from './ModelViewer'
import './ProjectView.css'

const CATEGORY_LABELS = {
  colors_finishes: 'Colors & Finishes',
  lighting: 'Lighting',
  vendor_parts: 'Vendor Parts',
  notes: 'Notes',
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectView() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedModelId, setSelectedModelId] = useState(null)
  const [activeTab, setActiveTab] = useState('models')
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProject(slug)
      .then(data => {
        setProject(data)
        if (data.models?.length > 0) {
          setSelectedModelId(data.models[0].id)
        } else {
          setActiveTab('details')
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page-message">Loading project...</div>
  if (error) return <div className="page-message error">{error}</div>
  if (!project) return <div className="page-message error">Project not found</div>

  const selectedModel = project.models?.find(m => m.id === selectedModelId)

  // Group details by category
  const detailsByCategory = {}
  for (const d of (project.details || [])) {
    if (!detailsByCategory[d.category]) detailsByCategory[d.category] = []
    detailsByCategory[d.category].push(d)
  }

  const selectModel = (id) => {
    setSelectedModelId(id)
    setPanelOpen(false)
  }

  return (
    <div className="project-view">
      {/* Mobile top bar */}
      <div className="pv-mobile-bar">
        <Link to="/" className="back-link-mobile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <span className="pv-mobile-title">{project.name}</span>
        <button className="pv-mobile-toggle" onClick={() => setPanelOpen(!panelOpen)}>
          {panelOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-out panel */}
      {panelOpen && (
        <>
          <div className="pv-mobile-backdrop" onClick={() => setPanelOpen(false)} />
          <div className="pv-mobile-panel">
            <SidebarContent
              project={project}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedModelId={selectedModelId}
              onSelectModel={selectModel}
              selectedModel={selectedModel}
              detailsByCategory={detailsByCategory}
            />
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <div className="pv-sidebar">
        <Link to="/" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Projects
        </Link>

        <h2 className="pv-title">{project.name}</h2>
        {project.description && <p className="pv-desc">{project.description}</p>}

        <SidebarContent
          project={project}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedModelId={selectedModelId}
          onSelectModel={selectModel}
          selectedModel={selectedModel}
          detailsByCategory={detailsByCategory}
        />
      </div>

      {/* Viewer */}
      <div className="pv-viewer">
        {activeTab === 'models' && selectedModel ? (
          <ModelViewer key={selectedModel.id} model={selectedModel} />
        ) : activeTab === 'models' ? (
          <div className="pv-viewer-empty">
            <p>No model selected</p>
          </div>
        ) : (
          <div className="pv-viewer-empty">
            <p>Select the Models tab to view 3D models</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SidebarContent({ project, activeTab, setActiveTab, selectedModelId, onSelectModel, selectedModel, detailsByCategory }) {
  return (
    <>
      <div className="pv-tabs">
        <button
          className={`pv-tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          Models ({project.models?.length || 0})
        </button>
        <button
          className={`pv-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      {activeTab === 'models' && (
        <div className="pv-model-list">
          {project.models?.length === 0 && (
            <p className="pv-empty">No models uploaded yet</p>
          )}
          {project.models?.map(m => (
            <button
              key={m.id}
              className={`pv-model-item ${selectedModelId === m.id ? 'active' : ''}`}
              onClick={() => onSelectModel(m.id)}
            >
              <div className="model-item-info">
                <span className="model-item-name">{m.name}</span>
                <span className="model-item-meta">
                  {m.file_type?.replace('.', '').toUpperCase()}
                  {m.file_size ? ` \u00B7 ${formatFileSize(m.file_size)}` : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="pv-details">
          {Object.keys(detailsByCategory).length === 0 && (
            <p className="pv-empty">No details added yet</p>
          )}
          {Object.entries(detailsByCategory).map(([category, items]) => (
            <div key={category} className="detail-group">
              <h4 className="detail-group-title">
                {CATEGORY_LABELS[category] || category}
              </h4>
              {items.map(d => (
                <div key={d.id} className="detail-entry">
                  <span className="detail-entry-title">{d.title}</span>
                  {d.content && <p className="detail-entry-content">{d.content}</p>}
                  {d.image_url && (
                    <img src={d.image_url} alt={d.title} className="detail-entry-img" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {selectedModel && (
        <a
          href={`/api/models/${selectedModel.id}/download`}
          className="pv-download"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download {selectedModel.original_name}
        </a>
      )}

      {selectedModel?.notes && (
        <div className="pv-notes">
          <h4>Notes</h4>
          <p>{selectedModel.notes}</p>
        </div>
      )}
    </>
  )
}
