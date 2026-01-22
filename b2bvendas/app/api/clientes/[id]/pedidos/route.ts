import { NextRequest } from 'next/server'
import { requireRole } from '@/src/lib/auth'
import { ClienteController } from '@/src/modules/clientes/controller'
import { Role } from '@prisma/client'

const controller = new ClienteController()

/**
 * GET /api/clientes/[id]/pedidos
 * Get order history for this cliente with this fornecedor
 */
export async function GET(
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

    return await controller.getOrders(params.id, request, session.user.fornecedorId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
