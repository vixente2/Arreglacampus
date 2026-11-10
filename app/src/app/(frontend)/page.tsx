import { CampusApp, type CampusRequest } from '@/components/CampusApp'
import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import type { RequestMedia } from '@/payload-types'

export default async function HomePage() {
  const user = await appAuth.currentUser()
  let requests: CampusRequest[] = []

  if (user) {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'requests',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: '-createdAt',
      user,
    })

    requests = result.docs.map((request) => {
      const image =
        request.image && typeof request.image === 'object' ? (request.image as RequestMedia) : null

      return {
        id: String(request.id),
        title: request.title,
        description: request.description,
        category: request.category,
        location: request.location,
        status: request.status ?? 'submitted',
        createdAt: request.createdAt,
        image:
          image?.url && image.width && image.height
            ? {
                url: image.url,
                alt: image.alt,
                width: image.width,
                height: image.height,
              }
            : undefined,
      }
    })
  }

  return (
    <CampusApp user={user ? { name: user.name, email: user.email } : null} requests={requests} />
  )
}
