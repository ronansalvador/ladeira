'use client'
import { useState, useEffect } from 'react'

export default function Comandas() {
  const [clientes, setClientes] = useState<any[]>([])
  const [bailes, setBailes] = useState<any[]>([])
  const [comandas, setComandas] = useState<any[]>([])

  const [clienteId, setClienteId] = useState('')
  const [baileId, setBaileId] = useState('')
  const [tipoEntrada, setTipoEntrada] = useState('normal')

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then(setClientes)

    fetch('/api/bailes')
      .then((res) => res.json())
      .then(setBailes)

    fetch('/api/comandas')
      .then((res) => res.json())
      .then(setComandas)
  }, [])

  const addComanda = async () => {
    if (!clienteId || !baileId) {
      alert('Selecione cliente e baile')
      return
    }

    await fetch('/api/comandas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: Number(clienteId),
        baileId: Number(baileId),
        tipoEntrada,
      }),
    })

    const data = await fetch('/api/comandas').then((res) => res.json())
    setComandas(data)

    setClienteId('')
    setBaileId('')
    setTipoEntrada('normal')
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Controle de Comandas</h1>

      {/* Formulário de abertura */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecione cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Baile</label>
          <select
            value={baileId}
            onChange={(e) => setBaileId(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecione baile</option>
            {bailes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome} - {new Date(b.data).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Tipo de Entrada
          </label>
          <select
            value={tipoEntrada}
            onChange={(e) => setTipoEntrada(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="normal">Normal</option>
            <option value="vip">VIP</option>
            <option value="antecipado">Antecipado</option>
          </select>
        </div>

        <div className="flex justify-start sm:justify-end">
          <button
            onClick={addComanda}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            Abrir Comanda
          </button>
        </div>
      </div>

      {/* Lista de comandas */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Comandas Abertas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comandas.map((c) => (
            <div
              key={c.id}
              className="border rounded p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="mb-2">
                <h3 className="font-semibold text-lg">{c.cliente?.nome}</h3>
                <p className="text-gray-600 text-sm">
                  Tipo: {c.tipoEntrada} - Status: {c.status}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Baile: {c.baile?.nome}{' '}
                  {c.baile?.data
                    ? `(${new Date(c.baile.data).toLocaleDateString()})`
                    : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
