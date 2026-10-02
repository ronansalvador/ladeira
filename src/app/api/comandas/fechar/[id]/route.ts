import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { id } = await context.params
  const comandaId = Number(id)
  if (!Number.isSafeInteger(comandaId) || comandaId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const outcome = await prisma.$transaction(
      async (transaction) => {
        const comanda = await transaction.comanda.findUnique({
          where: { id: comandaId },
          include: { consumos: true },
        })

        if (!comanda) {
          return { error: 'Comanda não encontrada', status: 404 as const }
        }
        if (comanda.status === 'fechada') {
          return { error: 'A comanda já está fechada', status: 409 as const }
        }

        const totalConsumo = comanda.consumos.reduce(
          (total, consumo) => total + consumo.subtotal,
          0,
        )
        const valorEntrada =
          comanda.tipoEntrada === 'vip'
            ? 0
            : comanda.tipoEntrada === 'antecipado'
              ? 25
              : 35
        const valorTotal = Number((valorEntrada + totalConsumo).toFixed(2))

        const fechada = await transaction.comanda.update({
          where: { id: comandaId },
          data: {
            status: 'fechada',
            closedAt: new Date(),
            valorTotal,
          },
        })
        return { comanda: fechada }
      },
      { isolationLevel: 'Serializable' },
    )

    if ('error' in outcome) {
      return NextResponse.json(
        { error: outcome.error },
        { status: outcome.status },
      )
    }
    return NextResponse.json(outcome.comanda)
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return NextResponse.json(
        { error: 'A comanda foi alterada em outra operação; tente novamente' },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: 'Erro ao fechar comanda' },
      { status: 500 },
    )
  }
}
