'use strict'
// src/pages/dashboardAdmin.js
import { isAuthenticated, isAdmin, getCurrentUser } from "../services/auth.service.js"

/**
 * Frontend-only.
 * Persistencia en localStorage:
 *  - Usuarios   -> 'adm_users'
 *  - Empresas   -> 'adm_companies'
 * CRUD completo en cliente.
 */

const K_USERS = 'adm_users'
const K_COMPANIES = 'adm_companies'

// ======= Hardening extras =======
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const ROLE_SET = new Set(['admin', 'customer'])
const STORAGE_OK = storageAvailable('localStorage')
let FORM_LOCK = false // anti doble submit

function storageAvailable(type) {
  try {
    const s = window[type]; const x = '__storage_test__' + Math.random()
    s.setItem(x, x); s.removeItem(x); return true
  } catch { return false }
}
function debounce(fn, ms = 150) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) } }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }
function toFixedNum(n, d) { return Number.isFinite(n) ? Number(n.toFixed(d)) : n }
// =================================

const DB = {
  read(key) {
    try {
      const raw = localStorage.getItem(key); if (!raw) return []
      const val = JSON.parse(raw); return Array.isArray(val) ? val : []
    } catch { try { const bad = localStorage.getItem(key); if (bad) localStorage.setItem(key+'.bak', bad) } catch {} ; return [] }
  },
  write(key, value) { localStorage.setItem(key, JSON.stringify(value)) },
  nextId(list) { return String(list.reduce((m,x)=>Math.max(m, Number(x.id)||0),0)+1) }
}

// Asegura que el usuario actual exista en la “BD” local sin borrar otros
function seedIfNeeded() {
  if (!STORAGE_OK) return
  const users = DB.read(K_USERS)
  const me = safeCurrentUser()
  if (me && me.email && !users.some(u => String(u.email).toLowerCase() === String(me.email).toLowerCase())) {
    users.push({
      id: DB.nextId(users),
      name: me.name || 'Admin',
      email: me.email,
      role: (ROLE_SET.has(me.role) ? me.role : 'admin'),
      createdAt: new Date().toISOString()
    })
    DB.write(K_USERS, users)
  }
  if (!Array.isArray(DB.read(K_COMPANIES))) DB.write(K_COMPANIES, [])
}
function safeCurrentUser() {
  try {
    const cu = typeof getCurrentUser === 'function' ? getCurrentUser() : null
    if (!cu || typeof cu !== 'object') return null
    return { name: String(cu.name||'').trim(), email: String(cu.email||'').trim(), role: String(cu.role||'').trim().toLowerCase() }
  } catch { return null }
}

/* ======================= VISTA ======================= */

export async function showDashboardAdmin() {
  if (!isAuthenticated()) { location.hash = '#/login?r=%23/dashboardAdmin'; return }
  if (!isAdmin()) { location.hash = '#/dashboard'; return }

  seedIfNeeded()

  const app = document.getElementById('app')
  if (!app) return

  app.innerHTML = `
    <div class="min-h-[100dvh] bg-slate-900 text-white">
      <div class="mx-auto w-full max-w-7xl px-4 py-6">
        <header class="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 class="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Panel de administración</h1>
            <p class="text-slate-400">Gestiona usuarios y empresas</p>
          </div>
          <div class="flex items-center gap-2">
            <a href="#/logout" class="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:opacity-95">Cerrar sesión</a>
          </div>
        </header>

        <!-- Contadores -->
        <section class="grid gap-4 sm:grid-cols-2 mb-6">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div class="text-2xl mb-2">👤</div>
            <div id="countUsers" class="text-3xl font-bold">0</div>
            <div class="text-slate-400 text-sm mt-1">Usuarios</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div class="text-2xl mb-2">🏢</div>
            <div id="countCompanies" class="text-3xl font-bold">0</div>
            <div class="text-slate-400 text-sm mt-1">Empresas</div>
          </div>
        </section>

        <nav class="mb-6 flex flex-wrap gap-2 text-sm" id="adminTabs">
          <button data-section="usuarios"  class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/10">Usuarios</button>
          <button data-section="empresas"  class="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">Empresas</button>
        </nav>

        <!-- Usuarios (Cards) -->
        <section id="sec-usuarios" class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Usuarios</h2>
            <div class="flex items-center gap-2">
              <div class="relative">
                <input id="searchUsers" placeholder="Buscar por nombre o email"
                       class="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <span class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              </div>
              <button id="btnNewUser" class="px-3 py-2 rounded-lg bg-primary/80 hover:bg-primary">Nuevo usuario</button>
            </div>
          </div>
          <div id="usersGrid" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>
        </section>

        <!-- Empresas (Cards) -->
        <section id="sec-empresas" class="hidden space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Empresas</h2>
            <div class="flex items-center gap-2">
              <div class="relative">
                <input id="searchCompanies" placeholder="Buscar por nombre o propietario"
                       class="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <span class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              </div>
              <button id="btnNewCompany" class="px-3 py-2 rounded-lg bg-primary/80 hover:bg-primary">Nueva empresa</button>
            </div>
          </div>
          <div id="companiesGrid" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>
        </section>

        <div id="adminError" class="hidden mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"></div>
      </div>
    </div>

    <!-- Modal -->
    <div id="modal" class="fixed inset-0 hidden items-center justify-center bg-black/60">
      <div class="w-full max-w-lg rounded-2xl bg-slate-800 p-5 border border-white/10">
        <div class="flex items-center justify-between mb-3">
          <h3 id="modalTitle" class="text-lg font-semibold"></h3>
          <button id="modalClose" class="px-2 py-1 rounded hover:bg-white/10">✕</button>
        </div>
        <form id="modalForm" class="space-y-3"></form>
      </div>
    </div>
  `

  // Tabs
  const tabs = document.getElementById('adminTabs')
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-section]'); if (!b) return
    const sec = b.dataset.section
    for (const btn of tabs.querySelectorAll('button')) btn.classList.toggle('bg-white/10', btn === b)
    document.getElementById('sec-usuarios').classList.toggle('hidden', sec !== 'usuarios')
    document.getElementById('sec-empresas').classList.toggle('hidden', sec !== 'empresas')
  })

  hookCrud()
  refreshAll()

  if (!STORAGE_OK) {
    const errorBox = document.getElementById('adminError')
    errorBox.textContent = 'El almacenamiento local está deshabilitado o bloqueado por el navegador.'
    errorBox.classList.remove('hidden')
  }
}

/* =================== Estado + CRUD local =================== */

let USERS = []
let COMPANIES = []

function refreshAll() {
  const errorBox = document.getElementById('adminError')
  try {
    USERS = DB.read(K_USERS)
    COMPANIES = DB.read(K_COMPANIES)

    // empresasCount derivado
    const countByUser = COMPANIES.reduce((m, c) => (m[c.userId] = (m[c.userId] || 0) + 1, m), {})
    USERS = USERS.map(u => ({ ...u, companiesCount: countByUser[u.id] || 0 }))

    document.getElementById('countUsers').textContent = USERS.length
    document.getElementById('countCompanies').textContent = COMPANIES.length

    renderUsers(USERS)
    renderCompanies(COMPANIES)
    errorBox.classList.add('hidden')
  } catch (e) {
    errorBox.textContent = 'Error al leer datos locales.'
    errorBox.classList.remove('hidden')
    console.error(e)
  }
}

function hookCrud() {
  // Usuarios
  document.getElementById('btnNewUser').addEventListener('click', () => openUserModal())
  document.getElementById('searchUsers').addEventListener('input', debounce((e) => {
    const q = e.target.value.toLowerCase()
    const f = USERS.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
    renderUsers(f)
  }, 120))
  document.getElementById('usersGrid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-id]')
    if (!card) return
    const id = card.getAttribute('data-id')
    if (e.target.matches('[data-edit]')) {
      const u = USERS.find(x => String(x.id) === id)
      openUserModal(u)
    } else if (e.target.matches('[data-del]')) {
      if (!confirm('¿Eliminar usuario? Se eliminarán también sus empresas.')) return
      USERS = USERS.filter(x => String(x.id) !== id)
      COMPANIES = COMPANIES.filter(c => String(c.userId) !== id)
      try { DB.write(K_USERS, USERS); DB.write(K_COMPANIES, COMPANIES) } catch (err) { alert('No se pudo eliminar.'); console.error(err); return }
      refreshAll()
    }
  })

  // Empresas
  document.getElementById('btnNewCompany').addEventListener('click', () => openCompanyModal())
  document.getElementById('searchCompanies').addEventListener('input', debounce((e) => {
    const q = e.target.value.toLowerCase()
    const f = COMPANIES.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (ownerName(c) || '').toLowerCase().includes(q)
    )
    renderCompanies(f)
  }, 120))
  document.getElementById('companiesGrid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-id]')
    if (!card) return
    const id = card.getAttribute('data-id')
    if (e.target.matches('[data-edit]')) {
      const c = COMPANIES.find(x => String(x.id) === id)
      openCompanyModal(c)
    } else if (e.target.matches('[data-del]')) {
      if (!confirm('¿Eliminar empresa?')) return
      COMPANIES = COMPANIES.filter(x => String(x.id) !== id)
      try { DB.write(K_COMPANIES, COMPANIES) } catch (err) { alert('No se pudo eliminar.'); console.error(err); return }
      refreshAll()
    }
  })

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal)
  document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal() })
}

/* =================== Render: CARDS (orden ascendente) =================== */

function roleBadge(role) {
  const r = String(role || 'customer').toLowerCase()
  const cls = r === 'admin'
    ? 'border-green-400/30 text-green-300'
    : 'border-sky-400/30 text-sky-300'
  return `<span class="px-2 py-0.5 text-[11px] rounded-full border ${cls} bg-white/5">${esc(r)}</span>`
}
function avatarFromName(name) {
  const n = String(name || '').trim()
  const initials = n ? n.split(/\s+/).slice(0,2).map(s=>s[0]?.toUpperCase()||'').join('') : 'US'
  return `
    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center text-sm font-bold">
      ${esc(initials)}
    </div>`
}
// Comparadores
function cmpAsc(a, b, key) {
  const A = String((a?.[key] ?? '')).toLocaleLowerCase('es')
  const B = String((b?.[key] ?? '')).toLocaleLowerCase('es')
  const c = A.localeCompare(B, 'es', { sensitivity: 'base' })
  if (c !== 0) return c
  // desempate por id numérica asc
  const ai = Number(a?.id); const bi = Number(b?.id)
  if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi
  return 0
}

function renderUsers(arr) {
  const grid = document.getElementById('usersGrid')
  if (!grid) return
  // Orden ascendente por nombre
  const sorted = [...(arr || [])].sort((a, b) => cmpAsc(a, b, 'name'))
  grid.innerHTML = sorted.map(u => `
    <article data-id="${esc(String(u.id))}"
      class="group rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition transform hover:-translate-y-0.5">
      <div class="flex items-start gap-3">
        ${avatarFromName(u.name)}
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold truncate">${esc(u.name) || '—'}</h3>
            ${roleBadge(u.role)}
          </div>
          <div class="text-slate-300 text-sm truncate">${esc(u.email) || '—'}</div>
          <div class="text-slate-500 text-xs mt-1">ID: ${esc(String(u.id))}</div>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <div class="text-xs text-slate-400">Empresas</div>
          <div class="text-lg font-bold">${Number(u.companiesCount || 0)}</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2 col-span-2">
          <div class="text-xs text-slate-400">Creado</div>
          <div class="text-sm">${fmtDate(u.createdAt)}</div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button class="px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/10 text-sky-300" data-edit>Editar</button>
        <button class="px-3 py-1.5 rounded-lg border border-red-400/30 hover:bg-red-500/10 text-red-300" data-del>Eliminar</button>
      </div>
    </article>
  `).join('') || emptyState('No hay usuarios')
}

function renderCompanies(arr) {
  const grid = document.getElementById('companiesGrid')
  if (!grid) return
  // Orden ascendente por nombre de empresa
  const sorted = [...(arr || [])].sort((a, b) => cmpAsc(a, b, 'name'))
  grid.innerHTML = sorted.map(c => `
    <article data-id="${esc(String(c.id))}"
      class="group rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition transform hover:-translate-y-0.5">
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center text-lg">🏢</div>
        <div class="min-w-0">
          <h3 class="font-semibold truncate">${esc(c.name) || '—'}</h3>
          <div class="text-slate-300 text-sm truncate">${esc(c.activity) || '—'}</div>
          <div class="text-slate-500 text-xs mt-1">ID: ${esc(String(c.id))}</div>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <div class="text-xs text-slate-400">Propietario</div>
          <div class="text-sm truncate">${esc(ownerName(c) || '—')}</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <div class="text-xs text-slate-400">Ubicación</div>
          <div class="text-sm">${coords(c)}</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2 col-span-2">
          <div class="text-xs text-slate-400">Dirección</div>
          <div class="text-sm truncate">${esc(c.address || '—')}</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2 col-span-2">
          <div class="text-xs text-slate-400">Creado</div>
          <div class="text-sm">${fmtDate(c.createdAt)}</div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button class="px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/10 text-sky-300" data-edit>Editar</button>
        <button class="px-3 py-1.5 rounded-lg border border-red-400/30 hover:bg-red-500/10 text-red-300" data-del>Eliminar</button>
      </div>
    </article>
  `).join('') || emptyState('No hay empresas')
}

function emptyState(msg) {
  return `
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
      ${esc(msg)}
    </div>`
}

/* =================== Modales =================== */

function openUserModal(user) {
  const isEdit = !!user
  document.getElementById('modalTitle').textContent = isEdit ? 'Editar usuario' : 'Nuevo usuario'
  const f = document.getElementById('modalForm')
  f.innerHTML = `
    <div class="grid gap-3">
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Nombre</span>
        <input name="name" required class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(user?.name || '')}">
      </label>
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Email</span>
        <input name="email" type="email" required class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(user?.email || '')}">
      </label>
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Rol</span>
        <select name="role" class="bg-white/5 border border-white/10 rounded px-3 py-2">
          <option value="customer" ${user?.role === 'customer' ? 'selected':''}>Cliente</option>
          <option value="admin" ${user?.role === 'admin' ? 'selected':''}>Admin</option>
        </select>
      </label>
    </div>
    <div class="pt-3 flex justify-end gap-2">
      <button type="button" id="btnCancel" class="px-3 py-2 rounded border border-white/15 hover:bg-white/10">Cancelar</button>
      <button class="px-3 py-2 rounded bg-primary/80 hover:bg-primary">${isEdit ? 'Guardar' : 'Crear'}</button>
    </div>
  `
  showModal()
  setTimeout(() => f.querySelector('input[name="name"]')?.focus(), 0)

  f.querySelector('#btnCancel').addEventListener('click', closeModal)
  f.onsubmit = (e) => {
    e.preventDefault(); if (FORM_LOCK) return; FORM_LOCK = true
    const fd = new FormData(f)
    const payload = {
      name: String(fd.get('name')).trim(),
      email: String(fd.get('email')).trim(),
      role: String(fd.get('role') || 'customer').toLowerCase()
    }
    if (payload.name.length < 2) { alert('Nombre demasiado corto.'); FORM_LOCK = false; return }
    if (!EMAIL_RE.test(payload.email)) { alert('Email inválido.'); FORM_LOCK = false; return }
    if (!ROLE_SET.has(payload.role)) { alert('Rol inválido.'); FORM_LOCK = false; return }
    if (USERS.some(u => String(u.email).toLowerCase() === payload.email.toLowerCase() && (!user || String(u.id) !== String(user.id)))) {
      alert('Email ya registrado.'); FORM_LOCK = false; return
    }
    let list = DB.read(K_USERS)
    try {
      if (isEdit) list = list.map(u => String(u.id) === String(user.id) ? { ...u, ...payload } : u)
      else { const id = DB.nextId(list); list.push({ id, ...payload, createdAt: new Date().toISOString() }) }
      DB.write(K_USERS, list); closeModal(); refreshAll()
    } catch (err) { alert('No se pudo guardar el usuario.'); console.error(err) }
    finally { FORM_LOCK = false }
  }
}

function openCompanyModal(company) {
  const isEdit = !!company
  document.getElementById('modalTitle').textContent = isEdit ? 'Editar empresa' : 'Nueva empresa'
  const f = document.getElementById('modalForm')

  const opts = USERS.map(u => `<option value="${esc(String(u.id))}" ${String(company?.userId) === String(u.id) ? 'selected':''}>${esc(u.name)} (${esc(u.email)})</option>`).join('')

  f.innerHTML = `
    <div class="grid gap-3">
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Nombre</span>
        <input name="name" required class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(company?.name || '')}">
      </label>
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Actividad</span>
        <input name="activity" required class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(company?.activity || '')}">
      </label>
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Propietario</span>
        <select name="userId" required class="bg-white/5 border border-white/10 rounded px-3 py-2">
          <option value="" disabled ${company ? '' : 'selected'}>Selecciona un usuario</option>
          ${opts}
        </select>
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col">
          <span class="text-sm text-slate-300 mb-1">Lat</span>
          <input name="lat" type="number" step="any" required class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(company?.lat ?? '')}">
        </label>
        <label class="flex flex-col">
          <span class="text-sm text-slate-300 mb-1">Lon</span>
          <input name="lon" type="number" step="any" required class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(company?.lon ?? '')}">
        </label>
      </div>
      <label class="flex flex-col">
        <span class="text-sm text-slate-300 mb-1">Dirección (opcional)</span>
        <input name="address" class="bg-white/5 border border-white/10 rounded px-3 py-2" value="${esc(company?.address || '')}">
      </label>
    </div>
    <div class="pt-3 flex justify-end gap-2">
      <button type="button" id="btnCancel" class="px-3 py-2 rounded border border-white/15 hover:bg-white/10">Cancelar</button>
      <button class="px-3 py-2 rounded bg-primary/80 hover:bg-primary">${isEdit ? 'Guardar' : 'Crear'}</button>
    </div>
  `
  showModal()
  setTimeout(() => f.querySelector('input[name="name"]')?.focus(), 0)

  f.querySelector('#btnCancel').addEventListener('click', closeModal)
  f.onsubmit = (e) => {
    e.preventDefault(); if (FORM_LOCK) return; FORM_LOCK = true
    const fd = new FormData(f)
    const lat = Number(fd.get('lat'))
    const lon = Number(fd.get('lon'))
    const payload = {
      name: String(fd.get('name')).trim(),
      activity: String(fd.get('activity')).trim(),
      userId: String(fd.get('userId')),
      lat: toFixedNum(clamp(lat, -90, 90), 7),
      lon: toFixedNum(clamp(lon, -180, 180), 7),
      address: String(fd.get('address') || '').trim() || undefined,
    }
    if (!payload.userId) { alert('Selecciona un propietario.'); FORM_LOCK = false; return }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { alert('Lat/Lon inválidos.'); FORM_LOCK = false; return }
    let list = DB.read(K_COMPANIES)
    try {
      if (isEdit) list = list.map(c => String(c.id) === String(company.id) ? { ...c, ...payload } : c)
      else { const id = DB.nextId(list); list.push({ id, ...payload, createdAt: new Date().toISOString() }) }
      DB.write(K_COMPANIES, list); closeModal(); refreshAll()
    } catch (err) { alert('No se pudo guardar la empresa.'); console.error(err) }
    finally { FORM_LOCK = false }
  }
}

/* =================== Utils =================== */

// cierre modal con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const m = document.getElementById('modal')
    if (m && !m.classList.contains('hidden')) closeModal()
  }
})

function ownerName(c) { const u = USERS.find(x => String(x.id) === String(c.userId)); return u ? u.name : '' }
function coords(c) { const lat = Number(c.lat), lon = Number(c.lon); return (Number.isFinite(lat)&&Number.isFinite(lon)) ? `${lat.toFixed(5)}, ${lon.toFixed(5)}` : '—' }
function fmtDate(d) { if (!d) return '—'; try { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleString() } catch { return '—' } }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }
function showModal() { const m = document.getElementById('modal'); m.classList.remove('hidden'); m.classList.add('flex') }
function closeModal() { const m = document.getElementById('modal'); m.classList.add('hidden'); m.classList.remove('flex') }
