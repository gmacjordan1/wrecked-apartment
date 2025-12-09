import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import ProjectList from './components/ProjectList'
import ProjectView from './components/ProjectView'
import AdminPanel from './components/AdminPanel'
import './App.css'

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  const toggleAdmin = () => {
    const newAdminState = !isAdmin
    setIsAdmin(newAdminState)
    if (newAdminState) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏠 Wrecked Apartment</h1>
          <p className="subtitle">Rec Department Fabrication Viewer</p>
          <button 
            className="admin-toggle"
            onClick={toggleAdmin}
          >
            {isAdmin ? '👤 View Mode' : '⚙️ Admin Mode'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/project/:id" element={<ProjectView />} />
          <Route path="/admin" element={<AdminPanel isAdmin={isAdmin} setIsAdmin={setIsAdmin} />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

