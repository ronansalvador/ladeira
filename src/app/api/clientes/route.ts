import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nome: 'asc', // 'asc' = ordem crescente (A-Z), 'desc' = ordem decrescente (Z-A)
      },
    })
    return NextResponse.json(clientes)
  } catch {
    return NextResponse.json(
      {
        message: 'Erro ao buscar clientes',
      },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { nome, telefone } = await req.json()
    if (
      typeof nome !== 'string' ||
      !nome.trim() ||
      nome.trim().length > 255 ||
      typeof telefone !== 'string' ||
      !telefone.trim() ||
      telefone.trim().length > 40
    ) {
      return NextResponse.json(
        { message: 'Nome e telefone válidos são obrigatórios' },
        { status: 400 },
      )
    }
    const cliente = await prisma.cliente.create({
      data: { nome: nome.trim(), telefone: telefone.trim() },
    })
    return NextResponse.json({ cliente })
  } catch {
    return NextResponse.json(
      {
        message: 'Erro ao criar cliente',
      },
      { status: 500 },
    )
  }
}
