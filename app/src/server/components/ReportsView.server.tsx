import { getPayload } from 'payload'
import config from '@payload-config'
import { AdminWrapper } from './AdminWrapper.server'

export async function ReportsView(props: {
  locale?: string
  i18n: { translations: Record<string, string> }
}) {
  const payload = await getPayload({ config })

  // Obtener métricas de solicitudes
  const requestsResult = await payload.find({
    collection: 'requests',
    limit: 0,
    overrideAccess: true,
  })

  const allRequests = await payload.find({
    collection: 'requests',
    limit: 1000,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const requests = allRequests.docs

  // Calcular métricas
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

  // Calcular promedio de resolución por categoría
  const categoryStats = Object.entries(categoryLabels).map(([key, label]) => {
    const catRequests = requests.filter((r) => r.category === key && r.status === 'solved')
    if (catRequests.length === 0) return { category: label, count: 0, avgDays: 0 }

    const totalDays = catRequests.reduce((sum, r) => {
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

  return (
    <AdminWrapper title="Informes y Métricas" description="Estadísticas de incidencias del campus">
      <div className="reports-dashboard">
        {/* Resumen general */}
        <section className="reports-section">
          <h3>Métricas generales</h3>
          <div className="summary-grid">
            <article className="summary-card featured">
              <div>
                <span className="summary-label">Total de solicitudes</span>
                <strong>{String(totalRequests).padStart(2, '0')}</strong>
              </div>
            </article>
            <article className="summary-card">
              <span className="summary-icon pending">📋</span>
              <div>
                <span className="summary-label">Enviadas</span>
                <strong>{String(totalRequests - statusCounts.solved).padStart(2, '0')}</strong>
              </div>
            </article>
            <article className="summary-card">
              <span className="summary-icon solved">✓</span>
              <div>
                <span className="summary-label">Resueltas</span>
                <strong>{String(statusCounts.solved).padStart(2, '0')}</strong>
              </div>
            </article>
            <article className="summary-card">
              <span className="summary-icon solved">%✓</span>
              <div>
                <span className="summary-label">Tasa de resolución</span>
                <strong>
                  {totalRequests > 0 ? Math.round((statusCounts.solved / totalRequests) * 100) : 0}%
                </strong>
              </div>
            </article>
          </div>
        </section>

        {/* Estados */}
        <section className="reports-section">
          <div className="section-heading">
            <h3>Estado de solicitudes</h3>
            <a href="/api/admin/reports/export" className="btn btn-download" download>
   Descargar CSV
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
        <section className="reports-section">
          <h3>Incidencias por categoría</h3>
          <div className="category-grid">
            {Object.entries(categoryCounts).map(([key, count]) => (
              <div key={key} className="category-item">
                <span className="category-label">{categoryLabels[key as keyof typeof categoryLabels]}</span>
                <div className="category-bar">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${totalRequests > 0 ? (count / totalRequests) * 100 : 0}%` }}
                  />
                </div>
                <span className="category-count">{count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Estadísticas por categoría */}
        <section className="reports-section">
          <h3>Tiempo promedio de resolución por categoría</h3>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th># Incidencias resueltas</th>
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
        <section className="reports-section">
          <h3>Solicitudes recientes</h3>
          <div className="request-list-small">
            {requests.slice(0, 10).map((request) => (
              <div key={request.id} className="request-row-small">
                <span className={`request-symbol ${request.category}`}>
  {request.category ? String(request.category).substring(0, 2).toUpperCase() : '--'}
</span>
                <div className="request-info">
                  <strong>{request.title}</strong>
                  <span>{request.location} · {new Date(request.createdAt).toLocaleDateString('es')}</span>
                </div>
                <span className={`status-pill ${request.status}`}>{statusLabels[request.status as keyof typeof statusLabels]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .reports-dashboard {
          padding: 1rem;
        }
        .reports-section {
          margin-bottom: 2rem;
        }
        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-heading h3 {
          margin: 0;
        }
        .btn-download {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f5f5f5;
          color: #333;
          text-decoration: none;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .btn-download:hover {
          background: #e5e5e5;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .status-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f9f9f9;
          border-radius: 4px;
        }
        .category-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .category-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .category-bar {
          flex: 1;
          height: 8px;
          background: #e5e5e5;
          border-radius: 4px;
          overflow: hidden;
        }
        .category-bar-fill {
          height: 100%;
          background: #0070c8;
          transition: width 0.3s;
        }
        .category-count {
          font-weight: 500;
          width: 50px;
          text-align: right;
        }
        .reports-table {
          width: 100%;
          border-collapse: collapse;
        }
        .reports-table th,
        .reports-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e5e5;
        }
        .reports-table th {
          background: #f9f9f9;
          font-weight: 600;
        }
        .request-list-small {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .request-row-small {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f9f9f9;
          border-radius: 4px;
        }
       `}</style>
    </AdminWrapper>
  )
}