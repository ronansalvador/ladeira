import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data') // exemplo: 2025-09-21

  const inicio = new Date(data + 'T00:00:00')
  const fim = new Date(data + 'T23:59:59')

  const comandas = await prisma.comanda.findMany({
    where: {
      closedAt: { gte: inicio, lte: fim },
    },
    include: {
      cliente: true,
      consumos: { include: { produto: true } },
    },
  })

  return NextResponse.json(comandas)
}
