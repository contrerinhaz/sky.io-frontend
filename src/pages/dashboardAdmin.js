
// src/pages/dashboardAdmin.js
import { isAuthenticated, isAdmin, getCurrentUser } from "../services/auth.service.js"

/**
 * Frontend-only.
 * Persistencia en localStorage:
 *  - Usuarios   -> 'adm_users'
 *  - Empresas   -> 'adm_companies'
 * CRUD completo en cliente. Contadores por longitud.
 */

const K_USERS = 'adm_users'
const K_COMPANIES = 'adm_companies'

const DB = {
  read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  nextId(list) {
    const max = list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0)
    return String(max + 1)
  }
}

// Asegura que el usuario actual exista en la “BD” local sin borrar otros
function seedIfNeeded() {
  const users = DB.read(K_USERS)
  const me = getCurrentUser()
  if (me && !users.some(u => String(u.email).toLowerCase() === String(me.email).toLowerCase())) {
    users.push({
      id: DB.nextId(users),
      name: me.name || 'Admin',
      email: me.email,
      role: (me.role || 'admin'),
      createdAt: new Date().toISOString()
    })
    DB.write(K_USERS, users)
  }
  if (!Array.isArray(DB.read(K_COMPANIES))) DB.write(K_COMPANIES, [])
}

/* ======================= VISTA ======================= */

export async function showDashboardAdmin() {
  if (!isAuthenticated()) { location.hash = '#/login?r=%23/dashboardAdmin'; return }
  if (!isAdmin()) { location.hash = '#/dashboard'; return }

  seedIfNeeded()

  const app = document.getElementById('app')
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

        <!-- Usuarios -->
        <section id="sec-usuarios" class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Usuarios</h2>
            <div class="flex items-center gap-2">
              <input id="searchUsers" placeholder="Buscar por nombre o email"
                     class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button id="btnNewUser" class="px-3 py-2 rounded-lg bg-primary/80 hover:bg-primary">Nuevo usuario</button>
            </div>
          </div>
          <div class="glass-card rounded-2xl overflow-hidden border border-white/10">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-white/5 border-b border-white/10 text-slate-300">
                  <tr>
                    <th class="text-left px-4 py-3">Nombre</th>
                    <th class="text-left px-4 py-3">Email</th>
                    <th class="text-left px-4 py-3">Rol</th>
                    <th class="text-left px-4 py-3">Empresas</th>
                    <th class="text-left px-4 py-3">Creado</th>
                    <th class="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody id="usersTbody" class="divide-y divide-white/10"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Empresas -->
        <section id="sec-empresas" class="hidden space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Empresas</h2>
            <div class="flex items-center gap-2">
              <input id="searchCompanies" placeholder="Buscar por nombre o propietario"
                     class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button id="btnNewCompany" class="px-3 py-2 rounded-lg bg-primary/80 hover:bg-primary">Nueva empresa</button>
            </div>
          </div>
          <div class="glass-card rounded-2xl overflow-hidden border border-white/10">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-white/5 border-b border-white/10 text-slate-300">
                  <tr>
                    <th class="text-left px-4 py-3">Empresa</th>
                    <th class="text-left px-4 py-3">Actividad</th>
                    <th class="text-left px-4 py-3">Propietario</th>
                    <th class="text-left px-4 py-3">Ubicación</th>
                    <th class="text-left px-4 py-3">Creado</th>
                    <th class="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody id="companiesTbody" class="divide-y divide-white/10"></tbody>
              </table>
            </div>
          </div>
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
    const b = e.target.closest('button[data-section]')
    if (!b) return
    const sec = b.dataset.section
    for (const btn of tabs.querySelectorAll('button')) {
      btn.classList.toggle('bg-white/10', btn === b)
    }
    document.getElementById('sec-usuarios').classList.toggle('hidden', sec !== 'usuarios')
    document.getElementById('sec-empresas').classList.toggle('hidden', sec !== 'empresas')
  })

  hookCrud()
  refreshAll()
}

/* =================== Estado + CRUD local =================== */

let USERS = []
let COMPANIES = []

// Function refreshAll
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
  } catch {
    errorBox.textContent = 'Error al leer datos locales.'
    errorBox.classList.remove('hidden')
  }
}

// Function hookCrud
function hookCrud() {
  // Usuarios
  document.getElementById('btnNewUser').addEventListener('click', () => openUserModal())
  document.getElementById('searchUsers').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    const f = USERS.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
    renderUsers(f)
  })
  document.getElementById('usersTbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]')
    if (!tr) return
    const id = tr.getAttribute('data-id')
    if (e.target.matches('[data-edit]')) {
// Data operation
      const u = USERS.find(x => String(x.id) === id)
      openUserModal(u)
    } else if (e.target.matches('[data-del]')) {
      if (!confirm('¿Eliminar usuario? Se eliminarán también sus empresas.')) return
      USERS = USERS.filter(x => String(x.id) !== id)
      COMPANIES = COMPANIES.filter(c => String(c.userId) !== id)
      DB.write(K_USERS, USERS)
      DB.write(K_COMPANIES, COMPANIES)
      refreshAll()
    }
  })

  // Empresas
  document.getElementById('btnNewCompany').addEventListener('click', () => openCompanyModal())
  document.getElementById('searchCompanies').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    const f = COMPANIES.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (ownerName(c) || '').toLowerCase().includes(q)
    )
    renderCompanies(f)
  })
  document.getElementById('companiesTbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]')
    if (!tr) return
    const id = tr.getAttribute('data-id')
    if (e.target.matches('[data-edit]')) {
// Data operation
      const c = COMPANIES.find(x => String(x.id) === id)
      openCompanyModal(c)
    } else if (e.target.matches('[data-del]')) {
      if (!confirm('¿Eliminar empresa?')) return
      COMPANIES = COMPANIES.filter(x => String(x.id) !== id)
      DB.write(K_COMPANIES, COMPANIES)
      refreshAll()
    }
  })

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal)
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal()
  })
}

/* =================== Render tablas =================== */

// Function renderUsers
function renderUsers(arr) {
  const tbody = document.getElementById('usersTbody')
  tbody.innerHTML = (arr || []).map(u => `
    <tr class="hover:bg-white/5 transition" data-id="${esc(String(u.id))}">
      <td class="px-4 py-3">
        <div class="font-medium text-white">${esc(u.name) || '—'}</div>
        <div class="text-xs text-slate-400">ID: ${esc(String(u.id))}</div>
      </td>
      <td class="px-4 py-3 text-slate-300">${esc(u.email) || '—'}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 text-xs rounded-full border border-white/15 bg-white/5">${esc(u.role || 'customer')}</span>
      </td>
      <td class="px-4 py-3 text-slate-300">${Number(u.companiesCount || 0)}</td>
      <td class="px-4 py-3 text-slate-400">${fmtDate(u.createdAt)}</td>
      <td class="px-4 py-3">
        <button class="text-sky-300 hover:underline mr-3" data-edit>Editar</button>
        <button class="text-red-300 hover:underline" data-del>Eliminar</button>
      </td>
    </tr>
  `).join('')
}

// Function renderCompanies
function renderCompanies(arr) {
  const tbody = document.getElementById('companiesTbody')
  tbody.innerHTML = (arr || []).map(c => `
    <tr class="hover:bg-white/5 transition" data-id="${esc(String(c.id))}">
      <td class="px-4 py-3">
        <div class="font-medium text-white">${esc(c.name) || '—'}</div>
        <div class="text-xs text-slate-400">ID: ${esc(String(c.id))}</div>
      </td>
      <td class="px-4 py-3 text-slate-300">${esc(c.activity) || '—'}</td>
      <td class="px-4 py-3 text-slate-300">${esc(ownerName(c) || '—')}</td>
      <td class="px-4 py-3 text-slate-400">${coords(c)}</td>
      <td class="px-4 py-3 text-slate-400">${fmtDate(c.createdAt)}</td>
      <td class="px-4 py-3">
        <button class="text-sky-300 hover:underline mr-3" data-edit>Editar</button>
        <button class="text-red-300 hover:underline" data-del>Eliminar</button>
      </td>
    </tr>
  `).join('')
}

/* =================== Modales =================== */

// Function openUserModal
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

  f.querySelector('#btnCancel').addEventListener('click', closeModal)
  f.onsubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(f)
    const payload = {
      name: String(fd.get('name')).trim(),
      email: String(fd.get('email')).trim(),
      role: String(fd.get('role') || 'customer')
    }
    // email único
    if (USERS.some(u => String(u.email).toLowerCase() === payload.email.toLowerCase() && (!user || String(u.id) !== String(user.id)))) {
      alert('Email ya registrado.')
      return
    }
    let list = DB.read(K_USERS)
    if (isEdit) {
      list = list.map(u => String(u.id) === String(user.id) ? { ...u, ...payload } : u)
    } else {
      const id = DB.nextId(list)
      list.push({ id, ...payload, createdAt: new Date().toISOString() })
    }
    DB.write(K_USERS, list)
    closeModal()
    refreshAll()
  }
}

// Function openCompanyModal
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

  f.querySelector('#btnCancel').addEventListener('click', closeModal)
  f.onsubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(f)
    const payload = {
      name: String(fd.get('name')).trim(),
      activity: String(fd.get('activity')).trim(),
      userId: String(fd.get('userId')),
      lat: Number(fd.get('lat')),
      lon: Number(fd.get('lon')),
      address: String(fd.get('address') || '').trim() || undefined,
    }
    if (!payload.userId) { alert('Selecciona un propietario.'); return }
    let list = DB.read(K_COMPANIES)
    if (isEdit) {
      list = list.map(c => String(c.id) === String(company.id) ? { ...c, ...payload } : c)
    } else {
      const id = DB.nextId(list)
      list.push({ id, ...payload, createdAt: new Date().toISOString() })
    }
    DB.write(K_COMPANIES, list)
    closeModal()
    refreshAll()
  }
}

/* =================== Utils =================== */

// Function ownerName
function ownerName(c) {
// Data operation
  const u = USERS.find(x => String(x.id) === String(c.userId))
  return u ? u.name : ''
}
// Function coords
function coords(c) {
  const lat = Number(c.lat), lon = Number(c.lon)
  if (Number.isFinite(lat) && Number.isFinite(lon)) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  return '—'
}
// Function fmtDate
function fmtDate(d) {
  if (!d) return '—'
  try { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleString() } catch { return '—' }
}
// Function esc
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
}
// Function showModal
function showModal() {
  const m = document.getElementById('modal'); m.classList.remove('hidden'); m.classList.add('flex')
}
// Function closeModal
function closeModal() {
  const m = document.getElementById('modal'); m.classList.add('hidden'); m.classList.remove('flex')
}
