import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const bailes = await prisma.baile.findMany({
    include: {
      comandas: {
        include: {
          cliente: true, // se quiser trazer também os dados do cliente
          consumos: {
            include: {
              produto: true, // assim já vem nome/preço do produto
            },
          },
        },
      },
    },
  })
  return NextResponse.json(bailes)
}

export async function POST(req: Request) {
  const { nome, data } = await req.json()
  const baile = await prisma.baile.create({
    data: { nome, data: new Date(data) },
  })
  return NextResponse.json(baile)
}
