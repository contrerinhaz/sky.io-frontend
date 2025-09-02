
// src/router/index.js
import { showLanding } from '../pages/landing.js'
import { showRegister } from '../pages/register.js'
import { showLogin } from '../pages/login.js'
import { showNotFound } from '../pages/404.js'
import { showDashboardCustomer } from '../pages/dashboardCustomer.js'
import { showCompanyDetail } from '../pages/companyDetail.js'
import { isAuthenticated, logoutUser, isAdmin } from '../services/auth.service.js'
import { showDashboardAdmin } from '../pages/dashboardAdmin.js'

// Function goto
const goto = (h) => { if (location.hash !== h) location.hash = h }
// Function redirectToLogin
const redirectToLogin = (target) => goto(`#/login?r=${encodeURIComponent(target)}`)

const routes = new Map([
  ['#/',               { handler: showLanding }],
  ['#/register',       { handler: showRegister,        guest: true }],
  ['#/login',          { handler: showLogin,           guest: true }],
  ['#/dashboard',      { handler: showDashboardCustomer, auth: true }],
  ['#/dashboardAdmin', { handler: showDashboardAdmin,  auth: true, admin: true }],
  ['#/logout',         { handler: () => { logoutUser(); goto('#/login') } }],
  ['#/404',            { handler: showNotFound }],
])

const dynamicRoutes = [
  { pattern: /^#\/company\/(\d+)$/, auth: true, handler: (m) => showCompanyDetail(m[1]) },
]

// Export for other files
export function startRouter() {
// Function router
  function router() {
    const raw   = location.hash || '#/'
    const path  = raw.split('?')[0]
    const authed = isAuthenticated()
    const admin  = authed && isAdmin()

    if (authed && path === '#/')
      return goto(admin ? '#/dashboardAdmin' : '#/dashboard')

    if (routes.has(path)) {
      const r = routes.get(path)

      if (r.guest && authed)
        return goto(admin ? '#/dashboardAdmin' : '#/dashboard')

      if (r.auth && !authed)
        return redirectToLogin(raw)

      if (r.admin && !admin)
        return goto(authed ? '#/dashboard' : '#/login')

      return r.handler()
    }

    for (const r of dynamicRoutes) {
      const m = path.match(r.pattern)
      if (m) {
        if (r.guest && authed)
          return goto(admin ? '#/dashboardAdmin' : '#/dashboard')

        if (r.auth && !authed)
          return redirectToLogin(raw)

        if (r.admin && !admin)
          return goto(authed ? '#/dashboard' : '#/login')

        return r.handler(m)
      }
    }

    if (path !== '#/404') return goto('#/404')
    return showNotFound()
  }

  if (!location.hash) location.hash = '#/'
  addEventListener('hashchange', router)
  router()
}


