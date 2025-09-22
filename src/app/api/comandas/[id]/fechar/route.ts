import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const comandaId = parseInt(params.id)

  const comanda = await prisma.comanda.findUnique({
    where: { id: comandaId },
    include: { consumos: { include: { produto: true } } },
  })

  if (!comanda) {
    return NextResponse.json(
      { error: 'Comanda não encontrada' },
      { status: 404 },
    )
  }

  const totalConsumo = comanda.consumos.reduce(
    (acc, c) => acc + c.quantidade * c.produto.preco,
    0,
  )

  const valorEntrada =
    comanda.tipoEntrada === 'vip'
      ? 0
      : comanda.tipoEntrada === 'antecipado'
      ? 25
      : 35

  const total = valorEntrada + totalConsumo

  const fechada = await prisma.comanda.update({
    where: { id: comandaId },
    data: { status: 'fechada', closedAt: new Date() },
  })

  return NextResponse.json({ ...fechada, total })
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const comandaId = parseInt(params.id)

  const comanda = await prisma.comanda.findUnique({
    where: { id: comandaId },
    include: { consumos: { include: { produto: true } }, cliente: true },
  })

  if (!comanda) {
    return NextResponse.json(
      { error: 'Comanda não encontrada' },
      { status: 404 },
    )
  }

  return NextResponse.json(comanda)
}
