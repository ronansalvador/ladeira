'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Comanda, Consumo, Produto } from '@/app/types'
import { useAuthGuard } from '@/app/helpers/useAuthGuard'

export default function EditComandaPage() {
  useAuthGuard(['admin'])
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
        const res = await fetch(`/api/comandas/${params.id}`)
        const data: Comanda = await res.json()
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

  const calcularEntrada = (tipoEntrada: string) => {
    if (tipoEntrada === 'vip') return 0
    if (tipoEntrada === 'antecipado') return 25
    return 35 // normal
  }

  const calcularTotal = () =>
    consumos.reduce(
      (acc, item) => acc + item.quantidade * (item.produto?.preco ?? 0),
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

    // injeta o produto completo (senão aparece "Produto não encontrado")
    // const produto = produtos.find((p) => p.id === Number(produtoId))
    // const consumoComProduto = { ...novoConsumo, produto }

    const produto = produtos.find((p) => p.id === Number(produtoId))!
    const consumoComProduto: Consumo = { ...novoConsumo, produto }
    setConsumos((prev) => [...prev, consumoComProduto])
    setProdutoId('')
    setQuantidade(1)
  }

  const fecharComanda = async () => {
    if (!comanda) return
    const confirmClose = window.confirm(
      `Deseja fechar a comanda #${comanda.id} de ${comanda.cliente.nome}?`,
    )
    if (!confirmClose) return

    await fetch(`/api/comandas/fechar/${comanda.id}`, { method: 'POST' })
    setComanda({
      ...comanda,
      status: 'fechada',
      closedAt: new Date().toISOString(),
    })
  }

  if (loading) return <p className="p-4">Carregando...</p>
  if (!comanda) return <p className="p-4">Comanda não encontrada</p>

  const entrada = calcularEntrada(comanda.tipoEntrada)
  const totalGeral = entrada + calcularTotal()

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">
        Comanda #{comanda.id} – {comanda.cliente.nome}
      </h1>
      {/* <p>Status: {comanda.status}</p> */}
      <p>
        Status:{' '}
        <span
          className={`px-2 py-1 rounded-full text-white text-sm ${
            comanda.status === 'aberta' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {comanda.status}
        </span>
      </p>
      <p>Abertura: {new Date(comanda.createdAt).toLocaleString()}</p>
      <p>
        Fechamento:{' '}
        {comanda.closedAt ? new Date(comanda.closedAt).toLocaleString() : '-'}
      </p>

      {/* Nome e data do baile */}

      {comanda.baile && (
        <p className="">
          Baile: <span className="font-semibold">{comanda.baile.nome}</span> –{' '}
          {new Date(comanda.baile.data).toLocaleDateString()}
        </p>
      )}

      {/* Resumo */}
      <div className="border-1 shadow-md rounded-2xl p-4">
        <p>
          Entrada:{' '}
          <span className="font-semibold">R$ {entrada.toFixed(2)}</span> (
          {comanda.tipoEntrada})
        </p>
        <p>
          Consumos:{' '}
          <span className="font-semibold">R$ {calcularTotal().toFixed(2)}</span>
        </p>
        <p className="text-lg font-bold text-green-700 mt-2">
          Total: R$ {totalGeral.toFixed(2)}
        </p>
      </div>

      {/* Lista de consumos */}
      <div className=" border-1 shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-4">Consumos</h2>
        {consumos.length === 0 && (
          <p className="text-gray-500">Nenhum consumo registrado.</p>
        )}

        <ul className="space-y-3">
          {consumos.map((item) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl p-3"
            >
              <div>
                <p className="font-medium">
                  {item.produto?.nome ?? 'Produto não encontrado'}
                </p>
                <p className="text-sm text-gray-500">
                  {item.quantidade} × R${item.produto?.preco.toFixed(2)}
                </p>
              </div>

              {comanda.status === 'aberta' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) =>
                      editarConsumo(item.id, Number(e.target.value))
                    }
                    className="border p-1 w-20 rounded"
                  />
                  <button
                    onClick={() => removerConsumo(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Remover
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Form adicionar consumo + fechar comanda */}
      {comanda.status === 'aberta' && (
        <div className=" border-1 shadow-md rounded-2xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Adicionar Consumo</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="border p-2 rounded flex-1"
            >
              <option value="">Selecione um produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} – R${p.preco.toFixed(2)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="border p-2 rounded w-24"
            />
            <button
              onClick={adicionarConsumo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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
    </div>
  )
}
