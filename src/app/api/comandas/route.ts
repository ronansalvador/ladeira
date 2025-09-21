import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const comandas = await prisma.comanda.findMany({
      include: {
        cliente: true,
        consumos: { include: { produto: true } },
        baile: true,
      },
    })
    return NextResponse.json(comandas)
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { clienteId, tipoEntrada, baileId } = await req.json()

    if (!clienteId || !baileId) {
      return NextResponse.json(
        { message: 'clienteId e baileId são obrigatórios' },
        { status: 400 },
      )
    }

    const comanda = await prisma.comanda.create({
      data: {
        clienteId,
        tipoEntrada,
        baileId,
      },
    })

    return NextResponse.json({ comanda })
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 })
  }
}
