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

  // soma do consumo
  const totalConsumo = comanda.consumos.reduce(
    (acc, c) => acc + c.quantidade * c.produto.preco,
    0,
  )

  // valores de entrada (exemplo simples)
  const valorEntrada =
    comanda.tipoEntrada === 'vip'
      ? 0
      : comanda.tipoEntrada === 'antecipado'
      ? 20
      : 30

  const total = valorEntrada + totalConsumo

  const fechada = await prisma.comanda.update({
    where: { id: comandaId },
    data: { status: 'fechada', closedAt: new Date() },
  })

  return NextResponse.json({ ...fechada, total })
}
