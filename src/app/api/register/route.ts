import { assertAuthConfigured, createSessionResponse } from '@/lib/auth'
import { hashPassword } from '@/lib/password'
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
    !('name' in body) ||
    !('email' in body) ||
    !('password' in body) ||
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string'
  ) {
    return NextResponse.json(
      { message: 'Nome, e-mail e senha são obrigatórios' },
      { status: 400 },
    )
  }

  const name = body.name.trim()
  const email = body.email.trim().toLowerCase()
  if (!name || name.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { message: 'Informe um nome e um e-mail válidos' },
      { status: 400 },
    )
  }
  if (body.password.length < 8 || body.password.length > 128) {
    return NextResponse.json(
      { message: 'A senha deve ter entre 8 e 128 caracteres' },
      { status: 400 },
    )
  }

  try {
    assertAuthConfigured()
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(body.password),
        role: 'user',
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return createSessionResponse(user, user)
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { message: 'Já existe uma conta com este e-mail' },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { message: 'Não foi possível concluir o cadastro' },
      { status: 500 },
    )
  }
}
