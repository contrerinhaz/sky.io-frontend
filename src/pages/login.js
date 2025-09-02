
// src/pages/login.js
import { loginUser, isAuthenticated, isAdmin } from '../services/auth.service.js'

// Export for other files
export function showLogin() {
  // Si ya hay sesión, salta directo según rol
  if (isAuthenticated()) {
    location.hash = isAdmin() ? '#/dashboardAdmin' : '#/dashboard'
    return
  }

  // Ajuste por footer fijo: expone --footer-h
  const setFooterH = () => {
    const f =
      document.getElementById('site-footer') ||
      document.getElementById('siteFooter') ||
      document.querySelector('footer')
    document.documentElement.style.setProperty('--footer-h', f ? `${f.offsetHeight}px` : '0px')
  }
  setFooterH()
  window.addEventListener('resize', setFooterH, { passive: true })

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
              <input 
                type="password" id="password" required minlength="6" placeholder="Contraseña"
                class="form-input w-full bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                autocomplete="current-password"
              />
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

  // Destino tras login:
  // - Si es admin: siempre #/dashboardAdmin
  // - Si no es admin: usa ?r= si es seguro; si no, #/dashboard
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

  // Envío del formulario
  const form = document.getElementById('login-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = e.currentTarget.querySelector('button[type="submit"]')
    if (submitBtn.disabled) return
    const originalText = submitBtn.innerHTML

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
      // loginUser debe guardar token y user (con role) en localStorage
      await loginUser(email, password)
      // Redirige según rol y ?r=
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
