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
  descricao: string
  quantidade: number
  valor: number
}

interface Comanda {
  id: number
  cliente: Cliente
  status: 'aberta' | 'fechada'
  createdAt: string
  closedAt?: string
  valorTotal?: number
  tipoEntrada: 'vip' | 'antecipado' | 'normal'
  consumos?: Consumo[]
}

interface Baile {
  id: number
  nome: string
  data: string
  comandas?: Comanda[]
}

export default function BailesPage() {
  const [bailes, setBailes] = useState<Baile[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<
    'todas' | 'aberta' | 'fechada'
  >('todas')

  // estados para adicionar consumo
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    fetch('/api/bailes')
      .then((res) => res.json())
      .then((data) => setBailes(data))

    fetch('/api/produtos')
      .then((res) => res.json())
      .then((data) => setProdutos(data))
  }, [])

  const calcularEntrada = (tipoEntrada: string) => {
    if (tipoEntrada === 'vip') return 0
    if (tipoEntrada === 'antecipado') return 25
    return 35 // normal
  }

  const calcularConsumo = (consumos?: Consumo[]) => {
    if (!consumos) return 0
    return consumos.reduce((acc, item) => acc + item.quantidade * item.valor, 0)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filtrarComandas = (comandas?: Comanda[]) => {
    if (!comandas) return []
    return comandas.filter((c) => {
      const matchesNome = c.cliente.nome
        .toLowerCase()
        .includes(filtroNome.toLowerCase())
      const matchesStatus =
        filtroStatus === 'todas' || c.status === filtroStatus
      return matchesNome && matchesStatus
    })
  }

  // --- Funções de consumo ---
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
    refreshBailes()
  }

  const editarConsumo = async (consumoId: number, quantidade: number) => {
    if (quantidade < 1) return
    await fetch(`/api/consumos/${consumoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade }),
    })
    refreshBailes()
  }

  const removerConsumo = async (consumoId: number) => {
    const confirmDelete = window.confirm('Deseja remover este item?')
    if (!confirmDelete) return

    await fetch(`/api/consumos/${consumoId}`, { method: 'DELETE' })
    refreshBailes()
  }

  const refreshBailes = async () => {
    const res = await fetch('/api/bailes')
    const data = await res.json()
    setBailes(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bailes</h1>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por nome do cliente"
          className="border rounded p-2 flex-1"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={filtroStatus}
          onChange={(e) =>
            setFiltroStatus(e.target.value as 'todas' | 'aberta' | 'fechada')
          }
        >
          <option value="todas">Todas</option>
          <option value="aberta">Abertas</option>
          <option value="fechada">Fechadas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bailes.map((baile) => {
          const comandasFiltradas = filtrarComandas(baile.comandas)
          if (comandasFiltradas.length === 0) return null

          return (
            <div key={baile.id} className="border rounded p-4 shadow">
              <h2 className="text-xl font-semibold mb-2">{baile.nome}</h2>
              <p className="text-gray-600 mb-4">Data: {baile.data}</p>

              <div className="space-y-4">
                {comandasFiltradas.map((c) => {
                  const entrada = calcularEntrada(c.tipoEntrada)
                  const consumo = calcularConsumo(c.consumos)
                  const total = entrada + consumo

                  return (
                    <div
                      key={c.id}
                      className="border rounded p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="mb-2">
                        <p className="font-semibold">
                          Comanda #{c.id} - {c.cliente?.nome}
                        </p>
                        <p className="text-gray-600">Status: {c.status}</p>
                        <p className="text-gray-600">
                          Entrada: {c.tipoEntrada} → R$ {entrada.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Abertura: {formatDate(c.createdAt)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Fechamento: {formatDate(c.closedAt)}
                        </p>

                        {c.consumos && c.consumos.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Consumos:</p>
                            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                              {/* {c.consumos.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex justify-between items-center"
                                >
                                  <span>
                                    {item.descricao} - {item.quantidade} x R${' '}
                                    {item.valor.toFixed(2)} = R${' '}
                                    {(item.quantidade * item.valor).toFixed(2)}
                                  </span>
                                  {c.status === 'aberta' && (
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="number"
                                        min={1}
                                        value={item.quantidade}
                                        onChange={(e) =>
                                          editarConsumo(
                                            item.id,
                                            Number(e.target.value),
                                          )
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
                              ))} */}
                              {c.consumos?.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex justify-between items-center"
                                >
                                  <span>
                                    {item.descricao} - {item.quantidade} x R$
                                    {item.valor.toFixed(2)} = R$
                                    {(item.quantidade * item.valor).toFixed(2)}
                                  </span>
                                  {c.status === 'aberta' && (
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="number"
                                        min={1}
                                        value={item.quantidade}
                                        onChange={(e) =>
                                          editarConsumo(
                                            item.id,
                                            Number(e.target.value),
                                          )
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
                          </div>
                        )}
                      </div>

                      {c.status === 'aberta' && (
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-2 items-center">
                            <select
                              value={produtoId}
                              onChange={(e) => setProdutoId(e.target.value)}
                              className="border p-2 rounded flex-1"
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
                              onChange={(e) =>
                                setQuantidade(Number(e.target.value))
                              }
                              className="border p-2 rounded w-20"
                            />
                            <button
                              onClick={() => adicionarConsumo(c.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {c.status === 'fechada' && (
                        <div className="mt-3 font-semibold text-green-700">
                          Total: Entrada R${entrada.toFixed(2)} + Consumo R$
                          {consumo.toFixed(2)} = R${total.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
