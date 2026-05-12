import type { Response } from 'express'

import { REFRESH_TOKEN_COOKIE } from '../constants/cookie.constants'

export const setRefreshTokenCookie = (
  response: Response,
  refreshToken: string,
) => {
  const isProd = process.env.NODE_ENV === 'production'

  response.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1/auth/refresh' })
  response.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1' })

  response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    // path: '/',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  })
}

export const clearRefreshTokenCookie = (response: Response) => {
  response.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: '/',
    // path: '/',
  })
}
