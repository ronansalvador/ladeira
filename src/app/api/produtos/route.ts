import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - lista todos os produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: 'asc',
      },
    })
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

    // cria uma nova variável a partir de nome
    const nomeNormalizado = nome
      .toLowerCase()
      .split(' ')
      .map(
        (palavra: string) => palavra.charAt(0).toUpperCase() + palavra.slice(1),
      )
      .join(' ')

    // salva usando nomeNormalizado
    const produto = await prisma.produto.create({
      data: {
        nome: nomeNormalizado,
        preco: Number(preco),
      },
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

    // normaliza o nome, se enviado
    const nomeNormalizado = nome
      ? nome
          .toLowerCase()
          .split(' ')
          .map(
            (palavra: string) =>
              palavra.charAt(0).toUpperCase() + palavra.slice(1),
          )
          .join(' ')
      : undefined // caso o usuário não envie nome no update

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: nomeNormalizado,
        preco: preco !== undefined ? Number(preco) : undefined,
      },
    })

    return NextResponse.json(produto)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao atualizar produto', error },
      { status: 500 },
    )
  }
}

// DELETE - exclui um produto
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json() // espera receber o id no body

    if (!id) {
      return NextResponse.json(
        { message: 'ID do produto é obrigatório' },
        { status: 400 },
      )
    }

    const deletedProduto = await prisma.produto.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Produto excluído com sucesso',
      produto: deletedProduto,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao excluir produto', error },
      { status: 500 },
    )
  }
}
