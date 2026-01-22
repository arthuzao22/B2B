import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { CategoriaController } from '@/modules/categorias/controller'

const controller = new CategoriaController()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['fornecedor'])

    if (!user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    const { id } = await params
    return await controller.getById(id, user.fornecedorId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['fornecedor'])

    if (!user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    const { id } = await params
    return await controller.update(id, request, user.fornecedorId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['fornecedor'])

    if (!user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    const { id } = await params
    return await controller.delete(id, request, user.fornecedorId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
