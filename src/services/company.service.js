// src/services/company.service.js
import { API_BASE } from './config.js'

// Base segura: sin barra final
const BASE = (API_BASE || '').replace(/\/+$/, '')
const makeUrl = (p) => `${BASE}${p.startsWith('/') ? '' : '/'}${p}`

// Auth
const getToken = () => localStorage.getItem('auth_token') || ''
const authHeader = () => {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// QS helper
const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

// HTTP wrapper
async function http(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(makeUrl(path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeader(),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const ct = res.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')

  if (!res.ok) {
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)
    const msg =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) ||
      (typeof payload === 'string' ? payload : '')
    throw new Error(`HTTP ${res.status}${msg ? `: ${msg}` : ''}`)
  }
  if (res.status === 204) return
  return isJson ? res.json() : res.text()
}

export const CompanyAPI = {
  // CRUD
  list: () => http('/api/companies'),
  get: (id) => http(`/api/companies/${encodeURIComponent(id)}`),
  create: (payload) => http('/api/companies', { method: 'POST', body: payload }),
  update: (id, payload) => http(`/api/companies/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),
  remove: (id) => http(`/api/companies/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  delete: (id) => http(`/api/companies/${encodeURIComponent(id)}`, { method: 'DELETE' }), // compat

  // Weather + IA
  weather: (id, units = 'metric') =>
    http(`/api/companies/${encodeURIComponent(id)}/weather?${qs({ units })}`),
  advancedQuery: (id, message) =>
    http(`/api/companies/${encodeURIComponent(id)}/advanced-query`, { method: 'POST', body: { message } }),

  // Historial (nuevo)
  historyList: (id, { limit = 50, offset = 0 } = {}) =>
    http(`/api/companies/${encodeURIComponent(id)}/history?${qs({ limit, offset })}`),
  historyClear: (id) =>
    http(`/api/companies/${encodeURIComponent(id)}/history`, { method: 'DELETE' }),

  // Alias a /historial por compatibilidad (si decides usar ese path)
  historialList: (id, { limit = 50, offset = 0 } = {}) =>
    http(`/api/companies/${encodeURIComponent(id)}/historial?${qs({ limit, offset })}`),
  historialClear: (id) =>
    http(`/api/companies/${encodeURIComponent(id)}/historial`, { method: 'DELETE' }),
}

export default CompanyAPI
