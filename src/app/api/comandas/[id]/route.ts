import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
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
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { id } = await context.params
  const comandaId = Number(id)
  if (!Number.isSafeInteger(comandaId) || comandaId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const comanda = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: {
        consumos: { include: { produto: true } },
        cliente: true,
        baile: true,
      },
    })

    if (!comanda) {
      return NextResponse.json(
        { error: 'Comanda não encontrada' },
        { status: 404 },
      )
    }

    return NextResponse.json(comanda)
  } catch {
    return NextResponse.json(
      { error: 'Erro ao buscar comanda' },
      { status: 500 },
    )
  }
}
