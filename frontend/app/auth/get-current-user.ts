import { cookies } from 'next/headers'
import {jwtDecode} from 'jwt-decode'
import { AUTHENTICATION_COOKIE } from 'constants/common'

type RawPayload = Record<string, any>

export default async function getCurrentUser() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(AUTHENTICATION_COOKIE)?.value
  if (!cookie) return null

  try {
    const payload = jwtDecode<RawPayload>(cookie)
    // normalize fields
    return {
      userId: payload.sub || payload.userId || payload.id,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch (e) {
    return null
  }
}
