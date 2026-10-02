import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // <-- params é Promise
) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = await context.params // <-- await aqui
    const consumoId = Number(id)
    if (!Number.isSafeInteger(consumoId) || consumoId <= 0) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
    }

    const { quantidade } = await req.json()
    if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
      return NextResponse.json(
        { message: 'A quantidade deve ser um inteiro positivo' },
        { status: 400 },
      )
    }

    const outcome = await prisma.$transaction(
      async (transaction) => {
        const consumoExistente = await transaction.consumo.findUnique({
          where: { id: consumoId },
          include: { comanda: true },
        })
        if (!consumoExistente) {
          return { error: 'Consumo não encontrado', status: 404 as const }
        }
        if (consumoExistente.comanda.status !== 'aberta') {
          return {
            error: 'Não é possível alterar uma comanda fechada',
            status: 409 as const,
          }
        }

        const precoUnitarioRegistrado =
          consumoExistente.subtotal / consumoExistente.quantidade
        const subtotal = Number(
          (precoUnitarioRegistrado * quantidade).toFixed(2),
        )
        const consumo = await transaction.consumo.update({
          where: { id: consumoId },
          data: { quantidade, subtotal },
        })
        return { consumo }
      },
      { isolationLevel: 'Serializable' },
    )

    if ('error' in outcome) {
      return NextResponse.json(
        { message: outcome.error },
        { status: outcome.status },
      )
    }
    return NextResponse.json(outcome.consumo)
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return NextResponse.json(
        {
          message: 'A comanda foi alterada em outra operação; tente novamente',
        },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { message: 'Não foi possível atualizar o consumo' },
      { status: 500 },
    )
  }
}

// Remover consumo
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // <-- params é Promise
) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = await context.params // <-- await aqui
    const consumoId = Number(id)
    if (!Number.isSafeInteger(consumoId) || consumoId <= 0) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
    }

    const outcome = await prisma.$transaction(
      async (transaction) => {
        const consumo = await transaction.consumo.findUnique({
          where: { id: consumoId },
          include: { comanda: true },
        })
        if (!consumo) {
          return { error: 'Consumo não encontrado', status: 404 as const }
        }
        if (consumo.comanda.status !== 'aberta') {
          return {
            error: 'Não é possível alterar uma comanda fechada',
            status: 409 as const,
          }
        }

        await transaction.consumo.delete({ where: { id: consumoId } })
        return { deleted: true as const }
      },
      { isolationLevel: 'Serializable' },
    )

    if ('error' in outcome) {
      return NextResponse.json(
        { message: outcome.error },
        { status: outcome.status },
      )
    }
    return NextResponse.json({ message: 'Consumo removido com sucesso' })
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return NextResponse.json(
        {
          message: 'A comanda foi alterada em outra operação; tente novamente',
        },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { message: 'Não foi possível remover o consumo' },
      { status: 500 },
    )
  }
}
