import { NextRequest } from 'next/server'
import { requireRole } from '@/src/lib/auth'
import { ProdutoController } from '@/src/modules/produtos/controller'
import { Role } from '@prisma/client'

const controller = new ProdutoController()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(Role.FORNECEDOR)
    
    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    const { id } = await params
    return await controller.getById(id, session.user.fornecedorId)
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
    const session = await requireRole(Role.FORNECEDOR)
    
    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    const { id } = await params
    return await controller.update(id, request, session.user.fornecedorId)
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
    const session = await requireRole(Role.FORNECEDOR)
    
    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    const { id } = await params
    return await controller.delete(id, session.user.fornecedorId)
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
