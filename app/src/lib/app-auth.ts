import 'server-only'

import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload, JWTAuthentication } from 'payload'

const APP_SESSION_COOKIE = 'app-session'

export function createAppAuth(collection: 'users') {
  return {
    async currentUser() {
      const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayload({ config })
      const { user } = await JWTAuthentication({
        headers: new Headers({ Authorization: `JWT ${token}` }),
        payload,
      })

      if (!user || user.collection !== collection) return null
      return user
    },

    async login(email: string, password: string) {
      const payload = await getPayload({ config })
      const result = await payload.login({
        collection,
        data: { email, password },
        overrideAccess: false,
      })

      if (!result.token || !result.user) {
        throw new Error('No se pudo iniciar la sesión.')
      }

      const cookieStore = await cookies()
      cookieStore.set(APP_SESSION_COOKIE, result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })

      return result.user
    },

    async logout() {
      const cookieStore = await cookies()
      cookieStore.delete(APP_SESSION_COOKIE)
    },
  }
}

export const appAuth = createAppAuth('users')
