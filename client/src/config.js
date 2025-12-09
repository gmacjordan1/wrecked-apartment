// API configuration
// In development, this will use the proxy from vite.config.js
// In production, set VITE_API_URL environment variable
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

