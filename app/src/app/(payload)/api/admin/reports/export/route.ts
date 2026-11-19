import { getPayload } from 'payload'
import config from '@payload-config'
import { exportRequestsToCSV } from '@/server/components/ExportCSV.server'

export async function GET(request: Request) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return new Response('No autorizado', { status: 401 })
  }

  const result = await payload.find({
    collection: 'requests',
    limit: 1000,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const csvContent = await exportRequestsToCSV(result.docs as any)

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="reportes-incidentes.csv"',
    },
  })
}