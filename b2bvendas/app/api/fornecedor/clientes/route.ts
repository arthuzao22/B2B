import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock clients data - replace with real database queries
const mockClients = [
  { id: '1', nomeEmpresa: 'Empresa ABC Ltda', nomeContato: 'João Silva', email: 'joao@empresaabc.com.br', totalPedidos: 45, totalGasto: 125000.00 },
  { id: '2', nomeEmpresa: 'Distribuidora XYZ', nomeContato: 'Maria Santos', email: 'maria@distribuidoraxyz.com.br', totalPedidos: 32, totalGasto: 89000.00 },
  { id: '3', nomeEmpresa: 'Comércio 123', nomeContato: 'Pedro Oliveira', email: 'pedro@comercio123.com.br', totalPedidos: 28, totalGasto: 67000.00 },
  { id: '4', nomeEmpresa: 'Mercado Central', nomeContato: 'Ana Costa', email: 'ana@mercadocentral.com.br', totalPedidos: 56, totalGasto: 178000.00 },
  { id: '5', nomeEmpresa: 'Super Loja', nomeContato: 'Carlos Ferreira', email: 'carlos@superloja.com.br', totalPedidos: 41, totalGasto: 134000.00 },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.tipo !== 'FORNECEDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    
    let filteredClients = mockClients;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredClients = mockClients.filter(
        client =>
          client.nomeEmpresa.toLowerCase().includes(searchLower) ||
          client.nomeContato.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredClients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
