'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

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
  cliente: { id: number; nome: string }
  status: 'aberta' | 'fechada'
  createdAt: string
  closedAt?: string
  consumos?: Consumo[]
}

export default function EditComandaPage() {
  const params = useParams()
  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [consumos, setConsumos] = useState<Consumo[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  // estados para adicionar consumo
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // carrega a comanda com consumos
        const res = await fetch(`/api/comandas/${params.id}/fechar`)
        const data: Comanda = await res.json()
        console.log(params.id)
        setComanda(data)
        setConsumos(data.consumos || [])

        // carrega produtos disponíveis
        const produtosRes = await fetch('/api/produtos')
        const produtosData: Produto[] = await produtosRes.json()
        setProdutos(produtosData)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }

    loadData()
  }, [params.id])

  const calcularTotal = () =>
    consumos.reduce(
      (acc, item) => acc + item.quantidade * item.produto.preco,
      0,
    )

  const editarConsumo = async (consumoId: number, quantidade: number) => {
    if (quantidade < 1) return
    await fetch(`/api/consumos/${consumoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade }),
    })
    setConsumos((prev) =>
      prev.map((c) => (c.id === consumoId ? { ...c, quantidade } : c)),
    )
  }

  const removerConsumo = async (consumoId: number) => {
    const confirmDelete = window.confirm('Deseja remover este item?')
    if (!confirmDelete) return
    await fetch(`/api/consumos/${consumoId}`, { method: 'DELETE' })
    setConsumos((prev) => prev.filter((c) => c.id !== consumoId))
  }

  const adicionarConsumo = async () => {
    if (!produtoId) {
      alert('Selecione um produto!')
      return
    }

    const res = await fetch('/api/consumos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comandaId: comanda?.id,
        produtoId: Number(produtoId),
        quantidade: Number(quantidade),
      }),
    })
    const novoConsumo: Consumo = await res.json()
    setConsumos((prev) => [...prev, novoConsumo])
    setProdutoId('')
    setQuantidade(1)
  }

  const fecharComanda = async () => {
    if (!comanda) return
    const confirmClose = window.confirm(
      `Deseja fechar a comanda #${comanda.id} de ${comanda.cliente.nome}?`,
    )
    if (!confirmClose) return

    await fetch(`/api/comandas/${comanda.id}/fechar`, { method: 'POST' })
    setComanda({
      ...comanda,
      status: 'fechada',
      closedAt: new Date().toISOString(),
    })
  }

  if (loading) return <p>Carregando...</p>
  if (!comanda) return <p>Comanda não encontrada</p>

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Editar Comanda #{comanda.id}</h1>
      <p>Cliente: {comanda.cliente.nome}</p>
      <p>Status: {comanda.status}</p>
      <p>Abertura: {new Date(comanda.createdAt).toLocaleString()}</p>
      <p>
        Fechamento:{' '}
        {comanda.closedAt ? new Date(comanda.closedAt).toLocaleString() : '-'}
      </p>

      <h2 className="font-semibold mt-4">Consumos</h2>
      {consumos.length === 0 && <p>Nenhum consumo registrado.</p>}
      <ul className="text-gray-600 mt-2 space-y-2">
        {consumos.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2">
            <span>
              {item.produto.nome} → R$
              {(item.produto.preco * item.quantidade).toFixed(2)}
            </span>
            {comanda.status === 'aberta' && (
              <div className="flex items-center gap-2">
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

      {comanda.status === 'aberta' && (
        <div className="space-y-4 mt-4">
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
              onClick={adicionarConsumo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
            >
              +
            </button>
          </div>

          <button
            onClick={fecharComanda}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Fechar Comanda
          </button>
        </div>
      )}

      <p className="mt-4 font-semibold text-green-700">
        Total: R$ {calcularTotal().toFixed(2)}
      </p>
    </div>
  )
}
