// src/services/admin.service.js
const API = import.meta.env.VITE_API_BASE + '/api'
const JSON_HDR = { 'Content-Type': 'application/json' }

// Get auth header from local storage
const authHeaders = () => {
  const t = localStorage.getItem('auth_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// Parse JSON or throw API error
const j = async (res) => {
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

// Try multiple endpoints in order
const tryUrls = async (method, urls, body) => {
  for (const url of urls) {
    // API request
    const res = await fetch(url, {
      method,
      headers: { ...authHeaders(), ...(body ? JSON_HDR : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.ok) return j(res)
    // if not 404, propagate backend message
    if (res.status !== 404) await j(res)
  }
  throw new Error('Endpoint no disponible (404).')
}

// Public API
export const AdminAPI = {
  users: {
    list() {
      return tryUrls('GET', [`${API}/admin/users`, `${API}/users`])
    },
    create(payload) {
      return tryUrls('POST', [`${API}/admin/users`, `${API}/users`], payload)
    },
    // Update user
    update(id, payload) {
      return tryUrls('PUT', [`${API}/admin/users/${id}`, `${API}/users/${id}`], payload)
    },
    remove(id) {
      return tryUrls('DELETE', [`${API}/admin/users/${id}`, `${API}/users/${id}`])
    },
  },

  companies: {
    list() {
      return tryUrls('GET', [`${API}/admin/companies`, `${API}/companies`])
    },
    create(payload) {
      return tryUrls('POST', [`${API}/admin/companies`, `${API}/companies`], payload)
    },
    // Update company
    update(id, payload) {
      return tryUrls('PUT', [`${API}/admin/companies/${id}`, `${API}/companies/${id}`], payload)
    },
    remove(id) {
      return tryUrls('DELETE', [`${API}/admin/companies/${id}`, `${API}/companies/${id}`])
    },
  },
}
