// 'use client'
// import { useState, useEffect } from 'react'

// export default function ControleComandasPage() {
//   const [comandas, setComandas] = useState<any[]>([])

//   const fetchComandas = async () => {
//     const res = await fetch('/api/comandas')
//     const data = await res.json()
//     setComandas(data)
//   }

//   useEffect(() => {
//     fetchComandas()
//   }, [])

//   const fecharComanda = async (id: number) => {
//     await fetch(`/api/comandas/${id}/fechar`, {
//       method: 'POST',
//     })
//     fetchComandas()
//   }

//   return (
//     <div>
//       <h1>Controle de Comandas</h1>
//       <table border={1} cellPadding={5}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Cliente</th>
//             <th>Status</th>
//             <th>Abertura</th>
//             <th>Fechamento</th>
//             <th>Ações</th>
//           </tr>
//         </thead>
//         <tbody>
//           {comandas.map((c) => (
//             <tr key={c.id}>
//               <td>{c.id}</td>
//               <td>{c.cliente?.nome}</td>
//               <td>{c.status}</td>
//               <td>{new Date(c.createdAt).toLocaleString()}</td>
//               <td>
//                 {c.closedAt ? new Date(c.closedAt).toLocaleString() : '-'}
//               </td>
//               <td>
//                 {c.status === 'aberta' && (
//                   <button onClick={() => fecharComanda(c.id)}>Fechar</button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }
'use client'
import { useState, useEffect } from 'react'

export default function ControleComandasPage() {
  const [comandas, setComandas] = useState<any[]>([])
  const [consumosMap, setConsumosMap] = useState<Record<number, any[]>>({})
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)

    // Pega as comandas
    const comandasRes = await fetch('/api/comandas')
    const comandasData = await comandasRes.json()
    setComandas(comandasData)

    // Pega todos os consumos
    const consumosRes = await fetch('/api/consumos')
    const consumosData = await consumosRes.json()

    // Cria um mapa de consumos por comandaId
    const map: Record<number, any[]> = {}
    consumosData.forEach((c: any) => {
      if (!map[c.comandaId]) map[c.comandaId] = []
      map[c.comandaId].push(c)
    })
    setConsumosMap(map)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const calcularTotal = (comandaId: number) => {
    const itens = consumosMap[comandaId] || []
    return itens.reduce(
      (acc, item) => acc + item.quantidade * item.produto.preco,
      0,
    )
  }

  const fecharComanda = async (comanda: any) => {
    const confirm = window.confirm(
      `Deseja fechar a comanda #${comanda.id} de ${comanda.cliente?.nome}?`,
    )
    if (!confirm) return

    await fetch(`/api/comandas/${comanda.id}/fechar`, {
      method: 'POST',
    })

    const total = calcularTotal(comanda.id)
    alert(`Comanda fechada! Total: R$ ${total.toFixed(2)}`)
    loadData()
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Controle de Comandas</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : comandas.length === 0 ? (
        <p>Nenhuma comanda encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comandas.map((c) => {
            const total = calcularTotal(c.id)
            return (
              <div
                key={c.id}
                className="border rounded p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="mb-2">
                  <p className="font-semibold">
                    Comanda #{c.id} - {c.cliente?.nome}
                  </p>
                  <p className="text-gray-600">Status: {c.status}</p>
                  <p className="text-gray-500 text-sm">
                    Abertura: {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Fechamento:{' '}
                    {c.closedAt ? new Date(c.closedAt).toLocaleString() : '-'}
                  </p>
                  {consumosMap[c.id]?.length > 0 && (
                    <ul className="text-gray-600 mt-2 list-disc list-inside">
                      {consumosMap[c.id].map((item) => (
                        <li key={item.id}>
                          {item.produto.nome} x {item.quantidade} → R${' '}
                          {(item.produto.preco * item.quantidade).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {c.status === 'aberta' && (
                  <button
                    onClick={() => fecharComanda(c)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Fechar Comanda
                  </button>
                )}

                {c.status === 'fechada' && (
                  <p className="mt-2 font-semibold text-green-700">
                    Total: R$ {total.toFixed(2)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
