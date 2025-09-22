'use client'
import { useState, useEffect } from 'react'

interface Cliente {
  id: number
  nome: string
}

interface Produto {
  id: number
  nome: string
  preco: number
}

interface Consumo {
  id: number
  comandaId: number
  produto: Produto
  quantidade: number
}

interface Comanda {
  id: number
  cliente: Cliente
  status: 'aberta' | 'fechada'
  createdAt: string
  closedAt?: string
}

export default function ControleComandasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [consumosMap, setConsumosMap] = useState<Record<number, Consumo[]>>({})
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)

    // Pega as comandas
    const comandasRes = await fetch('/api/comandas')
    const comandasData: Comanda[] = await comandasRes.json()
    setComandas(comandasData)

    // Pega todos os consumos
    const consumosRes = await fetch('/api/consumos')
    const consumosData: Consumo[] = await consumosRes.json()

    // Cria um mapa de consumos por comandaId
    const map: Record<number, Consumo[]> = {}
    consumosData.forEach((c) => {
      if (!map[c.comandaId]) map[c.comandaId] = []
      map[c.comandaId].push(c)
    })
    setConsumosMap(map)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const calcularTotal = (comandaId: number) => {
    const itens = consumosMap[comandaId] || []
    return itens.reduce(
      (acc, item) => acc + item.quantidade * item.produto.preco,
      0,
    )
  }

  const fecharComanda = async (comanda: Comanda) => {
    const confirm = window.confirm(
      `Deseja fechar a comanda #${comanda.id} de ${comanda.cliente?.nome}?`,
    )
    if (!confirm) return

    await fetch(`/api/comandas/fechar/${comanda.id}`, {
      method: 'POST',
    })

    const total = calcularTotal(comanda.id)
    alert(`Comanda fechada! Total: R$ ${total.toFixed(2)}`)
    loadData()
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Controle de Comandas</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : comandas.length === 0 ? (
        <p>Nenhuma comanda encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comandas.map((c) => {
            const total = calcularTotal(c.id)
            return (
              <div
                key={c.id}
                className="border rounded p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="mb-2">
                  <p className="font-semibold">
                    Comanda #{c.id} - {c.cliente?.nome}
                  </p>
                  <p className="text-gray-600">Status: {c.status}</p>
                  <p className="text-gray-500 text-sm">
                    Abertura: {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Fechamento:{' '}
                    {c.closedAt ? new Date(c.closedAt).toLocaleString() : '-'}
                  </p>
                  {consumosMap[c.id]?.length > 0 && (
                    <ul className="text-gray-600 mt-2 list-disc list-inside">
                      {consumosMap[c.id].map((item) => (
                        <li key={item.id}>
                          {item.produto.nome} x {item.quantidade} → R${' '}
                          {(item.produto.preco * item.quantidade).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {c.status === 'aberta' && (
                  <button
                    onClick={() => fecharComanda(c)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Fechar Comanda
                  </button>
                )}

                {c.status === 'fechada' && (
                  <p className="mt-2 font-semibold text-green-700">
                    Total: R$ {total.toFixed(2)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
