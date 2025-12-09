import React from 'react'
import './ProjectDetails.css'

function ProjectDetails({ details, projectId }) {
  // Group details by category
  const groupedDetails = {
    'colors_finishes': details.filter(d => d.category === 'colors_finishes'),
    'lighting': details.filter(d => d.category === 'lighting'),
    'outside_vendor_parts': details.filter(d => d.category === 'outside_vendor_parts')
  }

  const categoryLabels = {
    colors_finishes: '🎨 Colors and Finishes',
    lighting: '💡 Lighting',
    outside_vendor_parts: '📦 Outside Vendor Parts'
  }

  const hasAnyDetails = Object.values(groupedDetails).some(arr => arr.length > 0)

  if (!hasAnyDetails) {
    return (
      <div className="project-details">
        <div className="empty-state">
          <p>No project details available. Use Admin Mode to add details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="project-details">
      {Object.entries(groupedDetails).map(([category, items]) => {
        if (items.length === 0) return null
        
        return (
          <div key={category} className="detail-section">
            <h3 className="detail-section-title">
              {categoryLabels[category] || category}
            </h3>
            <div className="detail-items">
              {items.map(item => (
                <div key={item.id} className="detail-item">
                  {item.title && (
                    <h4 className="detail-item-title">{item.title}</h4>
                  )}
                  {item.content && (
                    <p className="detail-item-content">{item.content}</p>
                  )}
                  {item.image_url && (
                    <div className="detail-item-image">
                      <img src={item.image_url} alt={item.title || 'Detail image'} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProjectDetails
