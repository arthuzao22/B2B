import { BaseService } from '@/src/lib/base'
import { ValidationError, NotFoundError } from '@/src/lib/errors'
import { Cliente, ClienteFornecedor } from '@prisma/client'
import { ClienteRepository } from './repository'
import {
  ClienteCreateInput,
  ClienteUpdateInput,
  ClienteFilters,
  PaginationParams,
  PaginatedResponse,
  ClienteWithAssociation,
  ClienteStats,
  CreateOrAssociateInput,
} from './types'

export class ClienteService extends BaseService {
  private repository: ClienteRepository

  constructor() {
    super()
    this.repository = new ClienteRepository()
  }

  /**
   * Get all clientes associated with fornecedor
   */
  async findAll(
    fornecedorId: string,
    filters: ClienteFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ClienteWithAssociation>> {
    this.logger.info('Finding all clientes', { fornecedorId, filters, pagination })

    const result = await this.repository.findAll(fornecedorId, filters, pagination)

    this.logger.info('Found clientes', {
      fornecedorId,
      count: result.data.length,
      total: result.pagination.total,
    })

    return result
  }

  /**
   * Get cliente by ID
   */
  async findById(id: string, fornecedorId: string): Promise<ClienteWithAssociation> {
    this.logger.info('Finding cliente by id', { id, fornecedorId })

    const cliente = await this.repository.findById(id, fornecedorId)

    if (!cliente) {
      this.logger.warn('Cliente not found or not associated', { id, fornecedorId })
      throw new NotFoundError('Cliente não encontrado ou não associado')
    }

    this.logger.info('Found cliente', { id, razaoSocial: cliente.razaoSocial })

    return cliente
  }

  /**
   * Create new cliente and associate with fornecedor OR just associate if already exists
   */
  async createOrAssociate(data: CreateOrAssociateInput): Promise<ClienteWithAssociation> {
    this.logger.info('Creating or associating cliente', { 
      cnpj: data.cnpj, 
      fornecedorId: data.fornecedorId 
    })

    // Validate CNPJ format
    const cleanCnpj = this.validateAndCleanCnpj(data.cnpj)

    // Check if cliente already exists
    const existingCliente = await this.repository.findByCnpj(cleanCnpj)

    let clienteId: string

    if (existingCliente) {
      this.logger.info('Cliente already exists', { 
        id: existingCliente.id, 
        cnpj: cleanCnpj 
      })

      // Check if association already exists
      const existingAssociation = await this.repository.findAssociation(
        existingCliente.id,
        data.fornecedorId
      )

      if (existingAssociation && existingAssociation.ativo) {
        this.logger.warn('Association already exists', {
          clienteId: existingCliente.id,
          fornecedorId: data.fornecedorId,
        })
        throw new ValidationError('Cliente já está associado a este fornecedor')
      }

      if (existingAssociation && !existingAssociation.ativo) {
        // Reactivate existing association
        await this.reactivateAssociation(existingAssociation.id, data.listaPrecoId)
      } else {
        // Create new association
        await this.repository.createAssociation(
          existingCliente.id,
          data.fornecedorId,
          data.listaPrecoId
        )
      }

      clienteId = existingCliente.id
    } else {
      // Create new cliente - need to create usuario first
      const usuario = await this.createUsuario({
        nome: data.razaoSocial,
        email: data.email || `${cleanCnpj}@temp.com`,
      })

      const newCliente = await this.repository.create({
        usuarioId: usuario.id,
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        cnpj: cleanCnpj,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        ativo: true,
      })

      // Create association
      await this.repository.createAssociation(
        newCliente.id,
        data.fornecedorId,
        data.listaPrecoId
      )

      this.logger.info('Cliente created and associated', {
        id: newCliente.id,
        cnpj: cleanCnpj,
        fornecedorId: data.fornecedorId,
      })

      clienteId = newCliente.id
    }

    // Return the cliente with association
    const cliente = await this.findById(clienteId, data.fornecedorId)

    return cliente
  }

  /**
   * Update cliente info
   */
  async update(
    id: string,
    data: ClienteUpdateInput,
    fornecedorId: string
  ): Promise<ClienteWithAssociation> {
    this.logger.info('Updating cliente', { id, fornecedorId, data })

    // Check if cliente exists and is associated
    await this.findById(id, fornecedorId)

    const updated = await this.repository.update(id, data, fornecedorId)

    this.logger.info('Cliente updated', { id: updated.id, razaoSocial: updated.razaoSocial })

    return this.findById(id, fornecedorId)
  }

  /**
   * Remove association (not delete cliente)
   */
  async removeAssociation(id: string, fornecedorId: string): Promise<void> {
    this.logger.info('Removing cliente association', { id, fornecedorId })

    // Check if cliente exists and is associated
    await this.findById(id, fornecedorId)

    await this.repository.removeAssociation(id, fornecedorId)

    this.logger.info('Cliente association removed', { id, fornecedorId })
  }

  /**
   * Assign price list to cliente
   */
  async assignPriceList(
    clienteId: string,
    fornecedorId: string,
    listaPrecoId: string
  ): Promise<ClienteFornecedor> {
    this.logger.info('Assigning price list to cliente', {
      clienteId,
      fornecedorId,
      listaPrecoId,
    })

    // Check if cliente exists and is associated
    await this.findById(clienteId, fornecedorId)

    // Verify price list exists and belongs to fornecedor
    await this.verifyListaPreco(listaPrecoId, fornecedorId)

    const association = await this.repository.assignPriceList(
      clienteId,
      fornecedorId,
      listaPrecoId
    )

    this.logger.info('Price list assigned', {
      clienteId,
      fornecedorId,
      listaPrecoId,
    })

    return association
  }

  /**
   * Remove price list from cliente
   */
  async removePriceList(clienteId: string, fornecedorId: string): Promise<ClienteFornecedor> {
    this.logger.info('Removing price list from cliente', { clienteId, fornecedorId })

    // Check if cliente exists and is associated
    await this.findById(clienteId, fornecedorId)

    const association = await this.repository.removePriceList(clienteId, fornecedorId)

    this.logger.info('Price list removed', { clienteId, fornecedorId })

    return association
  }

  /**
   * Get cliente order history
   */
  async getClienteOrders(
    clienteId: string,
    fornecedorId: string,
    pagination: PaginationParams = {}
  ) {
    this.logger.info('Getting cliente orders', { clienteId, fornecedorId, pagination })

    // Check if cliente exists and is associated
    await this.findById(clienteId, fornecedorId)

    const result = await this.repository.getClienteOrders(clienteId, fornecedorId, pagination)

    this.logger.info('Found cliente orders', {
      clienteId,
      fornecedorId,
      count: result.data.length,
    })

    return result
  }

  /**
   * Get cliente statistics
   */
  async getClienteStats(clienteId: string, fornecedorId: string): Promise<ClienteStats> {
    this.logger.info('Getting cliente stats', { clienteId, fornecedorId })

    // Check if cliente exists and is associated
    await this.findById(clienteId, fornecedorId)

    const stats = await this.repository.getClienteStats(clienteId, fornecedorId)

    this.logger.info('Cliente stats retrieved', { clienteId, fornecedorId, stats })

    return stats
  }

  /**
   * Validate and clean CNPJ
   */
  private validateAndCleanCnpj(cnpj: string): string {
    const cleaned = cnpj.replace(/[^\d]/g, '')

    if (cleaned.length !== 14) {
      throw new ValidationError('CNPJ deve ter 14 dígitos')
    }

    return cleaned
  }

  /**
   * Validate CNPJ uniqueness
   */
  async validateCnpjUniqueness(cnpj: string, excludeId?: string): Promise<boolean> {
    const cleaned = this.validateAndCleanCnpj(cnpj)
    const existing = await this.repository.findByCnpj(cleaned, excludeId)
    return !existing
  }

  /**
   * Create usuario for cliente
   */
  private async createUsuario(data: { nome: string; email: string }) {
    return await this.repository.db.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: '', // Will be set when cliente activates account
        role: 'CLIENT',
        ativo: true,
      },
    })
  }

  /**
   * Reactivate existing association
   */
  private async reactivateAssociation(associationId: string, listaPrecoId?: string | null) {
    return await this.repository.db.clienteFornecedor.update({
      where: { id: associationId },
      data: { 
        ativo: true,
        listaPrecoId,
      },
    })
  }

  /**
   * Verify lista preço exists and belongs to fornecedor
   */
  private async verifyListaPreco(listaPrecoId: string, fornecedorId: string) {
    const listaPreco = await this.repository.db.listaPreco.findFirst({
      where: {
        id: listaPrecoId,
        fornecedorId,
        ativo: true,
      },
    })

    if (!listaPreco) {
      throw new NotFoundError('Lista de preço não encontrada')
    }

    return listaPreco
  }
}
