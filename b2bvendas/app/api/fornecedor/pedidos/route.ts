import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock data - replace with real database queries
const mockOrders = [
  { id: '1', numero: 'PED-2024-001', clienteId: '1', cliente: 'Empresa ABC Ltda', data: '2024-01-15', status: 'pending', total: 1250.00 },
  { id: '2', numero: 'PED-2024-002', clienteId: '2', cliente: 'Distribuidora XYZ', data: '2024-01-14', status: 'confirmed', total: 3450.00 },
  { id: '3', numero: 'PED-2024-003', clienteId: '3', cliente: 'Comércio 123', data: '2024-01-14', status: 'shipped', total: 890.00 },
  { id: '4', numero: 'PED-2024-004', clienteId: '4', cliente: 'Mercado Central', data: '2024-01-13', status: 'delivered', total: 2100.00 },
  { id: '5', numero: 'PED-2024-005', clienteId: '5', cliente: 'Super Loja', data: '2024-01-13', status: 'pending', total: 1680.00 },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let filteredOrders = mockOrders;
    
    if (status && status !== 'all') {
      filteredOrders = mockOrders.filter(order => order.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Mock order creation - replace with real database logic
    const newOrder = {
      id: Date.now().toString(),
      numero: `PED-2024-${mockOrders.length + 1}`.padStart(12, '0'),
      ...body,
      data: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
