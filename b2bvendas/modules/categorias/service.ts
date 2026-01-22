import { BaseService } from '@/lib/base'
import { generateSlug } from '@/lib/utils'
import { Categoria } from '@prisma/client'
import { CategoriaRepository } from './repository'
import { CategoriaCreateInput, CategoriaUpdateInput, CategoriaTree, CategoriaWithCount, CategoryPath } from './types'
import { buildCategoryTree, getCategoryPath, wouldCreateCircularReference, getDescendantIds } from './helpers'

export class CategoriaService extends BaseService {
  private repository: CategoriaRepository

  constructor() {
    super()
    this.repository = new CategoriaRepository()
  }

  /**
   * Get all categories as flat list
   */
  async findAll(fornecedorId: string): Promise<Categoria[]> {
    this.logger.info('Finding all categories', { fornecedorId })
    return this.repository.findAll(fornecedorId)
  }

  /**
   * Get all categories with counts
   */
  async findAllWithCount(fornecedorId: string): Promise<CategoriaWithCount[]> {
    this.logger.info('Finding all categories with counts', { fornecedorId })
    return this.repository.findAllWithCount(fornecedorId)
  }

  /**
   * Get categories as hierarchical tree
   */
  async findTree(fornecedorId: string): Promise<CategoriaTree[]> {
    this.logger.info('Building category tree', { fornecedorId })
    const categories = await this.repository.findAll(fornecedorId)
    return buildCategoryTree(categories)
  }

  /**
   * Get category by ID
   */
  async findById(id: string, fornecedorId: string): Promise<CategoriaWithCount | null> {
    this.logger.info('Finding category by ID', { id, fornecedorId })
    return this.repository.findByIdWithRelations(id, fornecedorId)
  }

  /**
   * Get category by slug
   */
  async findBySlug(slug: string, fornecedorId: string): Promise<Categoria | null> {
    this.logger.info('Finding category by slug', { slug, fornecedorId })
    return this.repository.findBySlug(slug, fornecedorId)
  }

  /**
   * Get category path (breadcrumb)
   */
  async getCategoryPath(categoryId: string, fornecedorId: string): Promise<CategoryPath[]> {
    this.logger.info('Getting category path', { categoryId, fornecedorId })
    const allCategories = await this.repository.findAll(fornecedorId)
    return getCategoryPath(categoryId, allCategories)
  }

  /**
   * Create new category
   */
  async create(data: Omit<CategoriaCreateInput, 'slug'> & { slug?: string }): Promise<Categoria> {
    this.logger.info('Creating category', { data })

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.nome)

    // Validate slug is unique
    const slugExists = await this.repository.slugExists(slug, data.fornecedorId)
    if (slugExists) {
      throw new Error('Já existe uma categoria com este slug')
    }

    // Validate parent category exists if provided
    if (data.categoriaPaiId) {
      const parentExists = await this.repository.findById(data.categoriaPaiId, data.fornecedorId)
      if (!parentExists) {
        throw new Error('Categoria pai não encontrada')
      }
    }

    const categoria = await this.repository.create({
      ...data,
      slug,
    })

    this.logger.info('Category created', { id: categoria.id })
    return categoria
  }

  /**
   * Update category
   */
  async update(id: string, data: CategoriaUpdateInput, fornecedorId: string): Promise<Categoria> {
    this.logger.info('Updating category', { id, data, fornecedorId })

    // Check if category exists
    const existing = await this.repository.findById(id, fornecedorId)
    if (!existing) {
      throw new Error('Categoria não encontrada')
    }

    // Generate slug if nome is being updated and slug not provided
    if (data.nome && !data.slug) {
      data.slug = generateSlug(data.nome)
    }

    // Validate slug is unique if being updated
    if (data.slug) {
      const slugExists = await this.repository.slugExists(data.slug, fornecedorId, id)
      if (slugExists) {
        throw new Error('Já existe uma categoria com este slug')
      }
    }

    // Validate parent category and circular references
    if (data.categoriaPaiId !== undefined) {
      if (data.categoriaPaiId) {
        // Check if parent exists
        const parentExists = await this.repository.findById(data.categoriaPaiId, fornecedorId)
        if (!parentExists) {
          throw new Error('Categoria pai não encontrada')
        }

        // Check for circular references
        const allCategories = await this.repository.findAll(fornecedorId)
        if (wouldCreateCircularReference(id, data.categoriaPaiId, allCategories)) {
          throw new Error('Esta operação criaria uma referência circular')
        }
      }
    }

    const categoria = await this.repository.update(id, data, fornecedorId)
    this.logger.info('Category updated', { id })
    return categoria
  }

  /**
   * Delete category
   */
  async delete(id: string, fornecedorId: string, force: boolean = false): Promise<void> {
    this.logger.info('Deleting category', { id, fornecedorId, force })

    // Check if category exists
    const existing = await this.repository.findById(id, fornecedorId)
    if (!existing) {
      throw new Error('Categoria não encontrada')
    }

    // Check if has products
    const productCount = await this.repository.countProducts(id)
    if (productCount > 0 && !force) {
      throw new Error(
        `Esta categoria possui ${productCount} produto(s) associado(s). ` +
        'Remova os produtos ou use a opção de exclusão forçada.'
      )
    }

    // Check if has subcategories
    const subcategoryCount = await this.repository.countSubcategories(id)
    if (subcategoryCount > 0 && !force) {
      throw new Error(
        `Esta categoria possui ${subcategoryCount} subcategoria(s). ` +
        'Remova as subcategorias ou use a opção de exclusão forçada.'
      )
    }

    await this.repository.delete(id, fornecedorId)
    this.logger.info('Category deleted', { id })
  }

  /**
   * Move category to new parent
   */
  async moveCategory(id: string, newParentId: string | null, fornecedorId: string): Promise<Categoria> {
    this.logger.info('Moving category', { id, newParentId, fornecedorId })

    const existing = await this.repository.findById(id, fornecedorId)
    if (!existing) {
      throw new Error('Categoria não encontrada')
    }

    // Validate new parent exists
    if (newParentId) {
      const parentExists = await this.repository.findById(newParentId, fornecedorId)
      if (!parentExists) {
        throw new Error('Categoria pai não encontrada')
      }

      // Check for circular references
      const allCategories = await this.repository.findAll(fornecedorId)
      if (wouldCreateCircularReference(id, newParentId, allCategories)) {
        throw new Error('Esta operação criaria uma referência circular')
      }
    }

    return this.repository.moveCategory(id, newParentId, fornecedorId)
  }

  /**
   * Get root categories
   */
  async findRootCategories(fornecedorId: string): Promise<Categoria[]> {
    this.logger.info('Finding root categories', { fornecedorId })
    return this.repository.findRootCategories(fornecedorId)
  }

  /**
   * Get subcategories
   */
  async findSubcategories(parentId: string, fornecedorId: string): Promise<Categoria[]> {
    this.logger.info('Finding subcategories', { parentId, fornecedorId })
    return this.repository.findSubcategories(parentId, fornecedorId)
  }

  /**
   * Get all descendant category IDs
   */
  async getDescendantIds(categoryId: string, fornecedorId: string): Promise<string[]> {
    this.logger.info('Getting descendant IDs', { categoryId, fornecedorId })
    const allCategories = await this.repository.findAll(fornecedorId)
    return getDescendantIds(categoryId, allCategories)
  }
}
