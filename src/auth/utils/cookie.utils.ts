import type { Response } from 'express'

import { REFRESH_TOKEN_COOKIE } from '../constants/cookie.constants'

export const setRefreshTokenCookie = (
  response: Response,
  refreshToken: string,
) => {
  response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'strict',

    path: '/api/v1/auth/refresh',

    maxAge: 1000 * 60 * 60 * 24 * 30,
  })
}

export const clearRefreshTokenCookie = (response: Response) => {
  response.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: '/api/v1/auth/refresh',
  })
}
