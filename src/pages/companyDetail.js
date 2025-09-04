// src/pages/companyDetail.js
import { CompanyAPI } from '../services/company.service.js'
import { API_BASE } from '../services/config.js'   // ← base del backend

// ===== helpers de usuario / backend =====
function getUserId() {
  const auth = JSON.parse(localStorage.getItem('auth_user') || 'null')
  return auth?.id ?? localStorage.getItem('user_id') ?? 1
}
function apiBase() {
  const b = String(API_BASE || '/api').replace(/\/+$/,'')
  return b.endsWith('/api') ? b : (b + '/api')
}


// Persistencia local solo para UI si el backend falla
const HISTORY_LIMIT = 50
const historyKey = (id) => `skycare:advHistory:${id}`
function loadHistoryLocal(id) { try { return JSON.parse(localStorage.getItem(historyKey(id)) || '[]') } catch { return [] } }
function saveHistoryLocal(id, arr) { localStorage.setItem(historyKey(id), JSON.stringify(arr.slice(0, HISTORY_LIMIT))) }
function pushHistoryLocal(id, item) { const arr = loadHistoryLocal(id); arr.unshift(item); saveHistoryLocal(id, arr) }

// ===== vista principal =====
export async function showCompanyDetail(id) {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="min-h-screen p-4 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-center py-12">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>
  `

  let company
  try { company = await CompanyAPI.get(id) }
  catch (e) { return showFatal(app, e?.message || 'No se pudo cargar la empresa') }

  let weatherRes = { weather: null, rules: [] }, weatherErr = null
  try { weatherRes = await CompanyAPI.weather(id) }
  catch (e) { weatherErr = e }

  renderDetail(app, company, weatherRes, { weatherErr })
}

// ===== errores =====
function showFatal(app, msg) {
  app.innerHTML = `
    <div class="min-h-screen p-4 lg:p-8 flex items-center justify-center">
      <div class="error-message rounded-2xl p-8 text-center max-w-md">
        <div class="text-4xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-red-400 mb-2">Error al cargar empresa</h2>
        <p class="text-red-300 mb-6">${sanitize(msg)}</p>
        <div class="space-x-4">
          <button onclick="window.location.hash = '#/dashboard'" class="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg">Volver al dashboard</button>
          <button onclick="location.reload()" class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg">Reintentar</button>
        </div>
      </div>
    </div>
  `
}

// ===== UI =====
function renderDetail(app, company, { weather, rules }, { weatherErr }) {
  const latN = Number(company.lat)
  const lonN = Number(company.lon)
  const haveCoords = Number.isFinite(latN) && Number.isFinite(lonN)
  const coordStr = haveCoords ? `${latN.toFixed(5)}, ${lonN.toFixed(5)}` : 'sin coordenadas'

  app.innerHTML = `
    <div class="min-h-screen p-4 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <button onclick="window.location.hash = '#/dashboard'" class="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-6 group">
            <span class="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Volver al dashboard</span>
          </button>

          <div class="glass-card rounded-2xl p-6 lg:p-8">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div class="flex-1">
                <h1 class="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">${sanitize(company.name)}</h1>
                <div class="space-y-3 text-gray-300">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center"><span class="text-primary">🏭</span></div>
                    <div>
                      <div class="font-medium text-white">Actividad industrial</div>
                      <div class="text-sm text-gray-400">${sanitize(company.activity || '')}</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center"><span class="text-accent">📍</span></div>
                    <div>
                      <div class="font-medium text-white">${sanitize(company.address || 'Dirección no especificada')}</div>
                      <div class="text-sm text-gray-400 font-mono">${coordStr}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:w-64">
                <div class="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                  <div class="text-center">
                    <div class="text-2xl mb-2">${getWeatherIcon(weather?.weatherCode)}</div>
                    <div class="font-semibold text-white">Estado meteorológico</div>
                    <div class="text-sm text-gray-400 mt-1">${weather ? 'Actualizado ahora' : 'No disponible'}</div>
                  </div>
                </div>
              </div>
            </div>

            ${weatherErr ? `
              <div class="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                No se pudo obtener el clima (${sanitize(weatherErr?.message || 'Error del servidor')}). Continuamos sin datos meteorológicos.
              </div>` : ''}
          </div>
        </div>

        <div class="mb-8">
          <div class="glass-card rounded-2xl overflow-hidden">
            <div class="p-6 border-b border-gray-600">
              <h2 class="text-xl font-semibold text-white">Ubicación</h2>
              <p class="text-gray-400 text-sm mt-1">Vista satelital de la zona de operaciones</p>
            </div>
            <div id="map" class="h-80 bg-gray-800"></div>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="weather-card glass-card rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-white">Condiciones actuales</h2>
              <div class="text-2xl">${getWeatherIcon(weather?.weatherCode)}</div>
            </div>
            ${renderWeather(weather)}
          </div>

          <div class="glass-card rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-white">Recomendaciones</h2>
              <div class="text-2xl">⚡</div>
            </div>
            ${renderQuickRules(rules)}
          </div>
        </div>

        <div class="glass-card rounded-2xl p-6 lg:p-8">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-white mb-2">Consulta avanzada con IA</h2>
              <p class="text-gray-400">Describe tu horario para obtener recomendaciones climáticas.</p>
            </div>
            <button id="historyBtn" class="px-4 py-2 rounded-lg border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10">Historial</button>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">Describe tu consulta</label>
              <textarea id="advMsg" placeholder="Ej: Mañana de 08:00 a 12:00 en la sede" class="form-input w-full bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors h-24 resize-none"></textarea>
            </div>
            <button id="advBtn" class="btn-primary px-6 py-3 rounded-lg font-semibold">Generar recomendaciones IA</button>
          </div>
          <div id="advResult" class="mt-6"></div>
        </div>
      </div>
    </div>
  `

  initializeMap(haveCoords ? latN : null, haveCoords ? lonN : null, company.name, company.activity)
  document.getElementById('advBtn').addEventListener('click', () => handleAdvancedQuery(company.id, company.activity))
  document.getElementById('historyBtn').addEventListener('click', () => openHistoryModal(company.id))
}

// ===== consulta avanzada =====
async function handleAdvancedQuery(id, fallbackActivity) {
  const msg = document.getElementById('advMsg').value.trim()
  if (!msg) return showNotification('Describe tu consulta', 'error')

  const btn = document.getElementById('advBtn')
  const resultEl = document.getElementById('advResult')
  const original = btn.innerHTML
  btn.innerHTML = `<div class="flex items-center justify-center gap-2"><div class="loading-spinner w-5 h-5"></div><span>Consultando IA...</span></div>`
  btn.disabled = true

  try {
    const res = await CompanyAPI.advancedQuery(id, msg)
    // fallback local (el backend ya guarda historial)
    const schedule = res?.schedule ?? null
    const response = res?.recommendations ?? res?.answer ?? 'Sin contenido'
    pushHistoryLocal(id, { ts: Date.now(), prompt: msg, schedule, response })
    resultEl.innerHTML = renderAdvResult(res, fallbackActivity)
  } catch (e) {
    resultEl.innerHTML = `
      <div class="error-message rounded-xl p-4">
        <div class="flex items-center gap-2 text-red-400"><span>⚠️</span><strong>Error:</strong> ${sanitize(e?.message || 'Fallo en la consulta')}</div>
      </div>
    `
  } finally {
    btn.innerHTML = original
    btn.disabled = false
  }
}

function renderAdvResult(res, fallbackActivity) {
  const meta = {
    fecha: res?.schedule?.fecha || 'No especificada',
    horaInicio: res?.schedule?.horaInicio || '',
    horaFin: res?.schedule?.horaFin || '',
    actividad: res?.schedule?.actividad || fallbackActivity || '',
  }
  const raw = String(res?.recommendations || '')
  const risk = extractRisk(raw)
  const horario = [meta.horaInicio, meta.horaFin].filter(Boolean).join(' - ')

  return `
    <article class="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-800/40 overflow-hidden">
      <header class="flex items-start justify-between gap-4 p-6 border-b border-white/10">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">🤖</div>
          <div>
            <h3 class="text-white font-semibold">Análisis de la operación</h3>
            <div class="text-xs text-slate-400 mt-1">
              <span class="mr-2"><strong>Fecha:</strong> ${sanitize(meta.fecha)}</span>
              ${horario ? `<span class="mr-2"><strong>Horario:</strong> ${sanitize(horario)}</span>` : ''}
              ${meta.actividad ? `<span><strong>Actividad:</strong> ${sanitize(meta.actividad)}</span>` : ''}
            </div>
          </div>
        </div>
        ${risk.level ? `
          <span class="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${risk.bg} shadow">
            <span>${risk.icon}</span>
            <b class="tracking-wide">${risk.level}</b>
          </span>` : ''}
      </header>

      <section class="p-6 space-y-6">
        ${renderStyledRecommendations(raw, risk)}
      </section>
    </article>
  `
}

// ===== historial (UI + llamadas backend) =====
async function fetchHistorySQL(companyId, limit = 50) {
  const res = await fetch(`${apiBase()}/companies/${encodeURIComponent(companyId)}/history?limit=${limit}`, {
    headers: {
      'Accept': 'application/json',
      'x-user-id': String(getUserId())
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json().catch(() => ({}))
  return Array.isArray(json.items) ? json.items : []
}
async function clearHistorySQL(companyId) {
  const res = await fetch(`${apiBase()}/companies/${encodeURIComponent(companyId)}/history`, {
    method: 'DELETE',
    headers: { 'x-user-id': String(getUserId()) }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json().catch(() => ({}))
}

function clip(s, n = 160) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s }
function renderHistRow(it, i) {
  const meta = it.schedule || {}
  const horario = [meta.horaInicio, meta.horaFin].filter(Boolean).join(' - ')
  const ts = it.ts ? new Date(it.ts).toLocaleString() : new Date().toLocaleString()
  return `
    <article id="row-${i}" class="rounded-xl border border-white/10 bg-white/5">
      <header class="flex items-start justify-between gap-3 p-4">
        <div class="min-w-0">
          <div class="text-xs text-slate-400">#${i + 1} · ${ts}</div>
          <div class="text-sm text-white mt-1 truncate">${sanitize(clip(it.prompt, 180))}</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600" data-action="reuse" data-idx="${i}">Reusar</button>
          <button class="px-3 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600" data-action="toggle" data-idx="${i}">Ver más</button>
        </div>
      </header>
      <div class="row-panel hidden px-4 pb-4">
        ${
          meta.fecha || horario || meta.actividad
            ? `<div class="mb-3 text-xs text-slate-300">
                 ${meta.fecha ? `<span class="mr-3"><b>Fecha:</b> ${sanitize(meta.fecha)}</span>` : ''}
                 ${horario ? `<span class="mr-3"><b>Horario:</b> ${sanitize(horario)}</span>` : ''}
                 ${meta.actividad ? `<span><b>Actividad:</b> ${sanitize(meta.actividad)}</span>` : ''}
               </div>`
            : ''
        }
        <pre class="whitespace-pre-wrap break-words text-sm text-slate-200">${sanitize(it.response || 'Sin respuesta')}</pre>
        <div class="mt-2 text-right">
          <button class="px-3 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600" data-action="copy" data-idx="${i}">Copiar</button>
        </div>
      </div>
    </article>
  `
}

async function openHistoryModal(companyId) {
  let items = []
  let error = null
  try {
    items = await fetchHistorySQL(companyId, 50)          // ← del backend, filtrado por x-user-id
  } catch (e) {
    error = e?.message || 'Error cargando historial'
    // fallback local si algo falla
    items = loadHistoryLocal(companyId)
  }

  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black/60 p-4 z-50 flex items-center justify-center'
  modal.innerHTML = `
    <div class="glass-card rounded-2xl w-full max-w-3xl h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h3 class="text-lg font-semibold text-white">Historial de consultas IA</h3>
          ${error ? `<div class="text-xs text-red-300 mt-1">${sanitize(error)}</div>` : ''}
        </div>
        <div class="flex gap-2">
          ${items.length ? `<button id="clearHist" class="px-3 py-1 rounded-md bg-red-700 hover:bg-red-600">Borrar historial</button>` : ''}
          <button id="closeHist" class="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600">Cerrar</button>
        </div>
      </div>

      <div id="histBody" class="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        ${
          items.length
            ? items.map((it, i) => renderHistRow(it, i)).join('')
            : `<div class="text-gray-400 text-sm">No hay consultas registradas.</div>`
        }
      </div>
    </div>
  `
  const prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.body.appendChild(modal)
  const close = () => { document.body.style.overflow = prevOverflow; modal.remove() }

  modal.addEventListener('click', (e) => { if (e.target === modal) close() })
  modal.querySelector('#closeHist').addEventListener('click', close)

  const body = modal.querySelector('#histBody')
  body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const idx = Number(btn.dataset.idx)
    const action = btn.dataset.action
    if (action === 'toggle') {
      const panel = modal.querySelector(`#row-${idx} .row-panel`)
      if (!panel) return
      panel.classList.toggle('hidden')
      btn.textContent = panel.classList.contains('hidden') ? 'Ver más' : 'Ver menos'
    }
    if (action === 'reuse') {
      const input = document.getElementById('advMsg')
      if (input) input.value = items[idx].prompt || ''
      close()
    }
    if (action === 'copy') {
      navigator.clipboard?.writeText(items[idx].response || '')
      btn.textContent = 'Copiado'
      setTimeout(() => (btn.textContent = 'Copiar'), 900)
    }
  })

  const clearBtn = modal.querySelector('#clearHist')
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      try {
        await clearHistorySQL(companyId)
      } catch {
        // si el backend falla, limpia local
        localStorage.removeItem(historyKey(companyId))
      }
      close()
      openHistoryModal(companyId)
    })
  }
}

// ===== secciones recomendación =====
function renderStyledRecommendations(text, risk) {
  const sections = splitSections(text)
  const blocks = sections.map(({ name, text }) => {
    const key = name.toLowerCase()
    if (/riesgos/.test(key)) return cardBlock('Riesgos principales', listify(text, 'alert'), 'from-rose-500/15 to-red-500/10', 'border-red-500/30', '⚠️')
    if (/medidas/.test(key)) return cardBlock('Medidas preventivas', listify(text, 'check'), 'from-emerald-500/15 to-teal-500/10', 'border-emerald-500/30', '🛡️')
    if (/umbrales|trigger/.test(key)) return cardBlock('Umbrales y triggers', listify(text, 'target'), 'from-amber-500/15 to-yellow-500/10', 'border-amber-500/30', '🎯')
    if (/checklist/.test(key)) return cardBlock('Checklist', listify(text, 'numbered'), 'from-blue-500/15 to-cyan-500/10', 'border-blue-500/30', '📝')
    if (/nivel de riesgo/.test(key)) {
      const just = extractJustification(text)
      return `
        <div class="rounded-xl p-4 bg-gradient-to-r from-slate-700/40 to-slate-700/20 border border-white/10">
          <div class="flex items-center gap-2 mb-2 text-white">
            <span>📊</span><h4 class="font-medium">Nivel de riesgo</h4>
          </div>
          ${risk?.level ? `<div class="mb-2 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${risk.bg} shadow">
            <span>${risk.icon}</span><b>${risk.level}</b>
          </div>` : ''}
          ${just ? `<p class="text-sm text-slate-300 leading-relaxed"><span class="text-slate-400">Justificación:</span> ${sanitize(just)}</p>` : ''}
        </div>
      `
    }
    return cardBlock(name || 'Recomendaciones', listify(text, 'dot'), 'from-slate-600/20 to-slate-700/20', 'border-white/10', '✨')
  })
  return blocks.join('')
}
function cardBlock(title, contentHtml, grad, border, icon) {
  return `
    <div class="rounded-xl p-4 bg-gradient-to-r ${grad} border ${border}">
      <div class="flex items-center gap-2 mb-2 text-white">
        <span>${icon}</span><h4 class="font-medium">${sanitize(title)}</h4>
      </div>
      ${contentHtml}
    </div>
  `
}
function splitSections(txt) {
  const re = /(Riesgos principales|Medidas preventivas|Umbrales y triggers|Umbrales|Checklist breve|Checklist|Nivel de riesgo)\s*:/gi
  const out = []; let m, last = null, idx = 0
  while ((m = re.exec(txt)) !== null) { if (last) out.push({ name: last, text: txt.slice(idx, m.index).trim() }); last = m[1]; idx = re.lastIndex }
  if (last) out.push({ name: last, text: txt.slice(idx).trim() })
  if (!out.length) out.push({ name: 'Recomendaciones', text: txt })
  return out
}
function listify(text, mode = 'dot') {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const items = lines.map((l) => (l.match(/^[-•]\s*(.+)$/) || l.match(/^\d+[.)]\s*(.+)$/) || [, l])[1])
  if (!items.length) return `<p class="text-sm text-slate-300">${sanitize(text)}</p>`
  if (mode === 'numbered') {
    return `<ol class="space-y-2 ml-1">${items.map((it, i) => `
      <li class="flex items-start gap-2 text-sm text-slate-200">
        <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/30 border border-blue-400/40 text-[11px]">${i + 1}</span>
        <span class="leading-relaxed">${sanitize(it)}</span>
      </li>`).join('')}</ol>`
  }
  const symbol = mode === 'check' ? '✅' : mode === 'alert' ? '⚠️' : mode === 'target' ? '🎯' : '•'
  return `<ul class="space-y-2 ml-1">${items.map((it) => `
    <li class="flex items-start gap-2 text-sm text-slate-200">
      <span class="mt-0.5">${symbol}</span>
      <span class="leading-relaxed">${sanitize(it)}</span>
    </li>`).join('')}</ul>`
}
function extractRisk(text) {
  const m = text.match(/Nivel de riesgo:\s*(Alto|Medio|Bajo)/i)
  const level = m ? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() : null
  const map = { 'Alto': { bg: 'from-red-600 to-pink-600', icon: '⛔' }, 'Medio': { bg: 'from-amber-500 to-orange-600', icon: '⚠️' }, 'Bajo': { bg: 'from-emerald-500 to-teal-600', icon: '🟢' } }
  return level ? { level, ...map[level] } : { level: null }
}
function extractJustification(text) { const j = text.match(/Justificación:\s*([\s\S]+)/i); return j ? j[1].trim() : '' }

// ===== mapa y utilidades =====
function getWeatherIcon(code) {
  const iconMap = {1000:'☀️',1100:'🌤️',1101:'⛅',1102:'🌥️',1001:'☁️',2000:'🌫️',2100:'🌫️',3000:'💨',3001:'💨',3002:'💨',4000:'🌦️',4200:'🌧️',4001:'🌧️',4201:'⛈️',5000:'🌨️',5100:'❄️',5001:'🌨️',5101:'❄️',6000:'🌨️',6200:'🌨️',6001:'🌨️',7000:'🧊',7102:'🧊',7101:'🧊',8000:'⛈️'}
  return iconMap[code] || '🌤️'
}
function initializeMap(lat, lon, name, activity) {
  const mapEl = document.getElementById('map')
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) { mapEl.innerHTML = `<div class="h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-2">📍</div><div>Sin coordenadas válidas</div></div></div>`; return }
  const mapboxgl = window.mapboxgl
  if (!mapboxgl) { mapEl.innerHTML = `<div class="h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-4">🗺️</div><div>Mapbox no disponible</div></div></div>`; return }
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (!token) { mapEl.innerHTML = `<div class="h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-4">🔑</div><div class="text-sm">Token de Mapbox requerido</div></div></div>`; return }
  mapboxgl.accessToken = token
  try {
    const map = new mapboxgl.Map({ container: mapEl, style: 'mapbox://styles/mapbox/satellite-streets-v12', center: [lon, lat], zoom: 14 })
    new mapboxgl.Marker({ color: '#00ffff' })
      .setLngLat([lon, lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<div class="text-center p-2"><div class="font-semibold text-gray-800">${sanitize(name)}</div><div class="text-sm text-gray-600">${sanitize(activity || '')}</div></div>`))
      .addTo(map)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  } catch {
    mapEl.innerHTML = `<div class="h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-4xl mb-4">❌</div><div class="text-sm">Error cargando mapa</div></div></div>`
  }
}
function isNum(v) { return typeof v === 'number' && Number.isFinite(v) }
function sanitize(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') }
function showNotification(message, type = 'info') {
  const n = document.createElement('div')
  n.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform translate-x-full ${ type === 'success' ? 'success-message' : type === 'error' ? 'error-message' : 'glass-card' }`
  n.innerHTML = `<div class="flex items-center gap-3"><div class="text-xl">${ type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️' }</div><span class="font-medium">${sanitize(message)}</span></div>`
  document.body.appendChild(n)
  setTimeout(() => n.style.transform = 'translateX(0)', 50)
  setTimeout(() => { n.style.transform = 'translateX(120%)'; setTimeout(() => n.remove(), 300) }, 3000)
}

// ===== clima panel =====
function renderWeather(w) {
  if (!w) return `<div class="text-center text-gray-400 py-8"><div class="text-4xl mb-4">🌫️</div><div>Datos meteorológicos no disponibles</div></div>`
  const temp = isNum(w.temperatura) ? Math.round(w.temperatura) : '--'
  const feels = isNum(w.sensacionTermica) ? Math.round(w.sensacionTermica) : '--'
  const humidity = isNum(w.humedad) ? w.humedad : '--'
  const windSpeed = isNum(w.viento) ? (w.viento * 3.6).toFixed(1) : '--'
  const uv = w.uv ?? '--'
  const visibility = w.visibilidad ?? '--'
  return `
    <div class="space-y-6">
      <div class="text-center">
        <div class="text-5xl font-bold text-white mb-2">${temp}°C</div>
        <div class="text-gray-300">${sanitize(w.weatherText || 'Condiciones normales')}</div>
        <div class="text-sm text-gray-400 mt-1">Sensación térmica: ${feels}°C</div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-secondary/30 rounded-lg p-3 text-center"><div class="text-2xl mb-1">💧</div><div class="text-sm text-gray-400">Humedad</div><div class="font-semibold text-white">${humidity}%</div></div>
        <div class="bg-secondary/30 rounded-lg p-3 text-center"><div class="text-2xl mb-1">💨</div><div class="text-sm text-gray-400">Viento</div><div class="font-semibold text-white">${windSpeed} km/h</div></div>
        <div class="bg-secondary/30 rounded-lg p-3 text-center"><div class="text-2xl mb-1">☀️</div><div class="text-sm text-gray-400">Índice UV</div><div class="font-semibold text-white">${uv}</div></div>
        <div class="bg-secondary/30 rounded-lg p-3 text-center"><div class="text-2xl mb-1">👁️</div><div class="text-sm text-gray-400">Visibilidad</div><div class="font-semibold text-white">${visibility} km</div></div>
      </div>
    </div>
  `
}
function renderQuickRules(rules) {
  if (!Array.isArray(rules) || rules.length === 0) {
    return `<div class="text-center text-gray-400 py-8"><div class="text-4xl mb-4">✅</div><div>Condiciones normales de trabajo</div><div class="text-sm mt-2">Seguir procedimientos estándar</div></div>`
  }
  return `
    <div class="space-y-4">
      ${rules.map((rule, i) => `
        <div class="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
          <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-primary text-sm font-bold">${i + 1}</span>
          </div>
          <div class="text-sm text-gray-200 leading-relaxed">${sanitize(rule)}</div>
        </div>`).join('')}
    </div>
  `
}
