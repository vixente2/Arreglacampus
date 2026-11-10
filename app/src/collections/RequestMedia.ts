import type { Access, CollectionConfig } from 'payload'

const isAdmin = (user: Parameters<Access>[0]['req']['user']) => user?.collection === 'admins'

const isOwnerOrAdmin: Access = ({ req }) => {
  if (isAdmin(req.user)) return true
  if (req.user?.collection !== 'users') return false
  return { owner: { equals: req.user.id } }
}

export const RequestMedia: CollectionConfig = {
  slug: 'request-media',
  labels: {
    singular: 'Imagen de solicitud',
    plural: 'Imágenes de solicitudes',
  },
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    delete: isOwnerOrAdmin,
    read: () => true,
    update: isOwnerOrAdmin,
  },
  admin: {
    group: 'ArreglaCampus',
    useAsTitle: 'alt',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        create: () => false,
        read: ({ req }) => req.user?.collection === 'admins' || req.user?.collection === 'users',
        update: () => false,
      },
      hooks: {
        beforeChange: [
          ({ req, value }) => (req.user?.collection === 'users' ? req.user.id : value),
        ],
      },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      return headers
    },
  },
  versions: false,
}
