// src/pages/dashboardCustomer.js

import { CompanyAPI } from '../services/company.service.js'

const state = {
  units: localStorage.getItem('units') || 'metric',
  companies: []
}

export async function showDashboardCustomer() {
  const app = document.getElementById('app')

  // Ensure normal scroll state after leaving modals or fixed layouts
  document.body.classList.remove('overflow-hidden')
  app.style.position = ''
  app.style.height = ''
  app.style.overflow = ''

  if (!CompanyAPI || typeof CompanyAPI.list !== 'function') {
    app.innerHTML = `
      <div class="p-6 text-red-400">
        <p><strong>Error de configuración:</strong> CompanyAPI no disponible.</p>
        <p>Revisa <code>services/company.service.js</code> (debe exportar <code>list/create/remove</code>).</p>
      </div>
    `
    return
  }

  syncFooterVar()

  const authUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
  const userName = authUser?.name || 'Usuario'

  app.innerHTML = `
    <div class="bg-transparent text-white">
      <div class="container mx-auto px-4 py-6 max-w-7xl">
        <section class="dashboard-customer">
          <header class="mb-8">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div class="space-y-1">
                <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ¡Hola, ${userName}!
                </h1>
                <p class="text-slate-400">Gestiona y monitorea tus empresas</p>
              </div>

              <a href="#/logout" id="btnLogout"
                 class="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Cerrar sesión
              </a>
            </div>

            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex items-center gap-3"></div>

              <!-- Header actions are hidden if there are no companies -->
              <div id="headerActions" class="flex items-center gap-3">
                <button id="btnDeleteCompany"
                        class="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Eliminar empresa
                </button>

                <button id="btnAddCompany"
                        class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Agregar empresa
                </button>
              </div>
            </div>
          </header>

          <div id="companiesList" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>
        </section>
      </div>
    </div>
  `

  document.getElementById('btnAddCompany')?.addEventListener('click', openAddCompanyModal)
  document.getElementById('btnDeleteCompany')?.addEventListener('click', handleDeleteCompany)

  await loadCompanies()
}

// Keep footer height in a CSS var for proper layout
function syncFooterVar() {
  const footer =
    document.getElementById('siteFooter') ||
    document.getElementById('site-footer') ||
    document.querySelector('footer')
  if (footer) {
    document.documentElement.style.setProperty('--footer-h', footer.offsetHeight + 'px')
  }
}

// Load and render companies list
async function loadCompanies() {
  const listEl = document.getElementById('companiesList')
  if (!listEl) return

  listEl.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-slate-400">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span>Cargando...</span>
      </div>
    </div>
  `

  try {
    const data = await CompanyAPI.list()
    state.companies = (Array.isArray(data) ? data : []).map(c => {
      const rawId = c.id ?? c.companyId ?? c.company_id ?? c._id ?? c.uuid
      return {
        ...c,
        id: rawId != null ? String(rawId) : '',
        lat: Number(c.lat ?? c.latitude ?? c.Latitude),
        lon: Number(c.lon ?? c.lng ?? c.longitude ?? c.Longitude),
      }
    })

    // Toggle header actions based on whether there are companies
    const actions = document.getElementById('headerActions')
    if (actions) actions.style.display = state.companies.length ? 'flex' : 'none'

    if (!state.companies.length) {
      listEl.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16">
          <div class="text-center max-w-md">
            <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Aún no hay empresas</h3>
            <p class="text-slate-400 mb-6">Comienza agregando tu primera empresa.</p>
            <button id="btnAddFirst"
                    class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Agregar primera empresa
            </button>
          </div>
        </div>
      `
      // Wire CTA button to open the modal without relying on hidden buttons
      document.getElementById('btnAddFirst')?.addEventListener('click', openAddCompanyModal)
      return
    }

    listEl.innerHTML = state.companies.map(renderCard).join('')
    state.companies.forEach(c => {
      const el = document.getElementById(`card-${c.id}`)
      if (el) el.addEventListener('click', () => { location.hash = `#/company/${c.id}` })
    })
  } catch (e) {
    listEl.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12">
        <div class="text-center max-w-md">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.762 0L3.052 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <p class="text-red-400 font-medium">Error cargando empresas</p>
          <p class="text-slate-400 text-sm mt-1">${e?.message || e}</p>
        </div>
      </div>
    `
  }
}

// Card renderer for each company
function renderCard(c) {
  const lat = Number(c.lat)
  const lon = Number(c.lon)
  const coords = Number.isFinite(lat) && Number.isFinite(lon)
    ? `${lat.toFixed(5)}, ${lon.toFixed(5)}`
    : 'sin coordenadas'

  return `
    <article id="card-${c.id}" class="group relative bg-slate-800/80 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 hover:border-blue-500/40 transition-all cursor-pointer">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            ${c.name}
          </h3>
          <div class="mt-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
              ${c.activity ?? ''}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-3">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-xs text-green-400 font-medium">Activo</span>
        </div>
      </div>

      <div class="space-y-3 mb-4">
        <div class="flex items-start gap-2">
          <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p class="text-sm text-slate-400 leading-relaxed">
            ${c.address || 'Dirección no especificada'}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <code class="text-xs text-cyan-400 font-mono bg-gray-800/50 px-2 py-1 rounded border border-gray-600/30">📍 ${coords}</code>
        </div>
      </div>

      <footer class="border-t border-gray-600/30 pt-4">
        <button class="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2.5 rounded-lg transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          </svg>
          Ver clima y recomendaciones
          <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </footer>
    </article>
  `
}

// Open modal to create a company and wire map picker
async function openAddCompanyModal() {
  const app = document.getElementById('app')
  const modal = document.createElement('div')
  modal.className = 'modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
  modal.innerHTML = `
    <div class="modal bg-gradient-to-b from-slate-800 to-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-600/30" role="dialog" aria-modal="true">
      <header class="px-6 py-4 border-b border-gray-600/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90">
        <h2 class="text-xl font-semibold text-white">Nueva empresa</h2>
      </header>
      <section class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <form id="companyForm" class="space-y-5">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-white">Nombre <span class="text-red-400">*</span></label>
              <input required name="name" placeholder="Mi empresa S.A."
                     class="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-white">Actividad <span class="text-red-400">*</span></label>
              <input required name="activity" placeholder="Construcción, Agricultura..."
                     class="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-white">Dirección</label>
            <input name="address" placeholder="Opcional"
                   class="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-white">Ubicación en el mapa</label>
            <div id="map" class="h-64 bg-gray-800/30 rounded-lg border border-gray-600/30 flex items-center justify-center">
              <div class="text-center text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p class="text-sm">Mapa interactivo aquí</p>
              </div>
            </div>
          </div>

          <input type="hidden" name="lat" />
          <input type="hidden" name="lon" />
        </form>
      </section>

      <footer class="px-6 py-4 bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-t border-gray-600/30 flex justify-end gap-3">
        <button type="button" id="cancelBtn" class="px-4 py-2 text-gray-300 hover:text-white">Cancelar</button>
        <button type="submit" form="companyForm" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg">Guardar</button>
      </footer>
    </div>
  `
  app.appendChild(modal)

  // Close helpers
  const close = () => modal.remove()
  modal.querySelector('#cancelBtn').addEventListener('click', close)
  modal.addEventListener('click', (e) => { if (e.target === modal) close() })
  document.addEventListener('keydown', function onEsc(ev) { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc) } })

  // Load map picker module and sync hidden fields on change
  const { renderMapPicker } = await import('../components/mapPicker.js')
  let current = { lat: 10.9884167, lon: -74.7806216, address: '' }

  const f = modal.querySelector('#companyForm')
  f.lat.value = String(current.lat)
  f.lon.value = String(current.lon)

  const mapEl = modal.querySelector('#map')
  renderMapPicker(mapEl, {
    initial: current,
    onChange: ({ lat, lon, lng, address }) => {
      const LON = typeof lon === 'number' ? lon : Number(lng)
      current = { lat, lon: LON, address: address || '' }
      f.lat.value = String(lat)
      f.lon.value = String(LON)
      if (address) f.address.value = address
    }
  })

  // Submit create company
  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    const payload = {
      name: f.name.value.trim(),
      activity: f.activity.value.trim(),
      address: f.address.value.trim() || null,
      lat: Number(f.lat.value),
      lon: Number(f.lon.value)
    }
    if (!Number.isFinite(payload.lat) || !Number.isFinite(payload.lon)) {
      alert('Selecciona una ubicación en el mapa.')
      return
    }
    try {
      await CompanyAPI.create(payload)
      close()
      await loadCompanies()
    } catch (err) {
      alert('Error creando empresa: ' + (err?.message || err))
    }
  })
}

// Flow to delete a company: choose one, then confirm
async function handleDeleteCompany() {
  if (!state.companies.length) {
    await loadCompanies()
    if (!state.companies.length) return alert('No hay empresas para eliminar.')
  }

  const app = document.getElementById('app')
  const modal = document.createElement('div')
  modal.className = 'modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
  modal.innerHTML = `
    <div class="modal bg-gradient-to-b from-slate-800 to-slate-700 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-600/30" role="dialog" aria-modal="true">
      <header class="px-6 py-4 border-b border-gray-600/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90">
        <h2 class="text-xl font-semibold text-white">Seleccionar empresa a eliminar</h2>
      </header>
      <section class="p-6">
        <div class="space-y-3 max-h-64 overflow-y-auto">
          ${state.companies.map(company => `
            <button class="company-option w-full text-left p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/30 hover:border-red-500/50 transition-all"
                    data-company-id="${company.id}">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-white">${company.name}</h3>
                  <p class="text-sm text-slate-400">${company.activity || 'Sin actividad'}</p>
                </div>
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
            </button>
          `).join('')}
        </div>
      </section>
      <footer class="px-6 py-4 bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-t border-gray-600/30 flex justify-end">
        <button type="button" id="cancelDeleteBtn" class="px-6 py-2 text-gray-300 hover:text-white">Cancelar</button>
      </footer>
    </div>
  `
  app.appendChild(modal)

  // Close helpers
  const close = () => modal.remove()
  modal.querySelector('#cancelDeleteBtn').addEventListener('click', close)
  modal.addEventListener('click', (e) => { if (e.target === modal) close() })

  // Select a company to delete
  modal.addEventListener('click', async (e) => {
    const companyOption = e.target.closest('.company-option')
    if (!companyOption) return
    const companyId = companyOption.dataset.companyId
    // Lookup selected company then confirm
    const company = state.companies.find(c => String(c.id) === String(companyId))
    if (!company?.id) return
    close()
    showConfirmDeleteModal(company)
  })
}

// Confirmation dialog and delete call
function showConfirmDeleteModal(company) {
  const app = document.getElementById('app')
  const modal = document.createElement('div')
  modal.className = 'modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
  modal.innerHTML = `
    <div class="modal bg-gradient-to-b from-slate-800 to-slate-700 rounded-2xl shadow-2xl w-full max-w-md border border-gray-600/30" role="dialog" aria-modal="true">
      <header class="px-6 py-4 border-b border-gray-600/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90">
        <h2 class="text-xl font-semibold text-white">Confirmar eliminación</h2>
      </header>
      <section class="p-6">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.762 0L3.052 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">¿Estás seguro?</h3>
          <p class="text-slate-400 mb-4">Vas a eliminar la empresa <strong class="text-white">"${company.name}"</strong>.</p>
        </div>
      </section>
      <footer class="px-6 py-4 bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-t border-gray-600/30 flex justify-end gap-3">
        <button type="button" id="cancelConfirmBtn" class="px-6 py-2 text-gray-300 hover:text-white">No</button>
        <button type="button" id="confirmDeleteBtn" class="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg">Sí, eliminar</button>
      </footer>
    </div>
  `
  app.appendChild(modal)

  // Close helpers
  const close = () => modal.remove()
  modal.querySelector('#cancelConfirmBtn').addEventListener('click', close)
  modal.addEventListener('click', (e) => { if (e.target === modal) close() })

  // Proceed with deletion
  modal.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
    const id = company.id ?? company._id ?? company.companyId ?? company.company_id
    if (!id) { close(); alert('ID de empresa no disponible'); return }

    try {
      await CompanyAPI.remove(String(id))
      close()
      await loadCompanies()
      showSuccessMessage(`Empresa "${company.name}" eliminada correctamente`)
    } catch (error) {
      close()
      alert('Error eliminando empresa: ' + (error?.message || error))
    }
  })
}

// Simple toast
function showSuccessMessage(message) {
  const app = document.getElementById('app')
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform'
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span>${message}</span>
    </div>
  `
  app.appendChild(toast)
  setTimeout(() => { toast.style.transform = 'translateX(0)' }, 100)
  setTimeout(() => { toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300) }, 3000)
}
