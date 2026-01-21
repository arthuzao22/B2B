import { BaseRepository } from '@/src/lib/base'
import { Produto, Prisma } from '@prisma/client'
import { ProdutoCreateInput, ProdutoUpdateInput, ProdutoFilters, PaginationParams, PaginatedResponse } from './types'

export class ProdutoRepository extends BaseRepository {
  async findAll(
    fornecedorId: string,
    filters: ProdutoFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Produto>> {
    const { search, categoriaId, ativo, destaque } = filters
    const { page = 1, limit = 10 } = pagination

    const where: Prisma.ProdutoWhereInput = {
      fornecedorId,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { descricao: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoriaId && { categoriaId }),
      ...(ativo !== undefined && { ativo }),
      ...(destaque !== undefined && { destaque }),
    }

    const [data, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categoria: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      }),
      this.prisma.produto.count({ where }),
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string, fornecedorId: string): Promise<Produto | null> {
    return this.prisma.produto.findFirst({
      where: { 
        id, 
        fornecedorId 
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })
  }

  async findBySku(sku: string, fornecedorId: string, excludeId?: string): Promise<Produto | null> {
    return this.prisma.produto.findFirst({
      where: {
        sku,
        fornecedorId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
  }

  async create(data: ProdutoCreateInput): Promise<Produto> {
    return this.prisma.produto.create({
      data: {
        ...data,
        precoBase: new Prisma.Decimal(data.precoBase),
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })
  }

  async update(id: string, data: ProdutoUpdateInput, fornecedorId: string): Promise<Produto> {
    return this.prisma.produto.update({
      where: { 
        id,
        fornecedorId,
      },
      data: {
        ...data,
        ...(data.precoBase !== undefined && { 
          precoBase: new Prisma.Decimal(data.precoBase) 
        }),
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })
  }

  async delete(id: string, fornecedorId: string): Promise<Produto> {
    return this.prisma.produto.update({
      where: { 
        id,
        fornecedorId,
      },
      data: { ativo: false },
    })
  }

  async hardDelete(id: string, fornecedorId: string): Promise<Produto> {
    return this.prisma.produto.delete({
      where: { 
        id,
        fornecedorId,
      },
    })
  }
}
