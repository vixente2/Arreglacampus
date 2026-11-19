# ArreglaCampus

Aplicación web para que los estudiantes reporten incidencias del campus (una farola apagada, una silla rota, un baño sin limpiar, una rampa bloqueada) y sigan su estado hasta que se resuelven. El equipo del campus las gestiona desde un panel de administración.

Producción: https://arreglacampus.vercel.app

## Qué hace

**Para el estudiante**

- Crea una cuenta con nombre, correo y contraseña (mínimo 8 caracteres) e inicia sesión.
- Envía una solicitud indicando título, categoría, ubicación, descripción y, opcionalmente, una foto.
- Ve un resumen con sus solicitudes activas, en revisión y resueltas.
- Consulta el listado completo y abre el detalle de cada solicitud para ver su estado.

**Para el administrador**

- Entra en `/admin` con una cuenta de administrador.
- Ve todas las solicitudes de todos los estudiantes.
- Cambia el estado de cada solicitud. Es el único rol que puede hacerlo.
- Gestiona la biblioteca de medios, carpetas y etiquetas.

## Flujo de una solicitud

```
Enviada  →  En revisión  →  En proceso  →  Resuelta
```

Toda solicitud nace como **Enviada**. El estudiante no puede modificarla después de crearla; solo el administrador avanza el estado.

| Dato | Reglas |
|---|---|
| Título | 5 a 120 caracteres |
| Descripción | 10 a 1.500 caracteres |
| Ubicación | 3 a 160 caracteres (edificio, planta o zona) |
| Categoría | Mobiliario, Iluminación, Limpieza, Accesibilidad u Otro |
| Imagen | Opcional. JPG, PNG o WEBP, máximo 5 MB |

## Stack

- **Next.js 16** (App Router) y **React 19**
- **Payload CMS 4 (beta)**: panel admin, API REST y GraphQL, autenticación y permisos
- **PostgreSQL** con `@payloadcms/db-vercel-postgres`
- **Vercel Blob** para almacenar imágenes (opcional en local)
- **Tailwind CSS 4** y TypeScript
- Plugin MCP de Payload habilitado (`@payloadcms/plugin-mcp`)

## Arquitectura

La app tiene dos zonas dentro del mismo proyecto Next.js:

- **Sitio público** (`src/app/(frontend)`): una sola página. Si no hay sesión muestra el login/registro; si la hay, el panel del estudiante (`CampusApp.tsx`). La creación de cuenta, el login, el logout y el envío de solicitudes son *server actions* en `actions.ts`.
- **Panel y API** (`src/app/(payload)`): el admin de Payload en `/admin` y los endpoints en `/api` y `/api/graphql`.

Hay **dos sistemas de sesión separados**:

| | Estudiantes (`users`) | Administradores (`admins`) |
|---|---|---|
| Dónde inician sesión | En el sitio (`/`) | En `/admin` |
| Cookie | `app-session` (httpOnly, 7 días) | La propia de Payload |
| Acceso al panel admin | No | Sí |

## Modelo de datos

| Colección | Para qué sirve | Quién puede hacer qué |
|---|---|---|
| `admins` | Cuentas del equipo | Solo ellos leen, editan y borran. Nadie puede crear admins por la API. |
| `users` | Estudiantes | Cualquiera puede registrarse. Cada uno lee y edita solo su perfil. 5 intentos fallidos bloquean la cuenta 10 minutos. |
| `requests` | Solicitudes | Solo estudiantes crean. Cada estudiante lee solo las suyas. El admin lee todas, edita y borra. |
| `request-media` | Fotos de las solicitudes | Solo estudiantes suben. Dueño o admin editan y borran. Lectura pública por URL. |
| `media`, `folders`, `tags` | Biblioteca general del admin | Lectura pública de `media`. |

Campos de `requests`: `title`, `description`, `category`, `location`, `status`, `image`, `owner`. El campo `owner` se fija automáticamente al estudiante autenticado y no se puede cambiar.

## Ejecución

Todo el código está en `app/`.

### Variables de entorno (`.env`)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PAYLOAD_SECRET` | Sí | Secreto largo y aleatorio para firmar sesiones. |
| `DATABASE_URL` | Sí | Cadena de conexión **PostgreSQL**. |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública del sitio (`http://localhost:3000` en local). |
| `FIGMA_PUBLIC_URL` | Sí | Origen al que redirige el logout del admin. |
| `BLOB_READ_WRITE_TOKEN` | No | Token de Vercel Blob. Sin él, el almacenamiento en Blob queda desactivado. |

> `DATABASE_URL` debe ser de Postgres. El valor `file:./campus.db` del `.env.example` corresponde a SQLite y no funciona con la configuración actual.

### Comandos

```bash
npm install --legacy-peer-deps   # la beta de Payload exige este flag
npm run dev                      # desarrollo en http://localhost:3000
npm run build                    # build de producción
npm run start                    # sirve el build
npm run generate:types           # regenera src/payload-types.ts
npm run generate:importmap       # regenera el import map del admin
```

### Primer uso

1. Abre `/admin`: la primera vez pide crear la cuenta de administrador.
2. Los estudiantes se registran desde la página principal.

### Despliegue

Pensada para Vercel: Root Directory `app`, Install Command `npm install --legacy-peer-deps` y las variables de entorno anteriores.

## Estructura del código

```
app/
├── src/
│   ├── app/
│   │   ├── (frontend)/      # Página pública, server actions, estilos, layout
│   │   └── (payload)/       # Admin y API de Payload
│   ├── collections/         # Admins, Users, Requests, RequestMedia, Media, Folders, Tags
│   ├── components/
│   │   └── CampusApp.tsx    # Login, registro, dashboard, formulario y detalle
│   ├── lib/
│   │   ├── app-auth.ts      # Sesión de estudiantes (cookie app-session)
│   │   ├── payload.ts       # Cliente de Payload para el servidor
│   │   └── make-*.ts(x)     # Ajustes del sitio (título, analytics, scripts)
│   ├── payload.config.ts    # Configuración central
│   └── payload-types.ts     # Tipos generados (no editar a mano)
├── .figma/make/site.json    # Título, descripción e idioma del sitio
└── next.config.mjs
```

## Limitaciones conocidas

- El registro está abierto a cualquier correo; no se valida que sea del dominio de la universidad.
- No hay notificaciones: el estudiante debe entrar a la app para ver si cambió el estado.
- El panel del estudiante muestra las 100 solicitudes más recientes y no tiene filtros ni búsqueda.
- Las URLs de las imágenes de solicitudes son de lectura pública para quien las conozca.
- Un estudiante no puede editar ni cancelar una solicitud una vez enviada.