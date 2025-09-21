'use client'
import { useEffect, useState } from 'react'

export default function ConsumosPage() {
  const [comandas, setComandas] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [consumos, setConsumos] = useState<any[]>([])

  const [comandaId, setComandaId] = useState('')
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('1')

  const loadData = async () => {
    const c = await fetch('/api/comandas').then((r) => r.json())
    const p = await fetch('/api/produtos').then((r) => r.json())
    const cs = await fetch('/api/consumos').then((r) => r.json())
    setComandas(c)
    setProdutos(p)
    setConsumos(cs)
  }

  useEffect(() => {
    loadData()
  }, [])

  const addConsumo = async () => {
    if (!comandaId || !produtoId) return

    await fetch('/api/consumos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comandaId: Number(comandaId),
        produtoId: Number(produtoId),
        quantidade: Number(quantidade),
      }),
    })
    setQuantidade('1')
    loadData()
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Lançar Consumos</h1>

      {/* Formulário */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Comanda</label>
          <select
            value={comandaId}
            onChange={(e) => setComandaId(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Selecione Comanda</option>
            {comandas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cliente.nome} - {c.tipoEntrada}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Produto</label>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Selecione Produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} - R$ {p.preco.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Quantidade</label>
          <input
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            type="number"
            min="1"
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="flex justify-start sm:justify-end">
          <button
            onClick={addConsumo}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista de consumos */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Lista de Consumos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {consumos.map((c) => (
            <div
              key={c.id}
              className="border rounded p-4 shadow-sm hover:shadow-md transition flex flex-col"
            >
              <p className="font-semibold">
                Comanda: {c.comandaId} - {c.produto.nome}
              </p>
              <p className="text-gray-600">
                Quantidade: {c.quantidade} → R$ {c.subtotal.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
