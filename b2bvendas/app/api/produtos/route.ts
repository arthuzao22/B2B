import { NextRequest } from 'next/server'
import { requireRole } from '@/src/lib/auth'
import { ProdutoController } from '@/src/modules/produtos/controller'
import { Role } from '@prisma/client'

const controller = new ProdutoController()

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(Role.FORNECEDOR)
    
    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    return await controller.getAll(request, session.user.fornecedorId)
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

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(Role.FORNECEDOR)
    
    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    // Add fornecedorId to request body
    const body = await request.json()
    const requestWithFornecedor = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({
        ...body,
        fornecedorId: session.user.fornecedorId,
      }),
    })

    return await controller.create(requestWithFornecedor)
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
