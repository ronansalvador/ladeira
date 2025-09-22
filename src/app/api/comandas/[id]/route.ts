import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

// GET: buscar comanda
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   const comandaId = parseInt(params.id)

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const comandaId = parseInt(id)

  const comanda = await prisma.comanda.findUnique({
    where: { id: comandaId },
    include: { consumos: { include: { produto: true } }, cliente: true },
  })

  if (!comanda) {
    return NextResponse.json(
      { error: 'Comanda não encontrada' },
      { status: 404 },
    )
  }

  return NextResponse.json(comanda)
}
