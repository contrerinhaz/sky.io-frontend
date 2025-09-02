
// src/main.js
import './css/style.css'
import { startRouter } from './router/index.js'
startRouter()


window.addEventListener('load', startRouter)
window.addEventListener('hashchange', startRouter)