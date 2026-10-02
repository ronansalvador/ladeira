import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const comandas = await prisma.comanda.findMany({
      include: {
        cliente: true,
        consumos: { include: { produto: true } },
        baile: true,
      },
    })
    return NextResponse.json(comandas)
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar comandas' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { clienteId, tipoEntrada, baileId } = await req.json()

    if (
      !Number.isSafeInteger(clienteId) ||
      clienteId <= 0 ||
      !Number.isSafeInteger(baileId) ||
      baileId <= 0 ||
      !['normal', 'vip', 'antecipado'].includes(tipoEntrada)
    ) {
      return NextResponse.json(
        {
          message: 'Cliente, baile e tipo de entrada válidos são obrigatórios',
        },
        { status: 400 },
      )
    }

    const comanda = await prisma.comanda.create({
      data: {
        clienteId,
        tipoEntrada,
        baileId,
      },
    })

    return NextResponse.json({ comanda })
  } catch {
    return NextResponse.json(
      { message: 'Erro ao abrir comanda' },
      { status: 500 },
    )
  }
}
