import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock stock data - replace with real database queries
const mockStockItems = [
  { id: '1', nomeProduto: 'Produto A', sku: 'SKU-001', estoqueAtual: 150, estoqueMinimo: 50, status: 'in_stock', ultimaAtualizacao: '2024-01-15T10:30:00' },
  { id: '2', nomeProduto: 'Produto B', sku: 'SKU-002', estoqueAtual: 30, estoqueMinimo: 40, status: 'low_stock', ultimaAtualizacao: '2024-01-14T15:20:00' },
  { id: '3', nomeProduto: 'Produto C', sku: 'SKU-003', estoqueAtual: 0, estoqueMinimo: 20, status: 'out_of_stock', ultimaAtualizacao: '2024-01-13T08:45:00' },
  { id: '4', nomeProduto: 'Produto D', sku: 'SKU-004', estoqueAtual: 200, estoqueMinimo: 100, status: 'in_stock', ultimaAtualizacao: '2024-01-15T11:00:00' },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    
    let filteredItems = mockStockItems;
    
    if (lowStockOnly) {
      filteredItems = mockStockItems.filter(
        item => item.status === 'low_stock' || item.status === 'out_of_stock'
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredItems,
    });
  } catch (error) {
    console.error('Error fetching stock items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, estoqueAtual } = body;
    
    if (!id || estoqueAtual === undefined) {
      return NextResponse.json(
        { error: 'Product ID and stock quantity are required' },
        { status: 400 }
      );
    }

    // Mock stock update - replace with real database logic
    const item = mockStockItems.find(i => i.id === id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedStatus = 
      estoqueAtual === 0 ? 'out_of_stock' :
      estoqueAtual < item.estoqueMinimo ? 'low_stock' : 'in_stock';

    const updatedItem = {
      ...item,
      estoqueAtual,
      status: updatedStatus,
      ultimaAtualizacao: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
