'use client'
import { useState, useEffect } from 'react'
import { Baile, Cliente, Comanda } from '../types'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Select from 'react-select'
import { useAuthGuard } from '@/app/helpers/useAuthGuard'

export default function Comandas() {
  useAuthGuard(['admin'])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [bailes, setBailes] = useState<Baile[]>([])
  const [comandas, setComandas] = useState<Comanda[]>([])

  const [clienteId, setClienteId] = useState<number | ''>('')
  const [baileId, setBaileId] = useState('')
  const [tipoEntrada, setTipoEntrada] =
    useState<Comanda['tipoEntrada']>('normal')

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then(setClientes)

    fetch('/api/bailes')
      .then((res) => res.json())
      .then(setBailes)

    // fetch('/api/comandas')
    //   .then((res) => res.json())
    //   .then(setComandas)
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
    console.log('data', data)
    toast.success('Comanda criada com sucesso')
    setComandas(data)

    setClienteId('')
    setBaileId('')
    setTipoEntrada('normal')
  }

  const clienteOptions = clientes.map((c) => ({
    value: c.id,
    label: c.nome,
  }))

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Controle de Comandas</h1>

      {/* Formulário de abertura */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Cliente</label>
          {/* <select
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
          </select> */}
          {/* <Select
            value={clienteOptions.find((o) => o.value === clienteId) || null}
            onChange={(selected) =>
              setClienteId(selected ? selected.value : '')
            }
            options={clienteOptions}
            placeholder="Selecione cliente"
            isClearable
          /> */}
          <Select
            value={clienteOptions.find((o) => o.value === clienteId) || null}
            onChange={(selected) =>
              setClienteId(selected ? selected.value : '')
            }
            options={clienteOptions}
            placeholder="Selecione cliente"
            isClearable
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', // azul-500 ou gray-300
                boxShadow: state.isFocused ? '0 0 0 2px #3b82f680' : 'none',
                '&:hover': {
                  borderColor: '#3b82f6',
                },
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? '#3b82f6'
                  : 'var(--background)',
                color: state.isFocused ? '#ffffff' : 'var(--foreground)',
                cursor: 'pointer',
              }),
              singleValue: (base) => ({
                ...base,
                color: 'var(--foreground)',
              }),
              placeholder: (base) => ({
                ...base,
                color: '#9ca3af', // slate-400
              }),
            }}
          />
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
            onChange={(e) =>
              setTipoEntrada(e.target.value as Comanda['tipoEntrada'])
            }
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
      {/* <div>
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
      </div> */}
      <ToastContainer />
    </div>
  )
}
