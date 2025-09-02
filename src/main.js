// src/main.js
// Global styles
import './css/style.css'

// App entry. Initialize router and mount current route
import { startRouter } from './router/index.js'
startRouter()

// Re-run router on page load and on hash changes
window.addEventListener('load', startRouter)
window.addEventListener('hashchange', startRouter)
