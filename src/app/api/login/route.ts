import { assertAuthConfigured, createSessionResponse } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: 'Corpo JSON inválido' },
      { status: 400 },
    )
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('email' in body) ||
    !('password' in body) ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string' ||
    !body.email.trim() ||
    !body.password
  ) {
    return NextResponse.json(
      { message: 'E-mail e senha são obrigatórios' },
      { status: 400 },
    )
  }

  try {
    assertAuthConfigured()
    const user = await prisma.user.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Login e/ou senha incorretos.' },
        { status: 401 },
      )
    }

    const verification = await verifyPassword(body.password, user.password)
    if (!verification.valid) {
      return NextResponse.json(
        { message: 'Login e/ou senha incorretos.' },
        { status: 401 },
      )
    }

    if (verification.needsRehash) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(body.password) },
      })
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
    return createSessionResponse(publicUser, user)
  } catch {
    return NextResponse.json(
      {
        message:
          'Não foi possível autenticar. Verifique a configuração do servidor.',
      },
      { status: 500 },
    )
  }
}
