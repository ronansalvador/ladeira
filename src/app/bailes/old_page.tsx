'use client'
import { useState, useEffect } from 'react'
import { Baile } from '../types'

// interface Comanda {
//   id: number
//   status: string
// }

// interface Baile {
//   id: number
//   nome: string
//   data: string
//   comandas?: Comanda[]
// }

export default function BailesPage() {
  const [bailes, setBailes] = useState<Baile[]>([])
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')

  const fetchBailes = async () => {
    const res = await fetch('/api/bailes')
    const data: Baile[] = await res.json()
    setBailes(data)
  }

  useEffect(() => {
    fetchBailes()
  }, [])

  const criarBaile = async () => {
    if (!nome || !data) return
    await fetch('/api/bailes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, data }),
    })
    setNome('')
    setData('')
    fetchBailes()
  }

  console.log(bailes)

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Bailes</h1>

      {/* Formulário de criação */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Nome do Baile
          </label>
          <input
            placeholder="Nome do baile"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex justify-start sm:justify-end">
          <button
            onClick={criarBaile}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition"
          >
            Criar Baile
          </button>
        </div>
      </div>

      {/* Lista de bailes */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Bailes Cadastrados</h2>
        <div className="space-y-4">
          {bailes.map((b) => (
            <div
              key={b.id}
              className="border rounded p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{b.nome}</h3>
                <span className="text-gray-500 text-sm">
                  {new Date(b.data).toLocaleDateString()}
                </span>
              </div>

              {Array.isArray(b.comandas) && b.comandas.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-gray-700 mb-1">Comandas:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {b.comandas.map((c) => (
                      <li key={c.id}>
                        Comanda #{c.id} - {c.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
