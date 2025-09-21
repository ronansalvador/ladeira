import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - lista todos os produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany()
    return NextResponse.json(produtos)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar produtos', error },
      { status: 500 },
    )
  }
}

// POST - cria um novo produto
export async function POST(req: Request) {
  try {
    const { nome, preco } = await req.json()
    const produto = await prisma.produto.create({
      data: { nome, preco },
    })
    return NextResponse.json(produto)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar produto', error },
      { status: 500 },
    )
  }
}

// PUT - atualiza um produto existente
export async function PUT(req: Request) {
  try {
    const { id, nome, preco } = await req.json()
    const produto = await prisma.produto.update({
      where: { id },
      data: { nome, preco },
    })
    return NextResponse.json(produto)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao atualizar produto', error },
      { status: 500 },
    )
  }
}
