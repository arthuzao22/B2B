import { BaseRepository } from '@/src/lib/base'
import { Cliente, ClienteFornecedor, Prisma } from '@prisma/client'
import { 
  ClienteCreateInput, 
  ClienteUpdateInput, 
  ClienteFilters, 
  PaginationParams, 
  PaginatedResponse,
  ClienteWithAssociation,
  ClienteStats
} from './types'

export class ClienteRepository extends BaseRepository {
  // Expose prisma for service layer access
  public get db() {
    return this.prisma
  }

  /**
   * Find all clientes associated with a fornecedor
   */
  async findAll(
    fornecedorId: string,
    filters: ClienteFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ClienteWithAssociation>> {
    const { search, ativo, cidade, estado } = filters
    const { page = 1, limit = 10 } = pagination

    const where: Prisma.ClienteWhereInput = {
      fornecedores: {
        some: {
          fornecedorId,
          ativo: true,
        },
      },
      ...(search && {
        OR: [
          { razaoSocial: { contains: search, mode: 'insensitive' } },
          { nomeFantasia: { contains: search, mode: 'insensitive' } },
          { cnpj: { contains: search.replace(/[^\d]/g, '') } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(ativo !== undefined && { ativo }),
      ...(cidade && { cidade: { contains: cidade, mode: 'insensitive' } }),
      ...(estado && { estado }),
    }

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { razaoSocial: 'asc' },
        include: {
          fornecedores: {
            where: { fornecedorId },
            include: {
              listaPreco: {
                select: {
                  id: true,
                  nome: true,
                  descricao: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.cliente.count({ where }),
    ])

    // Transform to include single association
    const transformedData = data.map(cliente => ({
      ...cliente,
      associacao: cliente.fornecedores[0],
    }))

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Find cliente by ID if associated with fornecedor
   */
  async findById(id: string, fornecedorId: string): Promise<ClienteWithAssociation | null> {
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id,
        fornecedores: {
          some: {
            fornecedorId,
            ativo: true,
          },
        },
      },
      include: {
        fornecedores: {
          where: { fornecedorId },
          include: {
            listaPreco: {
              select: {
                id: true,
                nome: true,
                descricao: true,
              },
            },
          },
        },
      },
    })

    if (!cliente) return null

    return {
      ...cliente,
      associacao: cliente.fornecedores[0],
    }
  }

  /**
   * Find cliente by CNPJ
   */
  async findByCnpj(cnpj: string, excludeId?: string): Promise<Cliente | null> {
    return this.prisma.cliente.findFirst({
      where: {
        cnpj: cnpj.replace(/[^\d]/g, ''),
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
  }

  /**
   * Create new cliente (without association)
   */
  async create(data: ClienteCreateInput): Promise<Cliente> {
    return this.prisma.cliente.create({
      data: {
        ...data,
        cnpj: data.cnpj.replace(/[^\d]/g, ''),
      },
    })
  }

  /**
   * Update cliente info
   */
  async update(id: string, data: ClienteUpdateInput, fornecedorId: string): Promise<Cliente> {
    // Verify association first
    const cliente = await this.findById(id, fornecedorId)
    if (!cliente) {
      throw new Error('Cliente not found or not associated')
    }

    return this.prisma.cliente.update({
      where: { id },
      data,
    })
  }

  /**
   * Soft delete - deactivate cliente
   */
  async delete(id: string, fornecedorId: string): Promise<Cliente> {
    // Verify association first
    const cliente = await this.findById(id, fornecedorId)
    if (!cliente) {
      throw new Error('Cliente not found or not associated')
    }

    return this.prisma.cliente.update({
      where: { id },
      data: { ativo: false },
    })
  }

  /**
   * Check if association exists
   */
  async findAssociation(clienteId: string, fornecedorId: string): Promise<ClienteFornecedor | null> {
    return this.prisma.clienteFornecedor.findFirst({
      where: {
        clienteId,
        fornecedorId,
      },
    })
  }

  /**
   * Create association between cliente and fornecedor
   */
  async createAssociation(
    clienteId: string,
    fornecedorId: string,
    listaPrecoId?: string | null
  ): Promise<ClienteFornecedor> {
    return this.prisma.clienteFornecedor.create({
      data: {
        clienteId,
        fornecedorId,
        listaPrecoId,
        ativo: true,
      },
    })
  }

  /**
   * Remove association (soft delete)
   */
  async removeAssociation(clienteId: string, fornecedorId: string): Promise<ClienteFornecedor> {
    const association = await this.findAssociation(clienteId, fornecedorId)
    if (!association) {
      throw new Error('Association not found')
    }

    return this.prisma.clienteFornecedor.update({
      where: { id: association.id },
      data: { ativo: false },
    })
  }

  /**
   * Assign price list to cliente-fornecedor association
   */
  async assignPriceList(
    clienteId: string,
    fornecedorId: string,
    listaPrecoId: string
  ): Promise<ClienteFornecedor> {
    const association = await this.findAssociation(clienteId, fornecedorId)
    if (!association) {
      throw new Error('Association not found')
    }

    return this.prisma.clienteFornecedor.update({
      where: { id: association.id },
      data: { listaPrecoId },
    })
  }

  /**
   * Remove price list from cliente-fornecedor association
   */
  async removePriceList(clienteId: string, fornecedorId: string): Promise<ClienteFornecedor> {
    const association = await this.findAssociation(clienteId, fornecedorId)
    if (!association) {
      throw new Error('Association not found')
    }

    return this.prisma.clienteFornecedor.update({
      where: { id: association.id },
      data: { listaPrecoId: null },
    })
  }

  /**
   * Get cliente orders with this fornecedor
   */
  async getClienteOrders(
    clienteId: string,
    fornecedorId: string,
    pagination: PaginationParams = {}
  ) {
    const { page = 1, limit = 10 } = pagination

    const where = {
      clienteId,
      fornecedorId,
    }

    const [data, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.pedido.count({ where }),
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

  /**
   * Get cliente statistics
   */
  async getClienteStats(clienteId: string, fornecedorId: string): Promise<ClienteStats> {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        clienteId,
        fornecedorId,
        status: {
          notIn: ['CANCELADO'],
        },
      },
      select: {
        valorTotal: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const totalOrders = pedidos.length
    const totalSpent = pedidos.reduce((sum, p) => sum + Number(p.valorTotal), 0)
    const lastOrderDate = pedidos.length > 0 ? pedidos[0].createdAt : null
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

    return {
      totalOrders,
      totalSpent,
      lastOrderDate,
      averageOrderValue,
    }
  }
}
