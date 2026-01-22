import { NextRequest, NextResponse } from 'next/server'
import { BaseController } from '@/lib/base'
import { CategoriaService } from './service'
import { createCategoriaSchema, updateCategoriaSchema } from './validation'

export class CategoriaController extends BaseController {
  private service: CategoriaService

  constructor() {
    super()
    this.service = new CategoriaService()
  }

  /**
   * GET /api/categorias - Get all categories as tree
   */
  async getTree(request: NextRequest, fornecedorId: string) {
    try {
      const tree = await this.service.findTree(fornecedorId)
      return NextResponse.json(tree)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/categorias?flat=true - Get all categories as flat list
   */
  async getAll(request: NextRequest, fornecedorId: string) {
    try {
      const { searchParams } = new URL(request.url)
      const flat = searchParams.get('flat') === 'true'
      const withCount = searchParams.get('withCount') === 'true'

      if (flat) {
        if (withCount) {
          const categories = await this.service.findAllWithCount(fornecedorId)
          return NextResponse.json(categories)
        } else {
          const categories = await this.service.findAll(fornecedorId)
          return NextResponse.json(categories)
        }
      } else {
        const tree = await this.service.findTree(fornecedorId)
        return NextResponse.json(tree)
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * POST /api/categorias - Create new category
   */
  async create(request: NextRequest, fornecedorId: string) {
    try {
      const body = await request.json()
      const data = createCategoriaSchema.parse({
        ...body,
        fornecedorId,
      })

      const categoria = await this.service.create(data)
      return NextResponse.json(categoria, { status: 201 })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/categorias/[id] - Get category by ID
   */
  async getById(id: string, fornecedorId: string) {
    try {
      const categoria = await this.service.findById(id, fornecedorId)
      
      if (!categoria) {
        return NextResponse.json(
          { error: 'Categoria não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json(categoria)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * PUT /api/categorias/[id] - Update category
   */
  async update(id: string, request: NextRequest, fornecedorId: string) {
    try {
      const body = await request.json()
      const data = updateCategoriaSchema.parse(body)

      const categoria = await this.service.update(id, data, fornecedorId)
      return NextResponse.json(categoria)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * DELETE /api/categorias/[id] - Delete category
   */
  async delete(id: string, request: NextRequest, fornecedorId: string) {
    try {
      const { searchParams } = new URL(request.url)
      const force = searchParams.get('force') === 'true'

      await this.service.delete(id, fornecedorId, force)
      return NextResponse.json({ message: 'Categoria excluída com sucesso' })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * PATCH /api/categorias/[id]/move - Move category to new parent
   */
  async move(id: string, request: NextRequest, fornecedorId: string) {
    try {
      const body = await request.json()
      const { newParentId } = body

      const categoria = await this.service.moveCategory(id, newParentId, fornecedorId)
      return NextResponse.json(categoria)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/categorias/[id]/path - Get category breadcrumb path
   */
  async getPath(id: string, fornecedorId: string) {
    try {
      const path = await this.service.getCategoryPath(id, fornecedorId)
      return NextResponse.json(path)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * GET /api/categorias/[id]/subcategories - Get subcategories
   */
  async getSubcategories(id: string, fornecedorId: string) {
    try {
      const subcategories = await this.service.findSubcategories(id, fornecedorId)
      return NextResponse.json(subcategories)
    } catch (error) {
      return this.handleError(error)
    }
  }
}
