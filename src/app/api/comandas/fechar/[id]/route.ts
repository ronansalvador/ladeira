import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const comandaId = parseInt(id)

    const comanda = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: {
        consumos: { include: { produto: true } },
      },
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
      data: { status: 'fechada', closedAt: new Date(), valorTotal: total },
    })

    return NextResponse.json(fechada)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao fechar comanda', details: error },
      { status: 500 },
    )
  }
}
