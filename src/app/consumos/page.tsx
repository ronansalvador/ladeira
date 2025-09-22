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

interface Comanda {
  id: number
  cliente: Cliente
  status: 'aberta' | 'fechada'
  createdAt: string
  closedAt?: string
}

interface Consumo {
  id: number
  comandaId: number
  produto: Produto
  quantidade: number
}

export default function ConsumosPage() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [consumosMap, setConsumosMap] = useState<Record<number, Consumo[]>>({})
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)

  // filtros
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'todas' | 'aberta' | 'fechada'
  >('todas')

  // estados para adicionar consumo
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  const loadData = async () => {
    setLoading(true)
    try {
      const comandasRes = await fetch('/api/comandas')
      const comandasData: Comanda[] = await comandasRes.json()
      setComandas(comandasData)

      const consumosRes = await fetch('/api/consumos')
      const consumosData: Consumo[] = await consumosRes.json()

      const produtosRes = await fetch('/api/produtos')
      const produtosData: Produto[] = await produtosRes.json()
      setProdutos(produtosData)

      const map: Record<number, Consumo[]> = {}
      consumosData.forEach((c) => {
        if (!map[c.comandaId]) map[c.comandaId] = []
        map[c.comandaId].push(c)
      })
      setConsumosMap(map)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
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

  const fecharComanda = (comanda: Comanda) => {
    if (typeof window === 'undefined') return
    const confirmClose = window.confirm(
      `Deseja fechar a comanda #${comanda.id} de ${comanda.cliente?.nome}?`,
    )
    if (!confirmClose) return

    fetch(`/api/comandas/${comanda.id}/fechar`, { method: 'POST' })
      .then(() => {
        const total = calcularTotal(comanda.id)
        alert(`Comanda fechada! Total: R$ ${total.toFixed(2)}`)
        loadData()
      })
      .catch((err) => console.error(err))
  }

  const adicionarConsumo = async (comandaId: number) => {
    if (!produtoId) {
      alert('Selecione um produto!')
      return
    }

    await fetch('/api/consumos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comandaId,
        produtoId: Number(produtoId),
        quantidade: Number(quantidade),
      }),
    })

    setProdutoId('')
    setQuantidade(1)
    loadData()
  }

  const editarConsumo = async (consumoId: number, quantidade: number) => {
    if (quantidade < 1) return
    await fetch(`/api/consumos/${consumoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade }),
    })
    loadData()
  }

  const removerConsumo = async (consumoId: number) => {
    const confirmDelete = window.confirm('Deseja remover este item?')
    if (!confirmDelete) return

    await fetch(`/api/consumos/${consumoId}`, { method: 'DELETE' })
    loadData()
  }

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString() : '-'

  // aplica filtros
  const comandasFiltradas = comandas.filter((c) => {
    const matchNome = c.cliente?.nome
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchStatus = statusFilter === 'todas' || c.status === statusFilter
    return matchNome && matchStatus
  })

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Controle de Comandas</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'todas' | 'aberta' | 'fechada')
          }
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="todas">Todas</option>
          <option value="aberta">Abertas</option>
          <option value="fechada">Fechadas</option>
        </select>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : comandasFiltradas.length === 0 ? (
        <p>Nenhuma comanda encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comandasFiltradas.map((c) => {
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
                    Abertura: {formatDate(c.createdAt)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Fechamento: {formatDate(c.closedAt)}
                  </p>

                  {/* Lista de consumos */}
                  {consumosMap[c.id]?.length > 0 && (
                    <ul className="text-gray-600 mt-2 space-y-1">
                      {consumosMap[c.id].map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <span>
                            {item.produto.nome} → R${' '}
                            {(item.produto.preco * item.quantidade).toFixed(2)}
                          </span>
                          {c.status === 'aberta' && (
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                min={1}
                                value={item.quantidade}
                                onChange={(e) =>
                                  editarConsumo(item.id, Number(e.target.value))
                                }
                                className="border p-1 w-16 rounded"
                              />
                              <button
                                onClick={() => removerConsumo(item.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                              >
                                X
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Adicionar produtos apenas se a comanda estiver aberta */}
                {c.status === 'aberta' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={produtoId}
                        onChange={(e) => setProdutoId(e.target.value)}
                        className="border p-2 rounded w-full"
                      >
                        <option value="">Selecione um produto</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} - R${p.preco.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={quantidade}
                        onChange={(e) => setQuantidade(Number(e.target.value))}
                        className="border p-2 rounded w-20"
                      />
                      <button
                        onClick={() => adicionarConsumo(c.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => fecharComanda(c)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition w-full"
                    >
                      Fechar Comanda
                    </button>
                  </div>
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
