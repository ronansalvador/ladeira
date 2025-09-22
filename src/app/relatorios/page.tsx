'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Relatorio = {
  id: number
  cliente?: {
    nome: string
  }
  status: string
  closedAt?: string | null
}

export default function RelatoriosPage() {
  const [data, setData] = useState('')
  const [relatorio, setRelatorio] = useState<Relatorio[]>([])

  const fetchRelatorio = async () => {
    if (!data) return
    const res = await fetch(`/api/relatorios/consumo?data=${data}`)
    const dados: Relatorio[] = await res.json()
    setRelatorio(dados)
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(relatorio)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório')
    XLSX.writeFile(wb, 'relatorio.xlsx')
  }

  const exportPDF = () => {
    const doc = new jsPDF()

    // Monta os dados da tabela garantindo que não haja undefined
    const tableData: (string | number)[][] = relatorio.map((r) => [
      r.id,
      r.cliente?.nome ?? '-', // Se cliente for undefined, coloca '-'
      r.status ?? '-', // Se status for undefined, coloca '-'
      r.closedAt ? new Date(r.closedAt).toLocaleDateString() : '-', // Data ou '-'
    ])

    autoTable(doc, {
      head: [['ID', 'Cliente', 'Status', 'Data Fechamento']],
      body: tableData,
      startY: 20, // começa um pouco abaixo do topo
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // cor do cabeçalho
    })

    doc.save('relatorio.pdf')
  }

  return (
    <div>
      <h1>Relatórios</h1>
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <button onClick={fetchRelatorio}>Gerar</button>

      <div>
        <button onClick={exportExcel}>Exportar Excel</button>
        <button onClick={exportPDF}>Exportar PDF</button>
      </div>

      <ul>
        {relatorio.map((r) => (
          <li key={r.id}>
            Comanda #{r.id} - {r.cliente?.nome} - {r.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
