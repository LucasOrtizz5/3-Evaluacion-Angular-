# Aplicacion Rick&Morty Frontend

Frontend desarrollado con Angular 21 para explorar personajes, episodios y ubicaciones de Rick and Morty, con autenticacion, perfil de usuario, favoritos y panel administrativo.

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Variables de entorno

La app utiliza los archivos de entorno en `src/environments/`.

- `environment.ts`: entorno local por defecto.
- `environment.remote.ts`: backend remoto.
- `environment.remote.proxy.ts`: remoto usando proxy local (`proxy.render.json`).
- `environment.prod.ts` y `environment.prod.remote.ts`: produccion.

## Scripts principales

```bash
# Desarrollo local
npm start

# Desarrollo contra backend remoto
npm run start:remote

# Desarrollo remoto con proxy
npm run start:remote-proxy

# Build de produccion local
npm run build

# Build de produccion remoto
npm run build:remote
```

## Testing

```bash
# Unit tests (Vitest)
npm test

# Cypress E2E (headless)
npm run cypress:run

# Cypress Component (headless)
npm run cypress:run:component

# Cypress modo interactivo
npm run cypress:open
```

## Estructura de testing

- `cypress/e2e/`: pruebas end-to-end por feature (`auth`, `dashboard`, `episodes`, etc.).
- `src/app/**/**/*.cy.ts`: pruebas de componentes junto al componente.
- `cypress/e2e/support/mocks.js`: mocks reutilizables de API para escenarios de prueba.

## Notas

- El backend se configura por entorno; revisar `BACKEND_HANDOFF.md` para detalles de integracion.
- Para despliegue, se incluyen configuraciones de `vercel.json` y `proxy.render.json`.
