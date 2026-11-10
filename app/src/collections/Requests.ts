import type { Access, CollectionConfig } from 'payload'

const isAdmin = (user: Parameters<Access>[0]['req']['user']) => user?.collection === 'admins'

const isOwnerOrAdmin: Access = ({ req }) => {
  if (isAdmin(req.user)) return true
  if (req.user?.collection !== 'users') return false
  return { owner: { equals: req.user.id } }
}

export const Requests: CollectionConfig = {
  slug: 'requests',
  labels: {
    singular: 'Solicitud',
    plural: 'Solicitudes',
  },
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => isAdmin(req.user),
    read: isOwnerOrAdmin,
    update: ({ req }) => isAdmin(req.user),
  },
  admin: {
    group: 'ArreglaCampus',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'owner', 'createdAt'],
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Mobiliario', value: 'furniture' },
        { label: 'Iluminación', value: 'lighting' },
        { label: 'Limpieza', value: 'cleaning' },
        { label: 'Accesibilidad', value: 'accessibility' },
        { label: 'Otro', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'submitted',
      options: [
        { label: 'Enviada', value: 'submitted' },
        { label: 'En revisión', value: 'review' },
        { label: 'En proceso', value: 'progress' },
        { label: 'Resuelta', value: 'solved' },
      ],
      admin: {
        position: 'sidebar',
      },
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'request-media',
      filterOptions: ({ user }) =>
        user?.collection === 'users' ? { owner: { equals: user.id } } : true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        create: () => false,
        update: () => false,
      },
      hooks: {
        beforeChange: [
          ({ req, value }) => (req.user?.collection === 'users' ? req.user.id : value),
        ],
      },
    },
  ],
  timestamps: true,
  versions: false,
}
