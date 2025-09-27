import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
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
      data: 'desc', // ou 'createdAt' se quiser pela data de criação
    },
  })

  const data = bailes.map((baile) => ({
    ...baile,
    comandas: baile.comandas.map((c) => ({
      ...c,
      consumos: c.consumos.map((consumo) => ({
        id: consumo.id,
        descricao: consumo.produto.nome, // produto.nome vira descricao
        quantidade: consumo.quantidade,
        valor: consumo.produto.preco, // produto.preco vira valor
      })),
    })),
  }))

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { nome, data } = await req.json()
  const baile = await prisma.baile.create({
    data: { nome, data: new Date(data) },
  })
  return NextResponse.json(baile)
}
