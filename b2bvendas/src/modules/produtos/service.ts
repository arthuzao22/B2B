import { BaseService } from '@/src/lib/base'
import { ValidationError, NotFoundError } from '@/src/lib/errors'
import { Produto } from '@prisma/client'
import { ProdutoRepository } from './repository'
import { ProdutoCreateInput, ProdutoUpdateInput, ProdutoFilters, PaginationParams, PaginatedResponse } from './types'

export class ProdutoService extends BaseService {
  private repository: ProdutoRepository

  constructor() {
    super()
    this.repository = new ProdutoRepository()
  }

  async findAll(
    fornecedorId: string,
    filters: ProdutoFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Produto>> {
    this.logger.info('Finding all produtos', { fornecedorId, filters, pagination })
    
    const result = await this.repository.findAll(fornecedorId, filters, pagination)
    
    this.logger.info('Found produtos', { 
      fornecedorId, 
      count: result.data.length,
      total: result.pagination.total 
    })
    
    return result
  }

  async findById(id: string, fornecedorId: string): Promise<Produto> {
    this.logger.info('Finding produto by id', { id, fornecedorId })
    
    const produto = await this.repository.findById(id, fornecedorId)
    
    if (!produto) {
      this.logger.warn('Produto not found', { id, fornecedorId })
      throw new NotFoundError('Produto não encontrado')
    }
    
    this.logger.info('Found produto', { id, nome: produto.nome })
    
    return produto
  }

  async create(data: ProdutoCreateInput): Promise<Produto> {
    this.logger.info('Creating produto', { data: { ...data, precoBase: data.precoBase } })
    
    // Validate SKU uniqueness
    await this.validateSkuUniqueness(data.sku, data.fornecedorId)
    
    // Validate stock constraints
    this.validateStockConstraints(data)
    
    const produto = await this.repository.create(data)
    
    this.logger.info('Produto created', { id: produto.id, nome: produto.nome })
    
    return produto
  }

  async update(id: string, data: ProdutoUpdateInput, fornecedorId: string): Promise<Produto> {
    this.logger.info('Updating produto', { id, fornecedorId, data })
    
    // Check if produto exists
    await this.findById(id, fornecedorId)
    
    // Validate SKU uniqueness if SKU is being updated
    if (data.sku) {
      await this.validateSkuUniqueness(data.sku, fornecedorId, id)
    }
    
    // Validate stock constraints
    this.validateStockConstraints(data)
    
    const produto = await this.repository.update(id, data, fornecedorId)
    
    this.logger.info('Produto updated', { id: produto.id, nome: produto.nome })
    
    return produto
  }

  async delete(id: string, fornecedorId: string): Promise<Produto> {
    this.logger.info('Deleting produto (soft delete)', { id, fornecedorId })
    
    // Check if produto exists
    await this.findById(id, fornecedorId)
    
    const produto = await this.repository.delete(id, fornecedorId)
    
    this.logger.info('Produto deleted', { id: produto.id, nome: produto.nome })
    
    return produto
  }

  private async validateSkuUniqueness(sku: string, fornecedorId: string, excludeId?: string): Promise<void> {
    const existingProduto = await this.repository.findBySku(sku, fornecedorId, excludeId)
    
    if (existingProduto) {
      this.logger.warn('SKU already exists', { sku, fornecedorId, existingId: existingProduto.id })
      throw new ValidationError(`SKU ${sku} já está em uso`)
    }
  }

  private validateStockConstraints(data: Partial<ProdutoCreateInput>): void {
    const { quantidadeEstoque, estoqueMinimo, estoqueMaximo } = data

    if (quantidadeEstoque !== undefined && estoqueMinimo !== undefined) {
      if (quantidadeEstoque < estoqueMinimo) {
        throw new ValidationError('Quantidade em estoque não pode ser menor que o estoque mínimo')
      }
    }

    if (quantidadeEstoque !== undefined && estoqueMaximo !== undefined && estoqueMaximo !== null) {
      if (quantidadeEstoque > estoqueMaximo) {
        throw new ValidationError('Quantidade em estoque não pode ser maior que o estoque máximo')
      }
    }

    if (estoqueMinimo !== undefined && estoqueMaximo !== undefined && estoqueMaximo !== null) {
      if (estoqueMinimo > estoqueMaximo) {
        throw new ValidationError('Estoque mínimo não pode ser maior que o estoque máximo')
      }
    }
  }
}
