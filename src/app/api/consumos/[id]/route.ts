import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Atualizar consumo
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { quantidade } = await req.json()
    const consumoId = Number(params.id)

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
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const consumoId = Number(params.id)

    await prisma.consumo.delete({
      where: { id: consumoId },
    })

    return NextResponse.json({ message: 'Consumo removido com sucesso' })
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}
