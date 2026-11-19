import type { Access, CollectionConfig } from 'payload'

const isSelf: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Estudiante',
    plural: 'Estudiantes',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 7 * 24 * 60 * 60,
  },
  access: {
    admin: () => false,
    create: () => true,
    delete: () => false,
    read: isSelf,
    update: isSelf,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  hooks: {
  beforeValidate: [
    ({ data }) => {
      const email = typeof data?.email === 'string' ? data.email.toLowerCase().trim() : ''
      if (email && !email.endsWith('@virginiogomez.cl')) {
        throw new Error('Solo correos de @virginiogomez.cl están permitidos.')
      }
      return data
    },
  ],
},
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
  versions: false,
}
