// src/pages/404.js

// Render the 404 page
export function showNotFound() {
  const app = document.getElementById('app')
  const isAuthed = !!localStorage.getItem('auth_token') // auth flag available if CTAs need to vary

  // CTA markup
  const ctas = `
      <a href="#/"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition">
        Ir al inicio
      </a>
      <a href="#/register"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-dark font-semibold hover:opacity-95 transition">
        Crear cuenta
      </a>`

  // Inject page content
  app.innerHTML = `

    <div class="px-4 pt-16 pb-[calc(var(--footer-h,0px)+24px)]">
      <div class="mx-auto max-w-4xl">
        <section class="glass-card rounded-3xl p-10 lg:p-14 text-center overflow-hidden relative">
          <div class="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"></div>
          <div class="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl"></div>

          <div class="text-7xl select-none mb-4">🛰️</div>
          <h1 class="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            404 — Página no encontrada
          </h1>
          <p class="mt-4 text-slate-300 max-w-2xl mx-auto">
            La ruta que intentas abrir no existe o fue movida. Revisa la URL o vuelve a una sección conocida.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            ${ctas}
          </div>

        </section>
      </div>
    </div>
  `
}
