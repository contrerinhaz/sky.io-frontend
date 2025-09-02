// src/services/auth.service.js
const API_BASE = import.meta.env.VITE_API_BASE + '/api/auth'

// Admin dashboard local helpers
const K_USERS = 'adm_users'

// Upsert a user into local catalog
function upsertLocalUser(u) {
  try {
    const list = JSON.parse(localStorage.getItem(K_USERS) || '[]')
    const id = String(u.id ?? Date.now())
    const entry = {
      id,
      name: u.name,
      email: u.email,
      role: (u.role || 'customer'),
      createdAt: u.createdAt || new Date().toISOString()
    }
    const next = [
      ...list.filter(x => String(x.email).toLowerCase() !== String(entry.email).toLowerCase()),
      entry
    ]
    localStorage.setItem(K_USERS, JSON.stringify(next))
  } catch {}
}

// Register
export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) throw new Error('Todos los campos son obligatorios.')
  // API request
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error en el registro')
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('auth_user', JSON.stringify(data.user))
  // add user to local admin list
  upsertLocalUser(data.user)
  return data.user
}

// Login
export async function loginUser(email, password) {
  // API request
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Credenciales inválidas')
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('auth_user', JSON.stringify(data.user))
  // ensure user exists in local catalog
  upsertLocalUser(data.user)
  return data.user
}

// Logout
export function logoutUser() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('units')
}

// Current user
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null }
}

// Auth
export function isAuthenticated() {
  const t = localStorage.getItem('auth_token')
  if (!t) return false
  try {
    const payload = JSON.parse(atob(t.split('.')[1] || ''))
    if (payload?.exp) return Date.now() / 1000 < payload.exp
  } catch {}
  return !!t
}

// Get raw token
export function getToken() {
  return localStorage.getItem('auth_token') || ''
}

// Is admin
export function isAdmin() {
  // read user object from storage
  const u = (() => { try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null } })()
  return (u?.role || '').toString().toLowerCase() === 'admin'
}
