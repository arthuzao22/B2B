import { NextRequest } from 'next/server'
import { requireRole } from '@/src/lib/auth'
import { ClienteController } from '@/src/modules/clientes/controller'
import { Role } from '@prisma/client'

const controller = new ClienteController()

/**
 * POST /api/clientes/[id]/lista-preco
 * Assign price list to cliente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(Role.FORNECEDOR)

    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    return await controller.assignPriceList(params.id, request, session.user.fornecedorId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/clientes/[id]/lista-preco
 * Remove price list from cliente
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(Role.FORNECEDOR)

    if (!session.user.fornecedorId) {
      return Response.json(
        { error: 'Fornecedor ID não encontrado' },
        { status: 400 }
      )
    }

    return await controller.removePriceList(params.id, session.user.fornecedorId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
