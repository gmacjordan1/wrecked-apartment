import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import ProjectList from './components/ProjectList'
import ProjectView from './components/ProjectView'
import AdminPanel from './components/AdminPanel'
import './App.css'

function Header() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-brand">
          <span className="header-title">Wrecked Apartment</span>
          <span className="header-subtitle">Fabrication Viewer</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Projects
          </Link>
          <Link to="/admin" className={`nav-link ${isAdmin ? 'active' : ''}`}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/p/:slug" element={<ProjectView />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
