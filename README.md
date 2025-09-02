# SkyCare · Frontend SPA

Aplicación de una sola página construida con Vite, Vanilla. Empaquetada con Vite. Licencia UNLICENSED.

> Versión del paquete: `0.0.0`

## Arquitectura
- SPA con Vanilla y Vite.
- Gestión de estado y vistas desde `src/`.
- Comunicación con el backend a través de servicios en `src/services/`.
- Variables de entorno con prefijo `VITE_` expuestas en `import.meta.env`.
- Estilos y utilidades CSS: CSS del proyecto.

## Estructura de carpetas
Árbol resumido del repositorio (hasta 3 niveles):
```
LICENSE
index.html
package-lock.json
package.json
src/
src/main.js
src/components/
src/components/mapPicker.js
src/css/
src/css/style.css
src/pages/
src/pages/404.js
src/pages/aboutUs.js
src/pages/companyDetail.js
src/pages/dashboardAdmin.js
src/pages/dashboardCustomer.js
src/pages/landing.js
src/pages/login.js
src/pages/register.js
src/router/
src/router/index.js
src/services/
src/services/admin.service.js
src/services/auth.service.js
src/services/company.service.js
src/services/config.js
```

### Guía de carpetas y archivos
- `index.html`: documento raíz y puntos de entrada de la app.
- `src/main.*`: arranque de la aplicación y montaje en el DOM.
- `src/components/`: componentes UI reutilizables.
- `src/pages/` o `src/views/`: vistas de alto nivel.
- `src/routes/`: definición de rutas si aplica.
- `src/services/`: clientes HTTP hacia el backend.
- `src/assets/`: recursos estáticos.
- `public/`: archivos estáticos servidos sin procesamiento.
- `vite.config.*`: configuración de Vite.
- `package.json`: scripts y dependencias.

- Vite detectado por dependencias
- `index.html` entradas: ./src/main.js
- Entradas de aplicación: src/main.js

## Inicio rápido
```bash
npm i
cp .env.example .env
npm run dev
```
Abre el navegador en la URL que muestre Vite (por defecto `http://localhost:5173`).

## Build de producción
```bash
npm run build
# Opcional
npm run preview
```

## Variables de entorno
Crea `.env` con claves `VITE_*`. Detectadas en el código:
```
VITE_API_BASE
VITE_MAPBOX_ACCESS_TOKEN
```

## Calidad y DX
- Linting y formateo si existen scripts en `package.json` (`lint`, `format`).
- Aliases de importación configurables en `vite.config.*`.
- Hot Module Replacement activo en desarrollo.

## Integración con backend
- Configura `VITE_API_BASE_URL` apuntando al backend.
- Manten la misma política de CORS que el servidor.
- Endpoints consumidos definidos en `src/services/*`.

## Despliegue
- Publica el contenido de `dist/` en tu hosting estático.
- Ajusta `base` en `vite.config.*` si el sitio vive bajo un sub-path.
- Usa `npm run preview` para validar el build localmente.

## Licencia
UNLICENSED. Revisa `LICENSE` si está presente.

---
Documento generado el 2025-09-02.
