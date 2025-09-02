
// src/pages/register.js
import { registerUser } from '../services/auth.service.js'

// Export for other files
export function showRegister() {
  // Altura útil por encima del footer fijo
  const setFooterH = () => {
    const f = document.getElementById('site-footer')
    document.documentElement.style.setProperty('--footer-h', f ? `${f.offsetHeight}px` : '0px')
  }
  setFooterH()
  window.addEventListener('resize', setFooterH, { passive: true })

  const app = document.getElementById('app')
  app.innerHTML = `
    <!-- Centro perfecto en el espacio por encima del footer fijo -->
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
              Crear Cuenta
            </h1>
            <p class="text-gray-400">Únete a Sky.io y gestiona el clima de tu empresa.</p>
          </div>

          <form id="register-form" class="space-y-6" autocomplete="on">
            <div class="space-y-2">
              <input
                type="text" id="name" required placeholder="Nombre completo"
                class="form-input w-full bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                autocomplete="name"
              />
            </div>

            <div class="space-y-2">
              <input
                type="email" id="email" required placeholder="Correo electrónico"
                class="form-input w-full bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                autocomplete="email" autocapitalize="off" spellcheck="false"
              />
            </div>

            <div class="space-y-2">
              <input
                type="password" id="password" required minlength="6" placeholder="Contraseña"
                class="form-input w-full bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                autocomplete="new-password"
              />
            </div>

            <button
              type="submit"
              class="w-full btn-primary py-3 rounded-lg font-semibold glow-accent transition-all hover:scale-105"
            >
              Crear Cuenta
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-gray-400">
              ¿Ya tienes una cuenta?
              <a href="#/login" class="text-primary hover:text-accent transition-colors font-medium">Inicia sesión</a>
            </p>
          </div>
        </div>

        <div class="text-center mt-8">
          <p class="text-xs text-gray-500">Sky.io - Gestión meteorológica empresarial</p>
        </div>
      </div>
    </div>
  `

  const form = document.getElementById('register-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = e.currentTarget.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML

    submitBtn.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <div class="loading-spinner w-5 h-5"></div>
        <span>Creando cuenta...</span>
      </div>
    `
    submitBtn.disabled = true

    const name = document.getElementById('name').value.trim()
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value

    try {
      await registerUser({ name, email, password, role: 'customer' })
      showNotification('Registro exitoso. Bienvenido a SkyCare.', 'success')
      setTimeout(() => { window.location.hash = '#/dashboard' }, 1200)
    } catch (error) {
      console.error('Register error:', error)
      showNotification(error.message || 'Error al registrarse. Inténtalo nuevamente.', 'error')
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  })
}

// Notificaciones (sin template literals para evitar errores de comillas/backticks)
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  const bgColor = type === 'success' ? 'bg-green-500'
    : type === 'error' ? 'bg-red-500'
    : 'bg-blue-500'

  notification.className = [
    'fixed top-4 right-4', bgColor, 'text-white px-6 py-4 rounded-2xl shadow-lg z-50',
    'transform translate-x-full transition-transform duration-300',
    'flex items-center space-x-3 max-w-sm'
  ].join(' ')

  const icon = type === 'success'
    ? '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
    : (type === 'error'
      ? '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
      : '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    )

  notification.innerHTML = icon + '<span class="text-sm font-medium">' + message + '</span>'
  document.body.appendChild(notification)

  setTimeout(() => { notification.classList.remove('translate-x-full') }, 100)
  setTimeout(() => {
    notification.classList.add('translate-x-full')
    setTimeout(() => { notification.remove() }, 300)
  }, 4000)
}
