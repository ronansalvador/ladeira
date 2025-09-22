'use client'
import { useState, useEffect } from 'react'

interface Cliente {
  id: number
  nome: string
  telefone: string
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data: Cliente[]) => setClientes(data))
  }, [])

  const addCliente = async () => {
    if (!nome || !telefone) return
    await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone }),
    })
    setNome('')
    setTelefone('')
    const data: Cliente[] = await fetch('/api/clientes').then((res) =>
      res.json(),
    )
    setClientes(data)
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cadastro de Clientes</h1>

      {/* Formulário */}
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-1 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Telefone</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={addCliente}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          Adicionar
        </button>
      </div>

      {/* Lista de clientes */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Clientes Cadastrados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((c) => (
            <div
              key={c.id}
              className="border rounded p-4 shadow-sm hover:shadow-md transition flex flex-col"
            >
              <h3 className="font-semibold text-lg">{c.nome}</h3>
              <p className="text-gray-600">{c.telefone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
