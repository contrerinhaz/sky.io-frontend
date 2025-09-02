// src/pages/login.js
import { loginUser, isAuthenticated, isAdmin } from '../services/auth.service.js'

export function showLogin() {
  if (isAuthenticated()) {
    location.hash = isAdmin() ? '#/dashboardAdmin' : '#/dashboard'
    return
  }

  // Keep footer height in a CSS var for layout
  const setFooterH = () => {
    const f =
      document.getElementById('site-footer') ||
      document.getElementById('siteFooter') ||
      document.querySelector('footer')
    document.documentElement.style.setProperty('--footer-h', f ? `${f.offsetHeight}px` : '0px')
  }
  setFooterH()
  window.addEventListener('resize', setFooterH, { passive: true })

  // Icons
  const eye = (cls='w-5 h-5') => `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="${cls}" aria-hidden="true">
  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    d="M2.5 12C4.5 7.5 8 5 12 5s7.5 2.5 9.5 7c-2 4.5-5.5 7-9.5 7s-7.5-2.5-9.5-7z"></path>
  <circle cx="12" cy="12" r="3" stroke-width="2"></circle>
</svg>`
  const eyeOff = (cls='w-5 h-5') => `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="${cls}" aria-hidden="true">
  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18"></path>
  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    d="M2.5 12c.64-1.58 1.57-2.95 2.68-4.04M21.5 12c-.64 1.58-1.57 2.95-2.68 4.04"></path>
  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    d="M8.5 8.5A7.9 7.9 0 0112 8c4 0 7.5 2.5 9.5 7-1.04 2.35-2.5 4.1-4.3 5.16"></path>
</svg>`

  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="min-h-[calc(100dvh-var(--footer-h))] grid place-items-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="glass-card rounded-2xl p-8">
          <div class="flex justify-start mb-6">
            <a href="#/" class="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors duration-200 group">
              <svg class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="text-sm font-medium">Volver al inicio</span>
            </a>
          </div>

          <div class="text-center mb-8">
            <h1 class="font-heading text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
              Iniciar Sesión
            </h1>
            <p class="text-gray-400">Accede a tu cuenta de Sky.io</p>
          </div>

          <form id="login-form" class="space-y-6" autocomplete="on">
            <div class="space-y-2">
              <input 
                type="email" id="email" required placeholder="Correo electrónico"
                class="form-input w-full bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                autocomplete="email"
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-stretch bg-secondary border border-gray-600 rounded-lg overflow-hidden">
                <input 
                  type="password" id="password" required minlength="6" placeholder="Contraseña"
                  class="form-input flex-1 bg-transparent border-0 px-4 py-3 text-white focus:ring-0 focus:outline-none"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  id="togglePassword"
                  aria-label="Mostrar contraseña"
                  class="px-3 text-gray-300 hover:bg-white/10 transition-colors"
                >${eye()}</button>
              </div>
            </div>

            <button type="submit" class="w-full btn-primary py-3 rounded-lg font-semibold glow-accent transition-all hover:scale-105">
              Iniciar Sesión
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-gray-400">
              ¿No tienes una cuenta?
              <a href="#/register" class="text-primary hover:text-accent transition-colors font-medium">Regístrate aquí</a>
            </p>
          </div>
        </div>

        <div class="text-center mt-8">
          <p class="text-xs text-gray-500">Sky.io - Gestión meteorológica empresarial</p>
        </div>
      </div>
    </div>
  `

  // Toggle password visibility button
  ;(() => {
    let input = document.getElementById('password')
    const btn = document.getElementById('togglePassword')
    if (!input || !btn) return
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const toType = input.type === 'password' ? 'text' : 'password'
      try {
        input.type = toType
      } catch {
        const clone = input.cloneNode(true)
        clone.type = toType
        input.parentNode.replaceChild(clone, input)
        input = clone
      }
      btn.innerHTML = toType === 'text' ? eyeOff() : eye()
      btn.setAttribute('aria-label', toType === 'text' ? 'Ocultar contraseña' : 'Mostrar contraseña')
    })
  })()

  // Decide where to send the user after login
  function resolveDestination() {
    if (isAdmin()) return '#/dashboardAdmin'
    const qs = new URLSearchParams((location.hash.split('?')[1] || ''))
    const r = qs.get('r')
    if (r && r.startsWith('#/')) {
      const base = r.split('?')[0]
      if (base !== '#/login' && base !== '#/register' && base !== '#/admin' && base !== '#/dashboardAdmin') {
        return r
      }
    }
    return '#/dashboard'
  }

  const form = document.getElementById('login-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = e.currentTarget.querySelector('button[type="submit"]')
    if (submitBtn.disabled) return
    const originalText = submitBtn.innerHTML

    // Loading UI
    submitBtn.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <div class="loading-spinner w-5 h-5"></div>
        <span>Iniciando sesión...</span>
      </div>
    `
    submitBtn.disabled = true

    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value

    try {
      await loginUser(email, password)
      location.hash = resolveDestination()
    } catch (error) {
      console.error('Login error:', error)
      ;(window.showNotification ? window.showNotification : alert)(
        error?.message || 'Email o contraseña incorrectos',
        'error'
      )
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  })
}
