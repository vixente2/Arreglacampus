import type { CollectionConfig } from 'payload'

export const Reports: CollectionConfig = {
  slug: 'reports',
  admin: {
    useAsTitle: 'title',
    hidden: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
  ],
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
}