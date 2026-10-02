import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const bailes = await prisma.baile.findMany({
      include: {
        comandas: {
          include: {
            cliente: true,
            consumos: {
              include: { produto: true },
            },
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    })

    const data = bailes.map((baile) => ({
      ...baile,
      comandas: baile.comandas.map((c) => ({
        ...c,
        consumos: c.consumos.map((consumo) => ({
          id: consumo.id,
          descricao: consumo.produto.nome,
          quantidade: consumo.quantidade,
          valor: consumo.produto.preco,
        })),
      })),
    }))

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar bailes' },
      { status: 500 },
    )
  }
}

// export async function POST(req: Request) {
//   const { nome, data } = await req.json()
//   const baile = await prisma.baile.create({
//     data: { nome, data: new Date(data) },
//   })
//   return NextResponse.json(baile)
// }

export async function POST(req: Request) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    if (
      !body ||
      typeof body.nome !== 'string' ||
      !body.nome.trim() ||
      body.nome.trim().length > 255 ||
      typeof body.data !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.data)
    ) {
      return NextResponse.json(
        { message: 'Informe o nome e uma data válida para o baile' },
        { status: 400 },
      )
    }

    // Mantém o horário centralizado para evitar mudança de dia por fuso horário.
    const fixedDate = new Date(`${body.data}T12:00:00`)
    if (
      Number.isNaN(fixedDate.getTime()) ||
      fixedDate.toISOString().slice(0, 10) !== body.data
    ) {
      return NextResponse.json({ message: 'Data inválida' }, { status: 400 })
    }

    const baile = await prisma.baile.create({
      data: { nome: body.nome.trim(), data: fixedDate },
    })

    return NextResponse.json(baile)
  } catch {
    return NextResponse.json(
      { message: 'Erro ao criar baile' },
      { status: 500 },
    )
  }
}
