import { Categoria } from '@prisma/client'

export interface CategoriaCreateInput {
  fornecedorId: string
  nome: string
  slug: string
  descricao?: string | null
  imagem?: string | null
  categoriaPaiId?: string | null
  ativo?: boolean
  ordem?: number
}

export interface CategoriaUpdateInput {
  nome?: string
  slug?: string
  descricao?: string | null
  imagem?: string | null
  categoriaPaiId?: string | null
  ativo?: boolean
  ordem?: number
}

export interface CategoriaTree extends Categoria {
  subcategorias: CategoriaTree[]
  _count?: {
    produtos: number
  }
}

export interface CategoriaWithCount extends Categoria {
  _count: {
    produtos: number
    subcategorias: number
  }
  categoriaPai?: {
    id: string
    nome: string
  } | null
}

export interface CategoryPath {
  id: string
  nome: string
  slug: string
}
