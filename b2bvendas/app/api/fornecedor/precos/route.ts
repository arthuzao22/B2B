import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock price lists data - replace with real database queries
const mockPriceLists = [
  { id: '1', nome: 'Desconto VIP', tipo: 'cliente', alvo: 'Empresa ABC Ltda', descontoTipo: 'percentual', descontoValor: 15, ativo: true },
  { id: '2', nome: 'Promoção Eletrônicos', tipo: 'categoria', alvo: 'Eletrônicos', descontoTipo: 'percentual', descontoValor: 10, ativo: true },
  { id: '3', nome: 'Atacado Premium', tipo: 'cliente', alvo: 'Atacadão Silva', descontoTipo: 'percentual', descontoValor: 20, ativo: true },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: mockPriceLists,
    });
  } catch (error) {
    console.error('Error fetching price lists:', error);
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
    
    // Mock price list creation - replace with real database logic
    const newPriceList = {
      id: Date.now().toString(),
      ...body,
    };

    return NextResponse.json({
      success: true,
      data: newPriceList,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating price list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Price list ID is required' },
        { status: 400 }
      );
    }

    // Mock deletion - replace with real database logic
    return NextResponse.json({
      success: true,
      message: 'Price list deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting price list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
