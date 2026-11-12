import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
    localPatterns: [{ pathname: '/api/**' }, { pathname: '/**' }],
  },
}

export default withPayload(nextConfig)