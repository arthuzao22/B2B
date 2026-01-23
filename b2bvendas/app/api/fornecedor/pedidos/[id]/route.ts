import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock order details - replace with real database queries
const getOrderDetails = (id: string) => {
  return {
    id,
    numero: `PED-2024-${id.padStart(3, '0')}`,
    data: '2024-01-15T10:30:00',
    status: 'pending',
    cliente: {
      nome: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com.br',
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123 - Centro - São Paulo, SP - 01234-567',
    },
    items: [
      { id: '1', produto: 'Produto A', quantidade: 5, precoUnitario: 150.00, subtotal: 750.00 },
      { id: '2', produto: 'Produto B', quantidade: 3, precoUnitario: 250.00, subtotal: 750.00 },
      { id: '3', produto: 'Produto C', quantidade: 2, precoUnitario: 120.00, subtotal: 240.00 },
    ],
    subtotal: 1740.00,
    frete: 50.00,
    total: 1790.00,
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = getOrderDetails(id);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;
    
    // Mock order update - replace with real database logic
    const updatedOrder = {
      ...getOrderDetails(id),
      ...body,
    };

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
