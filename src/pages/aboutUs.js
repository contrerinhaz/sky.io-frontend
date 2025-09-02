// src/pages/about.us.js
export function showAboutUs() {
  const app = document.getElementById('app')
  const isAuthed = !!localStorage.getItem('auth_token')

  const ctaButtons =`
      <div class="flex gap-3">
        <a href="#/register"
           class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-dark font-semibold hover:opacity-95 transition">
          Registrarse
        </a>
        <a href="#/login"
           class="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition">
          Iniciar sesión
        </a>
      </div>`

  app.innerHTML = 
  `
    <!-- Botón flotante fuera del contenido -->
    <a href="#/"
    class="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 text-white text-sm shadow-lg transition">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
    </svg>
    Inicio
    </a>

  <div class="px-4 pt-12 lg:pt-16 pb-[calc(var(--footer-h,0px)+24px)]">
    <div class="mx-auto w-full max-w-7xl space-y-12">

      <!-- HERO -->
      <section class="glass-card rounded-3xl p-8 lg:p-12 overflow-hidden">
        <div class="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
          <div class="flex-1 space-y-4">
            <h1 class="font-heading text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Sobre <span class="whitespace-nowrap">Sky.io</span>
            </h1>
            <p class="text-slate-300/90 text-lg leading-relaxed max-w-2xl">
              Combinamos datos meteorológicos de alta fidelidad, modelos ML y reglas por industria
              para convertir el clima en decisiones operativas seguras y accionables.
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              ${metric("99.95%", "Disponibilidad")}

              ${metric("24/7", "Monitoreo")}
            </div>
          </div>

          <div class="relative w-full max-w-md mx-auto lg:mx-0">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div class="aspect-video rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-400/10 grid place-items-center">
                <div class="text-6xl">⛅</div>
              </div>
              <p class="mt-4 text-sm text-slate-400">
                Señales confiables para planificar turnos, rutas, mantenimiento y seguridad.
              </p>
            </div>
            <div class="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl"></div>
            <div class="pointer-events-none absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl"></div>
          </div>
        </div>
      </section>


      <!-- MISIÓN / VISIÓN -->
      <section id="mv" class="grid gap-6 md:grid-cols-2">
        <article class="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <div class="flex items-center gap-3 mb-3">
            <h2 class="text-xl lg:text-2xl font-bold text-white">Misión</h2>
          </div>
          <p class="text-slate-300 leading-relaxed">
            Ayudar a las empresas a operar con seguridad y eficiencia frente a la variabilidad climática,
            entregando <span class="text-white font-semibold">señales accionables en tiempo real</span>:
            alertas, protocolos y recomendaciones integradas a su operación diaria.
          </p>
          <ul class="mt-4 space-y-2 text-slate-300 text-sm">
            <li class="flex items-start gap-2"><span class="mt-1 text-sky-300">•</span>Reducir incidentes y tiempos muertos por clima.</li>
            <li class="flex items-start gap-2"><span class="mt-1 text-sky-300">•</span>Optimizar planificación de turnos, rutas y mantenimiento.</li>
            <li class="flex items-start gap-2"><span class="mt-1 text-sky-300">•</span>Elevar la productividad con información simple y confiable.</li>
          </ul>
        </article>

        <article class="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <div class="flex items-center gap-3 mb-3">
            <h2 class="text-xl lg:text-2xl font-bold text-white">Visión</h2>
          </div>
          <p class="text-slate-300 leading-relaxed">
            Ser la <span class="text-white font-semibold">capa de decisión de referencia en LATAM</span> para clima operativo,
            integrando datos, IA y experiencia de campo en una plataforma nativa que conecta con
            mensajería, CMMS y tableros ejecutivos.
          </p>
          <ul class="mt-4 space-y-2 text-slate-300 text-sm">
            <li class="flex items-start gap-2"><span class="mt-1 text-sky-300">•</span>Ecosistema abierto de integraciones.</li>
            <li class="flex items-start gap-2"><span class="mt-1 text-sky-300">•</span>Modelos por industria y por sitio, continuamente aprendiendo.</li>
            <li class="flex items-start gap-2"><span class="mt-1 text-sky-300">•</span>Experiencia de uso simple para la primera línea.</li>
          </ul>
        </article>
      </section>

      <!-- PROPUESTA -->
      <section id="propuesta" class="space-y-6">
        <h2 class="text-2xl lg:text-3xl font-bold text-white">Nuestra propuesta de valor</h2>
        <div class="grid gap-6 md:grid-cols-3">
          ${card('🎯','Del dato a la acción','Unificamos fuentes meteorológicas y reglas de negocio para entregar alertas, tareas y recomendaciones listas para ejecutar.')}
          ${card('🛡️','Seguridad operativa','Reducimos incidentes por clima extremo con protocolos adaptados a cada sitio y actividad.')}
          ${card('⚙️','Integración sencilla','SDK y webhooks para conectar con tu CMMS, mensajería o BI. Sin fricción para tu equipo.')}
        </div>
      </section>


      <!-- INDUSTRIAS -->
      <section id="industrias" class="space-y-6">
        <h2 class="text-2xl lg:text-3xl font-bold text-white">Industrias que servimos</h2>
        <div class="flex flex-wrap gap-2">
          ${pill('Logística y puertos')}
          ${pill('Construcción')}
          ${pill('Energía y utilities')}
          ${pill('Agroindustria')}
          ${pill('Eventos y entretenimiento')}
        </div>
      </section>

      <!-- EQUIPO -->
      <section id="equipo" class="space-y-6">
        <h2 class="text-2xl lg:text-3xl font-bold text-white">Equipo</h2>
        <p class="text-slate-300 max-w-3xl">
          Somos un equipo de ingeniería, ciencia de datos y operaciones en campo. Combinamos experiencia
          en meteorología aplicada con software robusto para llevar señales confiables a la primera línea.
        </p>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${member('A. Rivera', 'CTO', 'Arquitectura, datos y plataforma.')}
          ${member('L. Méndez', 'Head of Ops', 'Implementación en sitio y protocolos.')}
          ${member('S. Torres', 'Product Lead', 'Experiencia de usuario y partners.')}
        </div>
      </section>

      <!-- CTA FINAL -->
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 class="text-xl font-semibold text-white">¿Listo para probar Sky.io?</h3>
          </div>
          ${ctaButtons}
        </div>
      </section>

    </div>
  </div>
  `

  // helpers
  function metric(v, l) {
    return `
      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <div class="text-2xl font-semibold text-white">${v}</div>
        <div class="text-xs text-slate-400">${l}</div>
      </div>`
  }
// Function card
  function card(icon, title, desc){
    return `
      <article class="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
        <div class="text-2xl mb-2 select-none">${icon}</div>
        <h3 class="text-white font-semibold">${title}</h3>
        <p class="text-slate-300 text-sm leading-relaxed mt-1">${desc}</p>
      </article>`
  }
// Function stat
  function stat(value, label){
    return `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
        <div class="text-3xl font-bold text-white">${value}</div>
        <div class="text-slate-400 text-sm mt-1">${label}</div>
      </div>`
  }
// Function milestone
  function milestone(year, title, desc){
    return `
      <li class="relative pl-4">
        <span class="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full bg-sky-400"></span>
        <div class="text-sky-300 text-xs tracking-wide">${year}</div>
        <div class="text-white font-semibold">${title}</div>
        <p class="text-slate-300 text-sm">${desc}</p>
      </li>`
  }
// Function pill
  function pill(t){
    return `<span class="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-slate-200 text-sm">${t}</span>`
  }
// Function member
  function member(name, role, blurb){
    return `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500/30 to-cyan-400/20 border border-white/20"></div>
          <div>
            <div class="text-white font-semibold">${name}</div>
            <div class="text-slate-400 text-sm">${role}</div>
          </div>
        </div>
        <p class="text-slate-300 text-sm mt-3">${blurb}</p>
      </div>`
  }
}
