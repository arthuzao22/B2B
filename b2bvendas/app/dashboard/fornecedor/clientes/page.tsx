'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Users, Search, Eye } from 'lucide-react';

interface Client {
  id: string;
  nomeEmpresa: string;
  nomeContato: string;
  email: string;
  totalPedidos: number;
  totalGasto: number;
}

export default function ClientesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadClients();
    }
  }, [status]);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockClients: Client[] = [
        { id: '1', nomeEmpresa: 'Empresa ABC Ltda', nomeContato: 'João Silva', email: 'joao@empresaabc.com.br', totalPedidos: 45, totalGasto: 125000.00 },
        { id: '2', nomeEmpresa: 'Distribuidora XYZ', nomeContato: 'Maria Santos', email: 'maria@distribuidoraxyz.com.br', totalPedidos: 32, totalGasto: 89000.00 },
        { id: '3', nomeEmpresa: 'Comércio 123', nomeContato: 'Pedro Oliveira', email: 'pedro@comercio123.com.br', totalPedidos: 28, totalGasto: 67000.00 },
        { id: '4', nomeEmpresa: 'Mercado Central', nomeContato: 'Ana Costa', email: 'ana@mercadocentral.com.br', totalPedidos: 56, totalGasto: 178000.00 },
        { id: '5', nomeEmpresa: 'Super Loja', nomeContato: 'Carlos Ferreira', email: 'carlos@superloja.com.br', totalPedidos: 41, totalGasto: 134000.00 },
        { id: '6', nomeEmpresa: 'Atacadão Silva', nomeContato: 'Juliana Souza', email: 'juliana@atacadaosilva.com.br', totalPedidos: 63, totalGasto: 245000.00 },
        { id: '7', nomeEmpresa: 'Loja do João', nomeContato: 'Roberto Lima', email: 'roberto@lojadojoao.com.br', totalPedidos: 19, totalGasto: 45000.00 },
        { id: '8', nomeEmpresa: 'Mercadinho Bom Preço', nomeContato: 'Fernanda Alves', email: 'fernanda@mercadinhobopreco.com.br', totalPedidos: 35, totalGasto: 98000.00 },
      ];

      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredClients(
        clients.filter(
          client =>
            client.nomeEmpresa.toLowerCase().includes(term) ||
            client.nomeContato.toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term)
        )
      );
    }
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const startIndex = (currentPage - 1) * clientsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + clientsPerPage);

  if (status === 'loading') {
    return (
      <DashboardLayout userType="fornecedor">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" label="Carregando..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userType="fornecedor"
      userName={session?.user?.nome}
      userEmail={session?.user?.email}
      userAvatar={session?.user?.avatar}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="mt-2 text-gray-600">Gerencie sua base de clientes e visualize o histórico de compras.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por empresa, contato ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" label="Carregando clientes..." />
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description={
              searchTerm
                ? 'Tente ajustar sua busca ou limpar os filtros.'
                : 'Você ainda não possui clientes cadastrados.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Total de Pedidos</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.nomeEmpresa}</TableCell>
                      <TableCell>{client.nomeContato}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell className="text-center">{client.totalPedidos}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(client.totalGasto)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/fornecedor/clientes/${client.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
