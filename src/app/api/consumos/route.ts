import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const consumos = await prisma.consumo.findMany({
      include: { produto: true, comanda: true },
    })
    return NextResponse.json(consumos)
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { comandaId, produtoId, quantidade } = await req.json()

    // pega o preço do produto para calcular subtotal
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    })
    if (!produto) {
      return NextResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 },
      )
    }

    const subtotal = produto.preco * quantidade

    const consumo = await prisma.consumo.create({
      data: {
        comandaId,
        produtoId,
        quantidade,
        subtotal,
      },
    })

    return NextResponse.json(consumo)
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}
