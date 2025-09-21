import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - lista consumos
export async function GET() {
  try {
    const consumos = await prisma.consumo.findMany({
      include: { produto: true, comanda: true },
    })
    return NextResponse.json(consumos)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar consumos', error },
      { status: 500 },
    )
  }
}

// POST - lança um produto em uma comanda
export async function POST(req: Request) {
  try {
    const { comandaId, produtoId, quantidade } = await req.json()

    // buscar produto pra calcular subtotal
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
      include: { produto: true },
    })

    return NextResponse.json(consumo)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao lançar consumo', error },
      { status: 500 },
    )
  }
}
