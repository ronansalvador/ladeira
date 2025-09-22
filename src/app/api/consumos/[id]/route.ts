import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // <-- params é Promise
) {
  try {
    const { id } = await context.params // <-- await aqui
    const consumoId = Number(id)

    const { quantidade } = await req.json()

    // busca o consumo atual
    const consumoExistente = await prisma.consumo.findUnique({
      where: { id: consumoId },
      include: { produto: true },
    })

    if (!consumoExistente) {
      return NextResponse.json(
        { message: 'Consumo não encontrado' },
        { status: 404 },
      )
    }

    const novoSubtotal = consumoExistente.produto.preco * quantidade

    const consumo = await prisma.consumo.update({
      where: { id: consumoId },
      data: {
        quantidade,
        subtotal: novoSubtotal,
      },
    })

    return NextResponse.json(consumo)
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}

// Remover consumo
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // <-- params é Promise
) {
  try {
    const { id } = await context.params // <-- await aqui
    const consumoId = Number(id)

    await prisma.consumo.delete({
      where: { id: consumoId },
    })

    return NextResponse.json({ message: 'Consumo removido com sucesso' })
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}
