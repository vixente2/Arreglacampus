'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useRef, useState, useTransition } from 'react'
import {
  createRequestAction,
  loginAction,
  logoutAction,
  registerAction,
  type ActionState,
} from '@/app/(frontend)/actions'

const initialState: ActionState = { success: false, message: '' }

export type CampusRequest = {
  id: string
  title: string
  description: string
  category: 'furniture' | 'lighting' | 'cleaning' | 'accessibility' | 'other'
  location: string
  status: 'submitted' | 'review' | 'progress' | 'solved'
  createdAt: string
  image?: {
    url: string
    alt: string
    width: number
    height: number
  }
}

type CampusUser = {
  name: string
  email: string
}

const categoryLabels = {
  furniture: 'Mobiliario',
  lighting: 'Iluminación',
  cleaning: 'Limpieza',
  accessibility: 'Accesibilidad',
  other: 'Otro',
} as const

const categoryInitials = {
  furniture: 'MB',
  lighting: 'IL',
  cleaning: 'LP',
  accessibility: 'AC',
  other: 'OT',
} as const

const statusLabels = {
  submitted: 'Enviada',
  review: 'En revisión',
  progress: 'En proceso',
  solved: 'Resuelta',
} as const

function CampusMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path d="M20 4.75 4.75 12.5 20 20.25l15.25-7.75L20 4.75Z" fill="currentColor" />
      <path
        d="M9.5 17v9.15c0 2.2 4.7 5.1 10.5 5.1s10.5-2.9 10.5-5.1V17L20 22.35 9.5 17Z"
        fill="currentColor"
        opacity=".72"
      />
      <path d="M35.25 13v11" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="35.25" cy="26.5" r="2" fill="currentColor" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="m7.5 4.5 5.5 5.5-5.5 5.5M3 10h9.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m3.5 10.5 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function RequestIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M6.5 3.5h8l3 3v14h-11v-17Zm8 0v3h3M9.5 11h5m-5 3.5h5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d="M10 4v12M4 10h12"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M4 7.5h3l1.4-2h7.2l1.4 2h3a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 4 7.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="13.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function AuthForm() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initialState)
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerAction,
    initialState,
  )
  const activeState = mode === 'login' ? loginState : registerState
  const pending = loginPending || registerPending

  useEffect(() => {
    if (activeState.success) router.refresh()
  }, [activeState.success, router])

  return (
    <main className="login-shell">
      <section className="brand-panel" aria-label="Bienvenida a ArreglaCampus">
        <div className="brand-top">
          <span className="brand-mark">
            <CampusMark />
          </span>
          <span className="brand-name">ArreglaCampus</span>
        </div>
        <div className="brand-content">
          <p className="eyebrow">Tu campus, mejor cada día</p>
          <h1>
            Cuidar lo que
            <br />
            compartimos.
          </h1>
          <p className="brand-copy">
            Reporta incidencias, sigue su progreso y forma parte del cambio en tu comunidad
            universitaria.
          </p>
          <div className="impact-card">
            <div className="avatars" aria-hidden="true">
              <span>LM</span>
              <span>JR</span>
              <span>AS</span>
            </div>
            <p>
              <strong>+2.400 estudiantes</strong>
              <span>ya mejoran su campus</span>
            </p>
          </div>
        </div>
        <p className="brand-footer">Una iniciativa para una universidad más viva.</p>
        <span className="orb orb-one" aria-hidden="true" />
        <span className="orb orb-two" aria-hidden="true" />
      </section>

      <section className="form-panel">
        <div className="mobile-brand">
          <span className="brand-mark">
            <CampusMark />
          </span>
          <span className="brand-name">ArreglaCampus</span>
        </div>
        <div className="form-wrap">
          <header>
            <p className="eyebrow form-eyebrow">Área personal</p>
            <h2>{mode === 'login' ? 'Qué bueno verte' : 'Crea tu cuenta'}</h2>
            <p>
              {mode === 'login'
                ? 'Accede para revisar y gestionar tus reportes.'
                : 'Empieza a cuidar y mejorar tu campus.'}
            </p>
          </header>

          <form action={mode === 'login' ? loginFormAction : registerFormAction}>
            {mode === 'register' && (
              <div className="field">
                <label htmlFor="register-name">Nombre completo</label>
                <input
                  id="register-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Lucía Vega"
                  required
                />
              </div>
            )}
            <div className="field">
              <label htmlFor={emailId}>Correo institucional</label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@universidad.edu"
                required
              />
            </div>
            <div className="field">
              <label htmlFor={passwordId}>Contraseña</label>
              <div className="password-input">
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'login' ? 'Introduce tu contraseña' : 'Mínimo 8 caracteres'}
                  required
                />
                <button
                  className="visibility-button"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
            <button className="submit-button" type="submit" disabled={pending}>
              <span>
                {pending ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </span>
              <ArrowIcon />
            </button>
            <p className="form-message error-message" aria-live="polite">
              {activeState.message}
            </p>
          </form>

          <p className="help-copy">
            {mode === 'login' ? '¿Aún no tienes acceso? ' : '¿Ya tienes cuenta? '}
            <button
              className="text-button"
              type="button"
              onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
            >
              {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
          <aside className="demo-access" aria-label="Datos de acceso de demostración">
            <strong>Cuenta de demostración</strong>
            <span>demo@arreglacampus.es</span>
            <span>CampusDemo2025!</span>
          </aside>
        </div>
      </section>
    </main>
  )
}

function RequestForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createRequestAction, initialState)
  const [preview, setPreview] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onClose()
    }
  }, [onClose, router, state.success])

  function previewFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(String(reader.result))
      setFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  return (
    <form className="request-composer" action={formAction}>
      <div className="composer-heading">
        <div>
          <p className="eyebrow form-eyebrow">Nueva solicitud</p>
          <h2>¿Qué podemos arreglar?</h2>
        </div>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div className="request-fields">
        <label>
          Título
          <input
            name="title"
            required
            minLength={5}
            maxLength={120}
            placeholder="Ej. Farola apagada"
          />
        </label>
        <label>
          Categoría
          <select name="category" required defaultValue="">
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ubicación
          <input
            name="location"
            required
            minLength={3}
            maxLength={160}
            placeholder="Edificio, planta o zona"
          />
        </label>
        <label className="description-field">
          Cuéntanos qué ocurre
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={1500}
            placeholder="Describe el problema con el mayor detalle posible…"
          />
        </label>
      </div>
      <div className="image-field">
  <span className="image-field-label">Añadir imagen (opcional)</span>
  {preview && (
    <div className="image-preview">
      <Image
        src={preview}
        alt="Vista previa de la incidencia"
        width={88}
        height={88}
        unoptimized
      />
      <div>
        <strong>{fileName}</strong>
        <span>Imagen lista para adjuntar</span>
      </div>
      <button
        type="button"
        onClick={() => {
          setPreview('')
          setFileName('')
          if (fileInput.current) fileInput.current.value = ''
        }}
      >
        Eliminar
      </button>
    </div>
  )}
  <label className="image-uploader" style={{ display: preview ? 'none' : undefined }}>
    <UploadIcon />
    <span>
      <strong>Sube una foto del problema</strong>
      <small>JPG, PNG o WEBP · Máximo 5 MB</small>
    </span>
    <span className="upload-action">Elegir imagen</span>
    <input
      ref={fileInput}
      name="image"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onChange={(event) => previewFile(event.target.files?.[0])}
    />
  </label>
</div>
      <p className="form-message error-message" aria-live="polite">
        {state.message}
      </p>
      <button className="send-request-button" type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar solicitud'}
        <ArrowIcon />
      </button>
    </form>
  )
}

function RequestRow({ request, onOpen }: { request: CampusRequest; onOpen: () => void }) {
  return (
    <button className="request-row request-row-button" type="button" onClick={onOpen}>
      <span className={`request-symbol ${request.category}`}>
        {categoryInitials[request.category]}
      </span>
      <span className="request-info">
        <strong>{request.title}</strong>
        <span>
          {request.location} ·{' '}
          {new Intl.DateTimeFormat('es', {
            day: 'numeric',
            month: 'short',
          }).format(new Date(request.createdAt))}
        </span>
      </span>
      <span className={`status-pill ${request.status}`}>{statusLabels[request.status]}</span>
    </button>
  )
}

function RequestDetail({ request, onClose }: { request: CampusRequest; onClose: () => void }) {
  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className="request-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="detail-header">
          <span className={`status-pill ${request.status}`}>{statusLabels[request.status]}</span>
          <button type="button" onClick={onClose} aria-label="Cerrar detalle">
            ×
          </button>
        </div>
        {request.image && (
          <div className="detail-image">
            <Image
              src={request.image.url}
              alt={request.image.alt}
              width={request.image.width}
              height={request.image.height}
            />
          </div>
        )}
        <p className="eyebrow form-eyebrow">{categoryLabels[request.category]}</p>
        <h2 id="request-detail-title">{request.title}</h2>
        <p className="detail-description">{request.description}</p>
        <dl className="detail-meta">
          <div>
            <dt>Ubicación</dt>
            <dd>{request.location}</dd>
          </div>
          <div>
            <dt>Creada</dt>
            <dd>
              {new Intl.DateTimeFormat('es', {
                dateStyle: 'long',
                timeStyle: 'short',
              }).format(new Date(request.createdAt))}
            </dd>
          </div>
          <div>
            <dt>Referencia</dt>
            <dd>#{request.id.slice(-8).toUpperCase()}</dd>
          </div>
        </dl>
      </article>
    </div>
  )
}

function Dashboard({ user, requests }: { user: CampusUser; requests: CampusRequest[] }) {
  const router = useRouter()
  const [view, setView] = useState<'home' | 'requests'>('home')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<CampusRequest | null>(null)
  const [loggingOut, startLogout] = useTransition()
  const active = requests.filter((request) => request.status !== 'solved').length
  const review = requests.filter((request) => request.status === 'review').length
  const solved = requests.filter((request) => request.status === 'solved').length
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function logout() {
    startLogout(async () => {
      await logoutAction()
      router.refresh()
    })
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-mark">
            <CampusMark />
          </span>
          <span className="brand-name">ArreglaCampus</span>
        </div>
        <nav className="side-nav" aria-label="Navegación principal">
          <button
            className={`nav-item ${view === 'home' ? 'active' : ''}`}
            type="button"
            onClick={() => setView('home')}
          >
            <HomeIcon />
            <span>Inicio</span>
          </button>
          <button
            className={`nav-item ${view === 'requests' ? 'active' : ''}`}
            type="button"
            onClick={() => setView('requests')}
          >
            <RequestIcon />
            <span>Mis solicitudes</span>
            <span className="nav-count">{requests.length}</span>
          </button>
        </nav>
        <div className="sidebar-profile">
          <span className="profile-avatar">{initials}</span>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button type="button" onClick={logout} disabled={loggingOut}>
            Salir
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="mobile-dashboard-brand">
            <span className="brand-mark">
              <CampusMark />
            </span>
            <span className="brand-name">ArreglaCampus</span>
          </div>
          <div className="header-copy">
            <p>
              {new Intl.DateTimeFormat('es', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date())}
            </p>
            <h1>{view === 'home' ? `Hola, ${user.name.split(' ')[0]}` : 'Mis solicitudes'}</h1>
            <span>
              {view === 'home'
                ? 'Este es el estado de tus solicitudes en el campus.'
                : 'Consulta el detalle y el progreso de todo lo que has reportado.'}
            </span>
          </div>
          <button className="new-request-button" type="button" onClick={() => setFormOpen(true)}>
            <PlusIcon />
            <span>Hacer solicitud</span>
          </button>
        </header>

        {formOpen && <RequestForm onClose={() => setFormOpen(false)} />}

        {view === 'home' && (
          <div className="summary-grid">
            <article className="summary-card featured">
              <div>
                <span className="summary-label">Solicitudes activas</span>
                <strong>{String(active).padStart(2, '0')}</strong>
              </div>
              <span className="summary-trend">{requests.length} en total</span>
            </article>
            <article className="summary-card">
              <span className="summary-icon pending">
                <RequestIcon />
              </span>
              <div>
                <span className="summary-label">En revisión</span>
                <strong>{String(review).padStart(2, '0')}</strong>
              </div>
            </article>
            <article className="summary-card">
              <span className="summary-icon solved">✓</span>
              <div>
                <span className="summary-label">Resueltas</span>
                <strong>{String(solved).padStart(2, '0')}</strong>
              </div>
            </article>
          </div>
        )}

        <section className="recent-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow form-eyebrow">Seguimiento</p>
              <h2>{view === 'home' ? 'Solicitudes recientes' : 'Todas las solicitudes'}</h2>
            </div>
            {view === 'home' && requests.length > 3 && (
              <button type="button" onClick={() => setView('requests')}>
                Ver todas
              </button>
            )}
          </div>
          <div className="request-list">
            {requests.length === 0 ? (
              <div className="empty-requests">
                <span>
                  <RequestIcon />
                </span>
                <h3>Aún no tienes solicitudes</h3>
                <p>Cuando encuentres algo que mejorar en tu campus, repórtalo desde aquí.</p>
                <button type="button" onClick={() => setFormOpen(true)}>
                  Hacer mi primera solicitud
                </button>
              </div>
            ) : (
              (view === 'home' ? requests.slice(0, 3) : requests).map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  onOpen={() => setSelected(request)}
                />
              ))
            )}
          </div>
        </section>
      </section>

      <nav className="mobile-nav" aria-label="Navegación móvil">
        <button
          className={view === 'home' ? 'active' : ''}
          type="button"
          onClick={() => setView('home')}
        >
          <HomeIcon />
          <span>Inicio</span>
        </button>
        <button
          className="mobile-request-action"
          type="button"
          onClick={() => setFormOpen(true)}
          aria-label="Hacer solicitud"
        >
          <PlusIcon />
        </button>
        <button
          className={view === 'requests' ? 'active' : ''}
          type="button"
          onClick={() => setView('requests')}
        >
          <RequestIcon />
          <span>Solicitudes</span>
        </button>
      </nav>

      {selected && <RequestDetail request={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}

export function CampusApp({
  user,
  requests,
}: {
  user: CampusUser | null
  requests: CampusRequest[]
}) {
  return user ? <Dashboard user={user} requests={requests} /> : <AuthForm />
}
