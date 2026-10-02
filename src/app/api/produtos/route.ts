import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - lista todos os produtos
export async function GET(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: 'asc',
      },
    })
    return NextResponse.json(produtos)
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar produtos' },
      { status: 500 },
    )
  }
}

// POST - cria um novo produto
export async function POST(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { nome, preco } = await req.json()
    if (
      typeof nome !== 'string' ||
      !nome.trim() ||
      nome.trim().length > 255 ||
      typeof preco !== 'number' ||
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      return NextResponse.json(
        { message: 'Informe um nome e um preço válidos' },
        { status: 400 },
      )
    }

    // cria uma nova variável a partir de nome
    const nomeNormalizado = nome
      .toLowerCase()
      .split(/\s+/)
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
  } catch {
    return NextResponse.json(
      { message: 'Erro ao criar produto' },
      { status: 500 },
    )
  }
}

// PUT - atualiza um produto existente
export async function PUT(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { id, nome, preco } = await req.json()
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: 'ID do produto inválido' },
        { status: 400 },
      )
    }
    if (
      nome !== undefined &&
      (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 255)
    ) {
      return NextResponse.json(
        { message: 'Nome do produto inválido' },
        { status: 400 },
      )
    }
    if (
      preco !== undefined &&
      (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0)
    ) {
      return NextResponse.json({ message: 'Preço inválido' }, { status: 400 })
    }

    // normaliza o nome, se enviado
    const nomeNormalizado = nome
      ? nome
          .toLowerCase()
          .split(/\s+/)
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
        preco,
      },
    })

    return NextResponse.json(produto)
  } catch {
    return NextResponse.json(
      { message: 'Erro ao atualizar produto' },
      { status: 500 },
    )
  }
}

// DELETE - exclui um produto
export async function DELETE(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = await req.json() // espera receber o id no body

    if (!Number.isSafeInteger(id) || id <= 0) {
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
  } catch {
    return NextResponse.json(
      { message: 'Erro ao excluir produto' },
      { status: 500 },
    )
  }
}
