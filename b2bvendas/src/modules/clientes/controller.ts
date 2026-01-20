import { NextRequest, NextResponse } from 'next/server'
import { BaseController } from '@/src/lib/base'
import { ClienteService } from './service'
import {
  createOrAssociateSchema,
  updateClienteSchema,
  assignPriceListSchema,
  clienteFiltersSchema,
} from './validation'

export class ClienteController extends BaseController {
  private service: ClienteService

  constructor() {
    super()
    this.service = new ClienteService()
  }

  /**
   * GET /api/clientes - List all clientes associated with fornecedor
   */
  async getAll(request: NextRequest, fornecedorId: string): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      
      const filters = clienteFiltersSchema.parse({
        search: searchParams.get('search') || undefined,
        ativo: searchParams.get('ativo') || undefined,
        cidade: searchParams.get('cidade') || undefined,
        estado: searchParams.get('estado') || undefined,
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 10,
      })

      const { page, limit, ...restFilters } = filters

      const result = await this.service.findAll(
        fornecedorId,
        restFilters,
        { page, limit }
      )

      return this.success(result)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/clientes/[id] - Get cliente details
   */
  async getById(id: string, fornecedorId: string): Promise<NextResponse> {
    try {
      const cliente = await this.service.findById(id, fornecedorId)
      return this.success(cliente)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * POST /api/clientes - Create or associate cliente
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const data = createOrAssociateSchema.parse(body)

      const cliente = await this.service.createOrAssociate(data)

      return this.success(cliente, 201)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * PUT /api/clientes/[id] - Update cliente info
   */
  async update(
    id: string,
    request: NextRequest,
    fornecedorId: string
  ): Promise<NextResponse> {
    try {
      const body = await request.json()
      const data = updateClienteSchema.parse(body)

      const cliente = await this.service.update(id, data, fornecedorId)

      return this.success(cliente)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * DELETE /api/clientes/[id] - Remove association
   */
  async delete(id: string, fornecedorId: string): Promise<NextResponse> {
    try {
      await this.service.removeAssociation(id, fornecedorId)
      return this.success({ message: 'Associação removida com sucesso' })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * POST /api/clientes/[id]/lista-preco - Assign price list
   */
  async assignPriceList(
    id: string,
    request: NextRequest,
    fornecedorId: string
  ): Promise<NextResponse> {
    try {
      const body = await request.json()
      const { listaPrecoId } = assignPriceListSchema.parse(body)

      await this.service.assignPriceList(id, fornecedorId, listaPrecoId)

      return this.success({ message: 'Lista de preço atribuída com sucesso' })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * DELETE /api/clientes/[id]/lista-preco - Remove price list
   */
  async removePriceList(id: string, fornecedorId: string): Promise<NextResponse> {
    try {
      await this.service.removePriceList(id, fornecedorId)
      return this.success({ message: 'Lista de preço removida com sucesso' })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/clientes/[id]/pedidos - Get cliente orders
   */
  async getOrders(
    id: string,
    request: NextRequest,
    fornecedorId: string
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')

      const result = await this.service.getClienteOrders(id, fornecedorId, { page, limit })

      return this.success(result)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/clientes/[id]/stats - Get cliente statistics
   */
  async getStats(id: string, fornecedorId: string): Promise<NextResponse> {
    try {
      const stats = await this.service.getClienteStats(id, fornecedorId)
      return this.success(stats)
    } catch (error) {
      return this.handleError(error)
    }
  }
}
