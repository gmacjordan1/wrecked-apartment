import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../api'
import './ProjectList.css'

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-message">Loading projects...</div>
  if (error) return <div className="page-message error">Failed to load projects: {error}</div>

  return (
    <div className="project-list">
      <div className="page-header">
        <h1>Projects</h1>
        <p className="page-desc">Select a project to view 3D models and details</p>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet.</p>
          <p>Go to <Link to="/admin">Admin</Link> to create one.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <Link key={p.id} to={`/p/${p.slug}`} className="project-card">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3 className="card-title">{p.name}</h3>
              {p.description && <p className="card-desc">{p.description}</p>}
              <span className="card-meta">
                {p.model_count} model{p.model_count !== 1 ? 's' : ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
