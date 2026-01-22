import { Cliente, ClienteFornecedor, Pedido } from '@prisma/client'

export interface ClienteCreateInput {
  usuarioId: string
  razaoSocial: string
  nomeFantasia?: string | null
  cnpj: string
  telefone?: string | null
  whatsapp?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  ativo?: boolean
}

export interface ClienteUpdateInput {
  razaoSocial?: string
  nomeFantasia?: string | null
  telefone?: string | null
  whatsapp?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  ativo?: boolean
}

export interface ClienteFilters {
  search?: string
  ativo?: boolean
  cidade?: string
  estado?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ClienteWithAssociation extends Cliente {
  associacao?: ClienteFornecedor & {
    listaPreco?: {
      id: string
      nome: string
      descricao?: string | null
    } | null
  }
}

export interface ClienteStats {
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date | null
  averageOrderValue: number
}

export interface AssociateClienteInput {
  clienteId: string
  fornecedorId: string
  listaPrecoId?: string | null
}

export interface CreateOrAssociateInput {
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string | null
  telefone?: string | null
  whatsapp?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  fornecedorId: string
  listaPrecoId?: string | null
}

export type ClienteResponse = ClienteWithAssociation
