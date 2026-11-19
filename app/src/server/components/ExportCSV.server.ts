'use server'

export async function exportRequestsToCSV(requests: Array<{
  id: string | number
  title: string
  description: string
  category: string
  location: string
  status: string
  createdAt: string
}>): string {
  const headers = ['ID', 'Título', 'Descripción', 'Categoría', 'Ubicación', 'Estado', 'Fecha']
  const rows = requests.map((r) => [
    String(r.id),
    r.title,
    r.description,
    getCategoryLabel(r.category),
    r.location,
    getStatusLabel(r.status),
    new Date(r.createdAt).toLocaleDateString('es'),
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ].join('\n')

  return csvContent
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    furniture: 'Mobiliario',
    lighting: 'Iluminación',
    cleaning: 'Limpieza',
    accessibility: 'Accesibilidad',
    other: 'Otro',
  }
  return labels[category] || category
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: 'Enviada',
    review: 'En revisión',
    progress: 'En proceso',
    solved: 'Resuelta',
  }
  return labels[status] || status
}
