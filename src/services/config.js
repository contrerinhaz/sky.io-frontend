// Simple comments added for clarity. No logic changed.
// Configuración de endpoints (lado cliente)
export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3001').replace(/\/+$/,'')
// Export for other files
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
