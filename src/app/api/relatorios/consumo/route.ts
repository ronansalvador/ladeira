import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data')
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return NextResponse.json(
      { message: 'Informe uma data no formato AAAA-MM-DD' },
      { status: 400 },
    )
  }

  const inicio = new Date(`${data}T00:00:00.000Z`)
  if (
    Number.isNaN(inicio.getTime()) ||
    inicio.toISOString().slice(0, 10) !== data
  ) {
    return NextResponse.json({ message: 'Data inválida' }, { status: 400 })
  }
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)

  try {
    const comandas = await prisma.comanda.findMany({
      where: {
        closedAt: { gte: inicio, lt: fim },
      },
      include: {
        cliente: true,
        consumos: { include: { produto: true } },
      },
    })

    return NextResponse.json(comandas)
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível gerar o relatório' },
      { status: 500 },
    )
  }
}
