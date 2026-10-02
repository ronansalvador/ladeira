import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken')

const SESSION_COOKIE = 'ladeira_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type SessionClaims = {
  sub: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres')
  }
  return secret
}

export function assertAuthConfigured() {
  getJwtSecret()
}

export function createSessionResponse<T extends object>(
  payload: T,
  user: { id: number },
) {
  const token = jwt.sign({ sub: String(user.id) }, getJwtSecret(), {
    expiresIn: SESSION_MAX_AGE,
    algorithm: 'HS256',
  })
  const response = NextResponse.json(payload)
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

export async function requireAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const tokenCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))

  if (!tokenCookie) {
    return NextResponse.json(
      { message: 'Autenticação necessária' },
      { status: 401 },
    )
  }

  try {
    const token = decodeURIComponent(
      tokenCookie.slice(SESSION_COOKIE.length + 1),
    )
    const claims = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    }) as SessionClaims

    const userId = Number(claims.sub)
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: 'Sessão inválida' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'Sessão inválida' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso não autorizado' },
        { status: 403 },
      )
    }

    return null
  } catch {
    return NextResponse.json({ message: 'Sessão inválida' }, { status: 401 })
  }
}

export function clearSessionResponse() {
  const response = NextResponse.json({ message: 'Sessão encerrada' })
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
