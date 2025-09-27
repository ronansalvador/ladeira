import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

// GET /api/bailes/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const baileId = parseInt(id)

  //   req: Request,
  //   { params }: { params: { id: string } },
  // ) {
  //   const baileId = Number(params.id)

  if (isNaN(baileId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const baile = await prisma.baile.findUnique({
    where: { id: baileId },
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
  })

  if (!baile) {
    return NextResponse.json({ error: 'Baile não encontrado' }, { status: 404 })
  }

  // Mapear dados e calcular total de cada comanda
  const baileFormatado = {
    ...baile,
    comandas: baile.comandas.map((c) => {
      const totalComanda = c.consumos.reduce(
        (acc, consumo) => acc + consumo.subtotal,
        0,
      )

      return {
        id: c.id,
        status: c.status,
        cliente: {
          id: c.cliente.id,
          nome: c.cliente.nome,
          telefone: c.cliente.telefone,
        },
        valor: c.valorTotal ?? totalComanda,
        // consumos: c.consumos.map((consumo) => ({
        //   id: consumo.id,
        //   descricao: consumo.produto.nome,
        //   quantidade: consumo.quantidade,
        //   valor: consumo.produto.preco,
        //   subtotal: consumo.subtotal,
        // })),
      }
    }),
  }

  return NextResponse.json(baileFormatado)
}
