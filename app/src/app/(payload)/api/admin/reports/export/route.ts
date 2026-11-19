import { getPayload } from 'payload'
import config from '@payload-config'
import { exportRequestsToCSV } from '@/server/components/ExportCSV.server'

export async function GET() {
  const payload = await getPayload({ config })

  // Obtener todas las solicitudes con acceso admin
  const result = await payload.find({
    collection: 'requests',
    limit: 1000,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const csvContent = exportRequestsToCSV(result.docs as any)

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="reportes-incidentes.csv"',
    },
  })
}
