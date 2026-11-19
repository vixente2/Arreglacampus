import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function ReportsView(props: {
  locale?: string
  i18n: { translations: Record<string, string> }
}) {
  const payload = await getPayload({ config })

  // Obtener todas las solicitudes
  const result = await payload.find({
    collection: 'requests',
    limit: 1000,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const requests = result.docs as any[]

  // Calcular métricas
  const totalRequests = requests.length
  const statusCounts = {
    submitted: requests.filter((r) => r.status === 'submitted').length,
    review: requests.filter((r) => r.status === 'review').length,
    progress: requests.filter((r) => r.status === 'progress').length,
    solved: requests.filter((r) => r.status === 'solved').length,
  }

  const categoryLabels = {
    furniture: 'Mobiliario',
    lighting: 'Iluminación',
    cleaning: 'Limpieza',
    accessibility: 'Accesibilidad',
    other: 'Otro',
  }

  const statusLabels = {
    submitted: 'Enviada',
    review: 'En revisión',
    progress: 'En proceso',
    solved: 'Resuelta',
  }

  const totalSolved = statusCounts.solved
  const resolutionRate = totalRequests > 0 ? Math.round((totalSolved / totalRequests) * 100) : 0

  // Calcular tiempo promedio de resolución por categoría
  const categoryStats = Object.entries(categoryLabels).map(([key, label]) => {
    const catRequests = requests.filter((r) => r.category === key && r.status === 'solved')
    if (catRequests.length === 0) return { category: label, count: 0, avgDays: 0 }

    const totalDays = catRequests.reduce((sum: number, r: any) => {
      const created = new Date(r.createdAt)
      const now = new Date()
      return sum + (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    }, 0)

    return {
      category: label,
      count: catRequests.length,
      avgDays: Math.round(totalDays / catRequests.length),
    }
  })

  const categoryCounts = Object.fromEntries(
    Object.entries(categoryLabels).map(([key]) => [key, requests.filter((r) => r.category === key).length])
  )

  return (
    <div style={{ padding: '1.5rem' }}>
      <style>{`
        .section { margin-bottom: 2rem; }
        .section h3 { margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .summary-card { background: #f9f9f9; padding: 1rem; border-radius: 4px; }
        .summary-card.featured { background: #0070c8; color: white; }
        .summary-card.featured strong { color: white; }
        .summary-label { font-size: 0.85rem; color: #666; }
        .summary-card strong { font-size: 1.5rem; font-weight: 600; }
        .status-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
        .status-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: #f9f9f9; border-radius: 4px; }
        .status-item strong { margin-left: auto; }
        .status-pill { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; }
        .status-pill.submitted { background: #fee; color: #c00; }
        .status-pill.review { background: #fff3cd; color: #856404; }
        .status-pill.progress { background: #d1ecf1; color: #0c5460; }
        .status-pill.solved { background: #d4edda; color: #155724; }
        .category-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
        .category-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #f9f9f9; border-radius: 4px; }
        .category-bar { flex: 1; height: 8px; background: #e5e5e5; border-radius: 4px; overflow: hidden; }
        .category-bar-fill { height: 100%; background: #0070c8; }
        .category-count { width: 50px; text-align: right; font-weight: 500; }
        .btn-download { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f5f5f5; color: #333; text-decoration: none; border-radius: 4px; font-size: 0.9rem; }
        .btn-download:hover { background: #e5e5e5; }
        .reports-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .reports-table th,
        .reports-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; }
        .reports-table th { background: #f9f9f9; font-weight: 600; }
      `}</style>

      <h1>Informes y Métricas</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Estadísticas de incidencias del campus
      </p>

      {/* Métricas generales */}
      <section className="section">
        <h3>Métricas generales</h3>
        <div className="summary-grid">
          <article className="summary-card featured">
            <div>
              <span className="summary-label">Total de solicitudes</span>
              <strong>
                {String(totalRequests).padStart(2, '0')}
              </strong>
            </div>
          </article>
          <article className="summary-card">
            <span className="summary-label">Enviadas</span>
            <strong>
              {String(totalRequests - totalSolved).padStart(2, '0')}
            </strong>
          </article>
          <article className="summary-card">
            <span className="summary-label">Resueltas</span>
            <strong>
              {String(totalSolved).padStart(2, '0')}
            </strong>
          </article>
          <article className="summary-card">
            <span className="summary-label">Tasa de resolución</span>
            <strong>
              {resolutionRate}%
            </strong>
          </article>
        </div>
      </section>

      {/* Estado de solicitudes */}
      <section className="section">
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}
        >
          <h3 style={{ margin: 0 }}>Estado de solicitudes</h3>
          <a href="/api/admin/reports/export" className="btn-download" download>
            📥 Descargar CSV
          </a>
        </div>

        <div className="status-grid">
          {Object.entries(statusCounts).map(([key, count]) => (
            <div key={key} className="status-item">
              <span className={`status-pill ${key}`}>{statusLabels[key as keyof typeof statusLabels]}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="section">
        <h3>Incidencias por categoría</h3>
        <div className="category-grid">
          {Object.entries(categoryCounts).map(([key, count]) => (
            <div key={key} className="category-item">
              <span style={{ fontWeight: 500 }}>{categoryLabels[key as keyof typeof categoryLabels]}</span>
              <div className="category-bar">
                <div
                  className="category-bar-fill"
                  style={{ width: `${totalRequests > 0 ? (count as number) / totalRequests * 100 : 0}%` }}
                />
              </div>
              <span className="category-count">{count as number}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tiempo promedio de resolución */}
      <section className="section">
        <h3>Tiempo promedio de resolución por categoría</h3>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th># Resueltas</th>
              <th>Promedio días</th>
            </tr>
          </thead>
          <tbody>
            {categoryStats.map((stat, idx) => (
              <tr key={idx}>
                <td>{stat.category}</td>
                <td>{stat.count}</td>
                <td>{stat.avgDays > 0 ? `${stat.avgDays} días` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Solicitudes recientes */}
      <section className="section">
        <h3>Últimas 10 solicitudes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requests.slice(0, 10).map((request: any) => (
            <div
              key={request.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: '#f9f9f9',
                borderRadius: '4px',
              }}
            >
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#e5e5e5',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                }}
              >
                {request.category.substring(0, 2).toUpperCase()}
              </span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{request.title}</strong>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  {request.location} · {new Date(request.createdAt).toLocaleDateString('es')}
                </span>
              </div>
              <span className={`status-pill ${request.status}`}>
                {statusLabels[request.status as keyof typeof statusLabels]}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}