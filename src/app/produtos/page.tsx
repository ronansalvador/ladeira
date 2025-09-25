'use client'
import { useEffect, useState } from 'react'
import { Produto } from '../types'

// interface Produto {
//   id: number
//   nome: string
//   preco: number
// }

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [editId, setEditId] = useState<number | null>(null)

  // carregar produtos
  const loadProdutos = async () => {
    const res = await fetch('/api/produtos')
    const data: Produto[] = await res.json()
    setProdutos(data)
  }

  useEffect(() => {
    loadProdutos()
  }, [])

  // salvar produto (novo ou editar)
  const saveProduto = async () => {
    if (!nome || !preco) return

    const body = { nome, preco: parseFloat(preco) }

    if (editId) {
      await fetch('/api/produtos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...body }),
      })
    } else {
      await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    setNome('')
    setPreco('')
    setEditId(null)
    loadProdutos()
  }

  const editProduto = (produto: Produto) => {
    setNome(produto.nome)
    setPreco(produto.preco.toString())
    setEditId(produto.id)
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Produtos</h1>

      {/* Formulário */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Preço"
          type="number"
          step="0.01"
          className="border border-gray-300 rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={saveProduto}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition"
        >
          {editId ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map((p) => (
          <div
            key={p.id}
            className="border rounded p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div className="mb-2">
              <h2 className="font-semibold text-lg">{p.nome}</h2>
              <p className="text-gray-600">R$ {p.preco.toFixed(2)}</p>
            </div>
            <button
              onClick={() => editProduto(p)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded self-start"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
