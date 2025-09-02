// Simple comments added for clarity. No logic changed.
// src/services/company.service.js
import { API_BASE } from './config.js'

// base url seguro: acepta VITE_API_BASE con o sin /api y sin barra final
const BASE = (API_BASE || '').replace(/\/+$/, '')
// Function makeUrl
const makeUrl = (p) => `${BASE}${p.startsWith('/') ? '' : '/'}${p}`

// lee token de localStorage
const getToken = () => localStorage.getItem('auth_token') || ''
// Function authHeader
const authHeader = () => {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// Function http
async function http(path, { method = 'GET', body, headers } = {}) {
// API request
  const res = await fetch(makeUrl(path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeader(),
      ...(headers || {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  const ct = res.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')
  if (!res.ok) {
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)
// Function msg
    const msg = (payload && typeof payload === 'object' && (payload.message || payload.error)) || (payload || '')
    throw new Error(`HTTP ${res.status}${msg ? `: ${msg}` : ''}`)
  }
  if (res.status === 204) return
  return isJson ? res.json() : res.text()
}

// Export for other files
export const CompanyAPI = {
  list: () => http('/api/companies'),
  get: (id) => http(`/api/companies/${encodeURIComponent(id)}`),
  create: (payload) => http('/api/companies', { method: 'POST', body: payload }),
  update: (id, payload) => http(`/api/companies/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),
  remove: async (id) => http(`/api/companies/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  weather: (id, units = 'metric') =>
    http(`/api/companies/${encodeURIComponent(id)}/weather?units=${encodeURIComponent(units)}`),
  advancedQuery: (id, message) =>
    http(`/api/companies/${encodeURIComponent(id)}/advanced-query`, { method: 'POST', body: { message } }),
}

// compat
CompanyAPI.delete = CompanyAPI.remove
// Export for other files
export default CompanyAPI
