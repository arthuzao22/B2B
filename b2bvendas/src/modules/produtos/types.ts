import { Produto } from '@prisma/client'

export interface ProdutoCreateInput {
  fornecedorId: string
  categoriaId?: string | null
  nome: string
  descricao?: string | null
  sku: string
  precoBase: number
  imagens?: string[]
  unidade?: string
  quantidadeEstoque?: number
  estoqueMinimo?: number
  estoqueMaximo?: number | null
  ativo?: boolean
  destaque?: boolean
}

export interface ProdutoUpdateInput {
  categoriaId?: string | null
  nome?: string
  descricao?: string | null
  sku?: string
  precoBase?: number
  imagens?: string[]
  unidade?: string
  quantidadeEstoque?: number
  estoqueMinimo?: number
  estoqueMaximo?: number | null
  ativo?: boolean
  destaque?: boolean
}

export interface ProdutoFilters {
  search?: string
  categoriaId?: string
  ativo?: boolean
  destaque?: boolean
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

export type ProdutoResponse = Produto
