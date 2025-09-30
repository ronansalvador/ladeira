// 'use client'
// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { Baile } from '../types'
// import { useAuthGuard } from '@/app/helpers/useAuthGuard'

// export default function BailesPage() {
//   useAuthGuard()
//   const [bailes, setBailes] = useState<Baile[]>([])
//   const [nome, setNome] = useState('')
//   const [data, setData] = useState('')
//   const [filtro, setFiltro] = useState('') // Novo estado para o filtro

//   const fetchBailes = async () => {
//     const res = await fetch('/api/bailes')
//     const data: Baile[] = await res.json()
//     setBailes(data)
//   }

//   useEffect(() => {
//     fetchBailes()
//   }, [])

//   const criarBaile = async () => {
//     if (!nome || !data) return
//     await fetch('/api/bailes', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ nome, data }),
//     })
//     setNome('')
//     setData('')
//     fetchBailes()
//   }

//   // Filtragem de bailes pelo filtro único
//   const bailesFiltrados = bailes.filter((b) => {
//     const filtroLower = filtro.toLowerCase()
//     const nomeMatch = b.nome.toLowerCase().includes(filtroLower)
//     const dataMatch = new Date(b.data)
//       .toLocaleDateString()
//       .toLowerCase()
//       .includes(filtroLower)
//     return nomeMatch || dataMatch
//   })

//   return (
//     <div className="p-4 max-w-4xl mx-auto space-y-6">
//       <h1 className="text-2xl font-bold">Criar bailes</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-700">
//             Nome do Baile
//           </label>
//           <input
//             placeholder="Nome do baile"
//             value={nome}
//             onChange={(e) => setNome(e.target.value)}
//             className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
//           />
//         </div>
//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-700">Data</label>
//           <input
//             type="date"
//             value={data}
//             onChange={(e) => setData(e.target.value)}
//             className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
//           />
//         </div>
//         <div className="flex justify-start sm:justify-end">
//           <button
//             onClick={criarBaile}
//             className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition"
//           >
//             Criar Baile
//           </button>
//         </div>
//       </div>

//       <h1 className="text-2xl font-bold">Lista de Bailes</h1>

//       {/* Input do filtro único */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Filtrar por nome ou data (ex: 24/09/2025)"
//           value={filtro}
//           onChange={(e) => setFiltro(e.target.value)}
//           className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
//         />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {bailesFiltrados.map((b) => (
//           <Link
//             key={b.id}
//             href={`/bailes/${b.id}`}
//             className="block border rounded p-4 shadow-sm hover:shadow-md cursor-pointer hover:bg-gray-700 transition"
//           >
//             <h3 className="font-semibold text-lg ">{b.nome}</h3>
//             <span className="text-gray-500 text-sm ">
//               {new Date(b.data).toLocaleDateString()}
//             </span>
//           </Link>
//         ))}
//       </div>
//     </div>
//   )
// }
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Baile } from '../types'
import { useAuthGuard } from '@/app/helpers/useAuthGuard'
import { useUser } from '@/app/context/userContext'

export default function BailesPage() {
  useAuthGuard() // só precisa estar logado

  const { user } = useUser()
  const [bailes, setBailes] = useState<Baile[]>([])
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  const [filtro, setFiltro] = useState('')

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

  const bailesFiltrados = bailes.filter((b) => {
    const filtroLower = filtro.toLowerCase()
    return (
      b.nome.toLowerCase().includes(filtroLower) ||
      new Date(b.data).toLocaleDateString().toLowerCase().includes(filtroLower)
    )
  })

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Bailes</h1>

      {/* Só mostra o form se for admin */}
      {user?.role === 'admin' && (
        <>
          <h2 className="text-xl font-semibold">Criar baile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Nome</label>
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
        </>
      )}

      <h2 className="text-xl font-semibold">Lista de Bailes</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome ou data (ex: 24/09/2025)"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {bailesFiltrados.map((b) => (
          <Link
            key={b.id}
            href={`/bailes/${b.id}`}
            className="block border rounded p-4 shadow-sm hover:shadow-md cursor-pointer hover:bg-gray-700 transition"
          >
            <h3 className="font-semibold text-lg">{b.nome}</h3>
            <span className="text-gray-500 text-sm">
              {new Date(b.data).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
