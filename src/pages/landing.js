
export function showLanding() {
  const app = document.getElementById('app')
  app.innerHTML = `
  <div class="px-4 pt-10 lg:pt-16">
    <div class="mx-auto w-full max-w-6xl">
      <section class="grid items-center gap-10 lg:grid-cols-2 glass-card rounded-3xl p-8 lg:p-12">
        <div class="space-y-8">
          <header class="space-y-4">
            <h1 class="font-heading text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sky.io</h1>
            <p class="text-2xl lg:text-3xl text-slate-200">Gestión meteorológica para empresas</p>
            <p class="text-lg text-slate-400">Toma decisiones seguras con datos del clima y recomendaciones accionables para tus operaciones.</p>
          </header>

          <div class="grid gap-4">
            ${feature('🌦️','Datos en tiempo real','Pronóstico y condiciones por ubicación.')}
            ${feature('🏭','Recomendaciones por industria','Protocolos y alertas adaptadas a tu actividad.')}
            ${feature('🤖','IA avanzada','Análisis predictivo y triggers operativos.')}
          </div>

          <div class="flex flex-col sm:flex-row gap-4 pt-2">
            <button onclick="location.hash='#/login'" class="btn-primary px-8 py-4 rounded-full font-semibold text-dark text-lg glow-accent">Iniciar sesión</button>
            <button onclick="location.hash='#/register'" class="px-8 py-4 rounded-full font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-dark transition-all">Registrarse</button>
          </div>
        </div>

        <div class="relative">
          <div class="rounded-3xl p-4 lg:p-6 bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-white/10 shadow-2xl">
            <div class="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,.25),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,.18),transparent_45%)]"></div>
              <div class="absolute inset-6 rounded-2xl glass-card p-6 flex flex-col items-center justify-center">
                <div class="text-8xl select-none animate-bounce">🌤️</div>
                <div class="mt-4 text-center">
                  <div class="text-5xl font-bold text-white">24°C</div>
                  <div class="text-sm text-slate-400">Condiciones óptimas</div>
                </div>
                <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
                  ${badge('UV 1')}${badge('Viento 13 km/h')}${badge('Humedad 62%')}
                </div>
              </div>
            </div>
          </div>
          <div class="pointer-events-none absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl"></div>
          <div class="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl"></div>
        </div>
      </section>

      <div class="text-center mt-8 mb-2 text-gray-500">
        <p <span class="text-accent">Datos confiables</span> • <span class="text-primary">Decisiones inteligentes</span></p>
      </div>
    </div>
  </div>
  `

// Function feature
  function feature(emoji, title, desc){
    return `<div class="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div class="text-2xl select-none">${emoji}</div>
      <div><h3 class="font-semibold text-white">${title}</h3><p class="text-sm text-slate-400">${desc}</p></div>
    </div>`
  }
// Function badge
  function badge(text){
    return `<span class="text-xs px-3 py-1 rounded-full bg-primary/15 text-sky-200 border border-sky-500/30">${text}</span>`
  }
}
