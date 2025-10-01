'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Baile } from '@/app/types'
import { useAuthGuard } from '@/app/helpers/useAuthGuard'

export default function BaileDetalhesPage() {
  useAuthGuard(['admin'])
  const router = useRouter()
  const params = useParams()
  const baileId = params?.id as string
  const [baile, setBaile] = useState<Baile | null>(null)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    const fetchBaile = async () => {
      const res = await fetch(`/api/bailes/${baileId}`)
      const data: Baile = await res.json()
      setBaile(data)
    }
    if (baileId) fetchBaile()
  }, [baileId])

  if (!baile) return <p className="p-4">Carregando...</p>

  // aplica filtro por nome do cliente ou id da comanda
  const comandasFiltradas = baile.comandas.filter(
    (c) =>
      c.cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      c.id.toString().includes(filtro),
  )

  const total =
    comandasFiltradas?.reduce((acc, c) => acc + (c.valor || 0), 0) || 0

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{baile.nome}</h1>
      <p className="text-gray-500">
        {new Date(baile.data).toLocaleDateString()}
      </p>

      <h2 className="text-xl font-semibold mt-4">Comandas</h2>

      {/* Input de filtro */}
      <input
        type="text"
        placeholder="Buscar por nome ou número..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <div className="space-y-3">
        {comandasFiltradas.length > 0 ? (
          comandasFiltradas.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/comandas/${c.id}`)}
              className="border rounded p-3 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-100 transition"
            >
              <span>
                {`Comanda #${c.id} – ${c.cliente.nome} - `}
                <span
                  className={
                    c.status === 'aberta' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {c.status}
                </span>
              </span>
              <span className="font-medium">R$ {c.valor.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <p>Nenhuma comanda encontrada</p>
        )}
      </div>

      <div className="border-t pt-4 text-lg font-bold">
        Total: R$ {total.toFixed(2)}
      </div>
    </div>
  )
}
