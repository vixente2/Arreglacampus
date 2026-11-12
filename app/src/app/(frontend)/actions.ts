'use server'

import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { getPayload } from 'payload'

export type ActionState = {
  success: boolean
  message: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')

  if (!emailPattern.test(email) || !password) {
    return { success: false, message: 'Revisa tu correo y contraseña.' }
  }

  try {
    await appAuth.login(email, password)
    return { success: true, message: '' }
  } catch {
    return {
      success: false,
      message: 'El correo o la contraseña no son correctos.',
    }
  }
}

export async function registerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = text(formData, 'name')
  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')

  if (name.length < 2) {
    return { success: false, message: 'Escribe tu nombre completo.' }
  }
  if (!emailPattern.test(email)) {
    return { success: false, message: 'Escribe un correo válido.' }
  }
  if (password.length < 8) {
    return {
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres.',
    }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'users',
      data: { email, name, password },
      overrideAccess: false,
    })
    await appAuth.login(email, password)
    return { success: true, message: '' }
  } catch {
    return {
      success: false,
      message: 'No se pudo crear la cuenta. Comprueba si el correo ya existe.',
    }
  }
}

export async function logoutAction(): Promise<ActionState> {
  await appAuth.logout()
  return { success: true, message: '' }
}

const categories = ['furniture', 'lighting', 'cleaning', 'accessibility', 'other'] as const

export async function createRequestAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user) {
    return { success: false, message: 'Tu sesión ha caducado.' }
  }

  const title = text(formData, 'title')
  const description = text(formData, 'description')
  const location = text(formData, 'location')
  const category = text(formData, 'category')
  const image = formData.get('image')

  if (title.length < 5 || title.length > 120) {
    return {
      success: false,
      message: 'El título debe tener entre 5 y 120 caracteres.',
    }
  }
  if (description.length < 10 || description.length > 1500) {
    return {
      success: false,
      message: 'La descripción debe tener entre 10 y 1.500 caracteres.',
    }
  }
  if (location.length < 3 || location.length > 160) {
    return { success: false, message: 'Indica una ubicación válida.' }
  }
  if (!categories.includes(category as (typeof categories)[number])) {
    return { success: false, message: 'Selecciona una categoría válida.' }
  }

  try {
    const payload = await getPayload({ config })
    let imageID: number | undefined

    if (image instanceof File && image.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(image.type)) {
        return {
          success: false,
          message: 'La imagen debe ser JPG, PNG o WEBP.',
        }
      }
      if (image.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: 'La imagen no puede superar los 5 MB.',
        }
      }

      const uploaded = await payload.create({
        collection: 'request-media',
        data: { alt: `Incidencia: ${title}`, owner: user.id },
        file: {
          data: Buffer.from(await image.arrayBuffer()),
          mimetype: image.type,
          name: image.name,
          size: image.size,
        },
        overrideAccess: false,
        user,
      })
      imageID = uploaded.id
    }

    await payload.create({
      collection: 'requests',
      data: {
        category: category as (typeof categories)[number],
        description,
        image: imageID,
        location,
        owner: user.id,
        status: 'submitted',
        title,
      },
      overrideAccess: false,
      user,
    })

    return {
      success: true,
      message: 'Solicitud guardada correctamente.',
    }
  } catch {
    return {
      success: false,
      message: 'No se pudo guardar la solicitud. Inténtalo de nuevo.',
    }
  }
}
