import { BaseController } from '@/src/lib/base'
import { NextRequest, NextResponse } from 'next/server'
import { ProdutoService } from './service'
import { createProdutoSchema, updateProdutoSchema, produtoFiltersSchema } from './validation'

export class ProdutoController extends BaseController {
  private service: ProdutoService

  constructor() {
    super()
    this.service = new ProdutoService()
  }

  async getAll(request: NextRequest, fornecedorId: string): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      
      const filters = produtoFiltersSchema.parse({
        search: searchParams.get('search'),
        categoriaId: searchParams.get('categoriaId'),
        ativo: searchParams.get('ativo'),
        destaque: searchParams.get('destaque'),
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
      })

      const { page, limit, ...produtoFilters } = filters

      const result = await this.service.findAll(
        fornecedorId,
        produtoFilters,
        { page, limit }
      )

      return this.success(result)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getById(id: string, fornecedorId: string): Promise<NextResponse> {
    try {
      const produto = await this.service.findById(id, fornecedorId)
      return this.success(produto)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = createProdutoSchema.parse(body)
      
      const produto = await this.service.create(validatedData)
      
      return this.success(produto, 201)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async update(id: string, request: NextRequest, fornecedorId: string): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = updateProdutoSchema.parse(body)
      
      const produto = await this.service.update(id, validatedData, fornecedorId)
      
      return this.success(produto)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async delete(id: string, fornecedorId: string): Promise<NextResponse> {
    try {
      const produto = await this.service.delete(id, fornecedorId)
      return this.success({ message: 'Produto desativado com sucesso', produto })
    } catch (error) {
      return this.handleError(error)
    }
  }
}
