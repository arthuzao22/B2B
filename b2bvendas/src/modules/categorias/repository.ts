import { BaseRepository } from '@/src/lib/base'
import { Categoria } from '@prisma/client'
import { CategoriaCreateInput, CategoriaUpdateInput, CategoriaWithCount } from './types'

export class CategoriaRepository extends BaseRepository {
  /**
   * Find all categories for a fornecedor
   */
  async findAll(fornecedorId: string): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { fornecedorId },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
  }

  /**
   * Find all categories with counts
   */
  async findAllWithCount(fornecedorId: string): Promise<CategoriaWithCount[]> {
    return this.prisma.categoria.findMany({
      where: { fornecedorId },
      include: {
        _count: {
          select: {
            produtos: true,
            subcategorias: true,
          },
        },
        categoriaPai: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
  }

  /**
   * Find category by ID
   */
  async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { id, fornecedorId },
    })
  }

  /**
   * Find category by ID with subcategories
   */
  async findByIdWithRelations(id: string, fornecedorId: string): Promise<CategoriaWithCount | null> {
    return this.prisma.categoria.findFirst({
      where: { id, fornecedorId },
      include: {
        _count: {
          select: {
            produtos: true,
            subcategorias: true,
          },
        },
        categoriaPai: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string, fornecedorId: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { slug, fornecedorId },
    })
  }

  /**
   * Check if slug exists (excluding a specific category ID)
   */
  async slugExists(slug: string, fornecedorId: string, excludeId?: string): Promise<boolean> {
    const categoria = await this.prisma.categoria.findFirst({
      where: {
        slug,
        fornecedorId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
    return !!categoria
  }

  /**
   * Create new category
   */
  async create(data: CategoriaCreateInput): Promise<Categoria> {
    return this.prisma.categoria.create({
      data,
    })
  }

  /**
   * Update category
   */
  async update(id: string, data: CategoriaUpdateInput, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { 
        id,
        fornecedorId,
      },
      data,
    })
  }

  /**
   * Delete category (hard delete)
   */
  async delete(id: string, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.delete({
      where: { 
        id,
        fornecedorId,
      },
    })
  }

  /**
   * Soft delete - deactivate category
   */
  async softDelete(id: string, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { 
        id,
        fornecedorId,
      },
      data: { ativo: false },
    })
  }

  /**
   * Count products in category
   */
  async countProducts(id: string): Promise<number> {
    return this.prisma.produto.count({
      where: { categoriaId: id },
    })
  }

  /**
   * Count subcategories
   */
  async countSubcategories(id: string): Promise<number> {
    return this.prisma.categoria.count({
      where: { categoriaPaiId: id },
    })
  }

  /**
   * Move category to new parent
   */
  async moveCategory(id: string, newParentId: string | null, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { 
        id,
        fornecedorId,
      },
      data: { 
        categoriaPaiId: newParentId,
      },
    })
  }

  /**
   * Update category order
   */
  async updateOrder(id: string, ordem: number, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { 
        id,
        fornecedorId,
      },
      data: { ordem },
    })
  }

  /**
   * Get root categories (no parent)
   */
  async findRootCategories(fornecedorId: string): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { 
        fornecedorId,
        categoriaPaiId: null,
      },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
  }

  /**
   * Get subcategories of a category
   */
  async findSubcategories(parentId: string, fornecedorId: string): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { 
        fornecedorId,
        categoriaPaiId: parentId,
      },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
  }
}
