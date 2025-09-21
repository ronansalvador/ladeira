import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany()
    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json(
      {
        message: 'error',
        error,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const { nome, telefone } = await req.json()
    // const { cliente, date, servico }: Agendamento = await req.json()
    const cliente = await prisma.cliente.create({
      data: { nome, telefone },
    })
    return NextResponse.json({ cliente })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'error',
        error,
      },
      { status: 500 },
    )
  }
}
