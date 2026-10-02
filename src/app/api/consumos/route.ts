import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const consumos = await prisma.consumo.findMany({
      include: { produto: true, comanda: true },
    })
    return NextResponse.json(consumos)
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar consumos' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { comandaId, produtoId, quantidade } = await req.json()

    if (
      !Number.isSafeInteger(comandaId) ||
      comandaId <= 0 ||
      !Number.isSafeInteger(produtoId) ||
      produtoId <= 0 ||
      !Number.isSafeInteger(quantidade) ||
      quantidade <= 0
    ) {
      return NextResponse.json(
        { message: 'Comanda, produto e quantidade devem ser valores válidos' },
        { status: 400 },
      )
    }

    const outcome = await prisma.$transaction(
      async (transaction) => {
        const comanda = await transaction.comanda.findUnique({
          where: { id: comandaId },
          select: { status: true },
        })
        if (!comanda) {
          return { error: 'Comanda não encontrada', status: 404 as const }
        }
        if (comanda.status !== 'aberta') {
          return {
            error: 'Não é possível alterar uma comanda fechada',
            status: 409 as const,
          }
        }

        const produto = await transaction.produto.findUnique({
          where: { id: produtoId },
        })
        if (!produto) {
          return { error: 'Produto não encontrado', status: 404 as const }
        }

        const subtotal = Number((produto.preco * quantidade).toFixed(2))
        const consumo = await transaction.consumo.create({
          data: { comandaId, produtoId, quantidade, subtotal },
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
      { message: 'Não foi possível registrar o consumo' },
      { status: 500 },
    )
  }
}
