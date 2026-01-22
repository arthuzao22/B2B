import { BaseRepository } from '@/lib/base'
import { Categoria } from '@prisma/client'
import { CategoriaCreateInput, CategoriaUpdateInput, CategoriaWithCount } from './types'

export class CategoriaRepository extends BaseRepository {
  async findAll(fornecedorId: string): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
    })
  }

  async findAllWithCount(fornecedorId: string): Promise<CategoriaWithCount[]> {
    return this.prisma.categoria.findMany({
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
      orderBy: { nome: 'asc' },
    })
  }

  async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { id },
    })
  }

  async findByIdWithRelations(id: string, fornecedorId: string): Promise<CategoriaWithCount | null> {
    return this.prisma.categoria.findFirst({
      where: { id },
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

  async findBySlug(slug: string, fornecedorId: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { slug },
    })
  }

  async slugExists(slug: string, fornecedorId: string, excludeId?: string): Promise<boolean> {
    const categoria = await this.prisma.categoria.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
    return !!categoria
  }

  async create(data: CategoriaCreateInput): Promise<Categoria> {
    return this.prisma.categoria.create({
      data,
    })
  }

  async update(id: string, data: CategoriaUpdateInput, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.delete({
      where: { id },
    })
  }

  async countProducts(id: string): Promise<number> {
    return this.prisma.produto.count({
      where: { categoriaId: id },
    })
  }

  async countSubcategories(id: string): Promise<number> {
    return this.prisma.categoria.count({
      where: { categoriaPaiId: id },
    })
  }

  async moveCategory(id: string, newParentId: string | null, fornecedorId: string): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data: { categoriaPaiId: newParentId },
    })
  }

  async findRootCategories(fornecedorId: string): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { categoriaPaiId: null },
      orderBy: { nome: 'asc' },
    })
  }

  async findSubcategories(parentId: string, fornecedorId: string): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { categoriaPaiId: parentId },
      orderBy: { nome: 'asc' },
    })
  }
}
