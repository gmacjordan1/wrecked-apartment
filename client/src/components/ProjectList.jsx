import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../config'
import './ProjectList.css'

function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`)
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading projects...</div>
  }

  return (
    <div className="project-list">
      <h2>Projects</h2>
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects available. Use Admin Mode to create projects.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link 
              key={project.id} 
              to={`/project/${project.id}`}
              className="project-card"
            >
              <div className="project-card-content">
                <h3>{project.name}</h3>
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                <span className="view-link">View Project →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectList

