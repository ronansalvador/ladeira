'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Baile, Comanda, Consumo } from '../types'

export default function BailesPage() {
  const router = useRouter()
  const [bailes, setBailes] = useState<Baile[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<
    'todas' | 'aberta' | 'fechada'
  >('todas')
  const [filtroBaile, setFiltroBaile] = useState<'todos' | number>('todos')

  useEffect(() => {
    fetch('/api/bailes')
      .then((res) => res.json())
      .then((data) => setBailes(data))
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
      const filtroLower = filtroNome.toLowerCase()
      const matchesNome = c.cliente.nome.toLowerCase().includes(filtroLower)
      const matchesId = c.id.toString().includes(filtroLower) // verifica se o input bate com o id da comanda
      const matchesStatus =
        filtroStatus === 'todas' || c.status === filtroStatus
      return (matchesNome || matchesId) && matchesStatus
    })
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
        <select
          className="border rounded p-2"
          value={filtroBaile}
          onChange={(e) => {
            const val = e.target.value
            setFiltroBaile(val === 'todos' ? 'todos' : Number(val))
          }}
        >
          <option value="todos">Todos os bailes</option>
          {bailes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome} – {new Date(b.data).toLocaleDateString('pt-BR')}
            </option>
          ))}
        </select>
      </div>

      {/* LISTAGEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bailes
          .filter(
            (baile) => filtroBaile === 'todos' || baile.id === filtroBaile,
          )
          .map((baile) => {
            const comandasFiltradas = filtrarComandas(baile.comandas)
            if (comandasFiltradas.length === 0) return null

            return (
              <div key={baile.id} className="border rounded p-4 shadow">
                <h2 className="text-xl font-semibold mb-2">{baile.nome}</h2>
                <p className="text-gray-600 mb-4">
                  Data: {new Date(baile.data).toLocaleDateString('pt-BR')}
                </p>

                <div className="space-y-3">
                  {comandasFiltradas.map((c) => {
                    const entrada = calcularEntrada(c.tipoEntrada)
                    const consumo = calcularConsumo(c.consumos)
                    const total = entrada + consumo

                    return (
                      <div
                        key={c.id}
                        onClick={() => router.push(`/comandas/${c.id}`)}
                        className="border rounded p-3 shadow-sm cursor-pointer hover:bg-gray-100 transition"
                      >
                        <p className="font-semibold">
                          Comanda #{c.id} - {c.cliente?.nome}
                        </p>
                        <p
                          className={
                            c.status === 'aberta'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          Status: {c.status}
                        </p>
                        <p className="text-gray-600">
                          Entrada: {c.tipoEntrada} → R$ {entrada.toFixed(2)}
                        </p>
                        <p className="text-gray-600">
                          Consumo: R$ {consumo.toFixed(2)}
                        </p>
                        <p className="text-green-700 font-semibold">
                          Total: R$ {total.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Abertura: {formatDate(c.createdAt)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Fechamento: {formatDate(c.closedAt)}
                        </p>
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
