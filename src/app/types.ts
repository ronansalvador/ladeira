export interface User {
  id?: number
  name: string
  email: string
  token: string
  role: string
}

export interface Cliente {
  id: number
  nome: string
  telefone: string
}

export interface Consumo {
  id: number
  descricao: string
  quantidade: number
  valor: number
  produto: Produto
}

export interface Comanda {
  valor: number
  id: number
  cliente: Cliente
  status: 'aberta' | 'fechada'
  createdAt: string
  closedAt?: string
  tipoEntrada: 'vip' | 'antecipado' | 'normal'
  consumos?: Consumo[]
  baile?: { id: number; nome: string; data: string } // 👈 novo
}

export interface Baile {
  id: number
  nome: string
  data: string
  comandas: Comanda[]
}

export interface Produto {
  id: number
  nome: string
  preco: number
}

export type Relatorio = {
  id: number
  cliente?: {
    nome: string
  }
  status: string
  closedAt?: string | null
}
