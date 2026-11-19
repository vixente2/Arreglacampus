import { getPayload } from 'payload'
import config from '@payload-config'
import { AdminWrapper } from './AdminWrapper.server'

export async function ReportsView() {
  const payload = await getPayload({ config })

  const allRequests = await payload.find({
    collection: 'requests',
    limit: 1000,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const requests = allRequests.docs

  const statusLabels = {
    submitted: 'Enviada',
    review: 'En revisión',
    progress: 'En proceso',
    solved: 'Resuelta',
  }

  const categoryLabels = {
    furniture: 'Mobiliario',
    lighting: 'Iluminación',
    cleaning: 'Limpieza',
    accessibility: 'Accesibilidad',
    other: 'Otro',
  }

  const totalRequests = requests.length
  const statusCounts = {
    submitted: requests.filter((r) => r.status === 'submitted').length,
    review: requests.filter((r) => r.status === 'review').length,
    progress: requests.filter((r) => r.status === 'progress').length,
    solved: requests.filter((r) => r.status === 'solved').length,
  }

  const categoryCounts = {
    furniture: requests.filter((r) => r.category === 'furniture').length,
    lighting: requests.filter((r) => r.category === 'lighting').length,
    cleaning: requests.filter((r) => r.category === 'cleaning').length,
    accessibility: requests.filter((r) => r.category === 'accessibility').length,
    other: requests.filter((r) => r.category === 'other').length,
  }

  const pending = totalRequests - statusCounts.solved
  const resolutionRate =
    totalRequests > 0 ? Math.round((statusCounts.solved / totalRequests) * 100) : 0

  const categoryStats = Object.entries(categoryLabels).map(([key, label]) => {
    const solved = requests.filter((r) => r.category === key && r.status === 'solved')
    if (solved.length === 0) return { category: label, count: 0, avgDays: 0 }

    const now = new Date()
    const totalDays = solved.reduce((sum, r) => {
      const created = new Date(r.createdAt)
      return sum + (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    }, 0)

    return {
      category: label,
      count: solved.length,
      avgDays: Math.round(totalDays / solved.length),
    }
  })

  const maxCategory = Math.max(1, ...Object.values(categoryCounts))

  return (
    <AdminWrapper title="Informes y métricas" description="Estadísticas de incidencias del campus">
      <div className="rp">
        <div className="rp-toolbar">
          <span className="rp-toolbar-note">
            Datos de las últimas {Math.min(totalRequests, 1000)} solicitudes
          </span>
          <a href="/api/admin/reports/export" className="rp-button" download>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Descargar CSV
          </a>
        </div>

        <div className="rp-stats">
          <article className="rp-stat">
            <span className="rp-stat-label">Total de solicitudes</span>
            <strong className="rp-stat-value">{totalRequests}</strong>
          </article>
          <article className="rp-stat">
            <span className="rp-stat-label">Pendientes</span>
            <strong className="rp-stat-value">{pending}</strong>
          </article>
          <article className="rp-stat">
            <span className="rp-stat-label">Resueltas</span>
            <strong className="rp-stat-value">{statusCounts.solved}</strong>
          </article>
          <article className="rp-stat">
            <span className="rp-stat-label">Tasa de resolución</span>
            <strong className="rp-stat-value">{resolutionRate}%</strong>
            <div className="rp-meter" aria-hidden="true">
              <div className="rp-meter-fill" style={{ width: `${resolutionRate}%` }} />
            </div>
          </article>
        </div>

        <section className="rp-card">
          <h2 className="rp-card-title">Estado de solicitudes</h2>
          <div className="rp-status-grid">
            {Object.entries(statusCounts).map(([key, count]) => (
              <div key={key} className="rp-status-item">
                <span className={`rp-pill rp-pill-${key}`}>
                  {statusLabels[key as keyof typeof statusLabels]}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rp-card">
          <h2 className="rp-card-title">Incidencias por categoría</h2>
          <div className="rp-bars">
            {Object.entries(categoryCounts).map(([key, count]) => (
              <div key={key} className="rp-bar-row">
                <span className="rp-bar-label">
                  {categoryLabels[key as keyof typeof categoryLabels]}
                </span>
                <div className="rp-bar-track">
                  <div className="rp-bar-fill" style={{ width: `${(count / maxCategory) * 100}%` }} />
                </div>
                <span className="rp-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rp-card">
          <h2 className="rp-card-title">Tiempo promedio de resolución</h2>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="rp-num">Resueltas</th>
                  <th className="rp-num">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((stat) => (
                  <tr key={stat.category}>
                    <td>{stat.category}</td>
                    <td className="rp-num">{stat.count}</td>
                    <td className="rp-num">{stat.avgDays > 0 ? `${stat.avgDays} días` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rp-card">
          <h2 className="rp-card-title">Solicitudes recientes</h2>
          {requests.length === 0 ? (
            <p className="rp-empty">Todavía no hay solicitudes.</p>
          ) : (
            <ul className="rp-list">
              {requests.slice(0, 10).map((request) => (
                <li key={request.id} className="rp-list-item">
                  <div className="rp-list-main">
                    <strong>{request.title}</strong>
                    <span>
                      {categoryLabels[request.category as keyof typeof categoryLabels] ??
                        'Sin categoría'}
                      {' · '}
                      {request.location}
                      {' · '}
                      {new Date(request.createdAt).toLocaleDateString('es')}
                    </span>
                  </div>
                  <span className={`rp-pill rp-pill-${request.status}`}>
                    {statusLabels[request.status as keyof typeof statusLabels] ?? request.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <style>{`
        .rp {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: var(--color-text, inherit);
        }
        .rp-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .rp-toolbar-note {
          font-size: 0.85rem;
          color: var(--color-text-secondary, inherit);
        }
        .rp-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          color: var(--color-text-onbrand, #fff);
          background: var(--color-bg-brand, #2563eb);
          border: 1px solid transparent;
          transition: background 0.15s ease;
        }
        .rp-button:hover {
          background: var(--color-bg-brand-hover, #1d4ed8);
        }
        .rp-button:focus-visible {
          outline: 2px solid var(--color-border-selected, currentColor);
          outline-offset: 2px;
        }

        .rp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .rp-stat {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 1.1rem 1.25rem;
          background: var(--color-bg-secondary, rgba(128, 128, 128, 0.08));
          border: 1px solid var(--color-border, rgba(128, 128, 128, 0.25));
          border-radius: 10px;
        }
        .rp-stat-label {
          font-size: 0.8rem;
          color: var(--color-text-secondary, inherit);
        }
        .rp-stat-value {
          font-size: 2rem;
          line-height: 1.1;
          font-weight: 600;
          color: var(--color-text, inherit);
          font-variant-numeric: tabular-nums;
        }
        .rp-meter {
          height: 6px;
          margin-top: 0.4rem;
          border-radius: 999px;
          overflow: hidden;
          background: var(--color-bg-tertiary, rgba(128, 128, 128, 0.2));
        }
        .rp-meter-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--color-bg-brand, #2563eb);
        }

        .rp-card {
          padding: 1.25rem 1.4rem;
          background: var(--color-bg-secondary, rgba(128, 128, 128, 0.08));
          border: 1px solid var(--color-border, rgba(128, 128, 128, 0.25));
          border-radius: 10px;
        }
        .rp-card-title {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text, inherit);
        }

        .rp-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 0.75rem;
        }
        .rp-status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.7rem 0.9rem;
          background: var(--color-bg, transparent);
          border: 1px solid var(--color-border, rgba(128, 128, 128, 0.25));
          border-radius: 8px;
        }
        .rp-status-item strong {
          font-size: 1.1rem;
          font-variant-numeric: tabular-nums;
        }

        .rp-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          --pill: #6b7280;
          color: var(--pill);
          background: color-mix(in srgb, var(--pill) 16%, transparent);
          border: 1px solid color-mix(in srgb, var(--pill) 35%, transparent);
        }
        .rp-pill-submitted { --pill: #3b82f6; }
        .rp-pill-review { --pill: #d97706; }
        .rp-pill-progress { --pill: #8b5cf6; }
        .rp-pill-solved { --pill: #16a34a; }
        [data-theme='dark'] .rp-pill-submitted { --pill: #60a5fa; }
        [data-theme='dark'] .rp-pill-review { --pill: #fbbf24; }
        [data-theme='dark'] .rp-pill-progress { --pill: #a78bfa; }
        [data-theme='dark'] .rp-pill-solved { --pill: #4ade80; }

        .rp-bars {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .rp-bar-row {
          display: grid;
          grid-template-columns: 130px 1fr 40px;
          align-items: center;
          gap: 0.9rem;
        }
        .rp-bar-label {
          font-size: 0.9rem;
          color: var(--color-text, inherit);
        }
        .rp-bar-track {
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
          background: var(--color-bg-tertiary, rgba(128, 128, 128, 0.2));
        }
        .rp-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--color-bg-brand, #2563eb);
        }
        .rp-bar-count {
          text-align: right;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        .rp-table-wrap {
          overflow-x: auto;
        }
        .rp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .rp-table th,
        .rp-table td {
          padding: 0.7rem 0.5rem;
          text-align: left;
          border-bottom: 1px solid var(--color-border, rgba(128, 128, 128, 0.25));
        }
        .rp-table th {
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-text-secondary, inherit);
        }
        .rp-table tbody tr:last-child td {
          border-bottom: none;
        }
        .rp-num {
          text-align: right !important;
          font-variant-numeric: tabular-nums;
        }

        .rp-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .rp-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.8rem 0;
          border-bottom: 1px solid var(--color-border, rgba(128, 128, 128, 0.25));
        }
        .rp-list-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .rp-list-main {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .rp-list-main strong {
          font-size: 0.95rem;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rp-list-main span {
          font-size: 0.8rem;
          color: var(--color-text-secondary, inherit);
        }
        .rp-empty {
          margin: 0;
          font-size: 0.9rem;
          color: var(--color-text-secondary, inherit);
        }

        @media (max-width: 640px) {
          .rp-bar-row {
            grid-template-columns: 100px 1fr 32px;
          }
          .rp-list-item {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </AdminWrapper>
  )
}
