# Backend Handoff

## Estado actual del front

La aplicación Angular ya tiene implementado en frontend lo siguiente:

- Perfil de usuario con edición de:
  - nickname
  - fecha de nacimiento
  - ubicación
  - URL de foto de perfil
- Imagen de perfil con fallback automático si no existe URL personalizada.
- Favoritos de episodios guardados en `localStorage` por usuario autenticado.
- Comentarios por episodio con:
  - crear
  - editar
  - eliminar
  - paginación
  - permisos por rol/autor
  - avatar circular con fallback
- La UI de comentarios ya quedó compacta y alineada con el estilo visual del proyecto.

## Estado actual de la fuente de datos

Hoy el front todavía depende de datos locales para varias cosas:

- El perfil editable se guarda en `localStorage` mientras no exista backend real.
- Los favoritos se guardan en `localStorage`.
- Los comentarios se guardan en `localStorage`.
- La imagen del avatar en comentarios toma la URL del perfil local cuando existe, y si no, usa el placeholder base.

## Lo que falta llevar a backend

### 1. Roles de usuario

- Debe existir `user` y `admin`.
- Por defecto todos los usuarios nuevos deben quedar como `user`.
- Solo desde base de datos o administración interna se debe poder cambiar un usuario a `admin`.
- El front ya contempla roles, pero el backend debe devolverlos y validarlos.

### 2. Datos extra de usuario

Agregar y persistir en backend / base de datos:

- `nickname`
- `profileImageUrl`
- `birthDate`

También conviene que `GET /auth/me` o equivalente devuelva estos campos para hidratar el front.

### 3. Favoritos por usuario

- Los episodios favoritos deben guardarse en backend.
- Deben quedar asociados a cada usuario autenticado.
- Al loguear, el front debería recibir el listado de favoritos desde backend.
- Idealmente el front dejará de usar `localStorage` para esta parte.

### 4. Comentarios por usuario y episodio

- Los comentarios deben persistirse en backend.
- Cada comentario debe quedar asociado a:
  - usuario autor
  - episodio
  - contenido
  - fecha de creación / edición
- Debe respetarse la lógica actual de permisos:
  - el autor puede editar o eliminar
  - el admin puede moderar
- Si un comentario cambia el avatar del usuario más adelante, el front debería tomar la URL actual del perfil desde backend.

## Funcionalidad pendiente para admin

Además del perfil normal, el usuario `admin` debe tener un dashboard donde pueda:

- ver todos los usuarios logueados
- ver el listado de favoritos de cada usuario
- eventualmente ver métricas o moderación de comentarios si se decide ampliar

## Observaciones de implementación

- El front ya está preparado para recibir estas piezas con un cambio relativamente pequeño de integración.
- Conviene exponer un contrato claro en backend para no duplicar lógica en Angular.
- La fuente de verdad debería pasar a ser backend para:
  - perfil
  - favoritos
  - comentarios
  - roles

## Sugerencia de próximo paso

Antes de tocar UI nueva, conviene cerrar primero:

1. modelo de usuario
2. modelo de favorito
3. modelo de comentario
4. endpoints de lectura/escritura
5. respuesta completa de `me` / sesión
6. dashboard de admin

## Nota rápida

Si el backend todavía no está listo, el front actual funciona con localStorage como solución temporal.
