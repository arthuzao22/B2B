'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Eye, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  numero: string;
  cliente: string;
  data: string;
  status: string;
  total: number;
}

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const statusTabs: { value: OrderStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function PedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadOrders();
    }
  }, [status]);

  useEffect(() => {
    filterOrders();
  }, [currentStatus, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOrders: Order[] = [
        { id: '1', numero: 'PED-2024-001', cliente: 'Empresa ABC Ltda', data: '2024-01-15', status: 'pending', total: 1250.00 },
        { id: '2', numero: 'PED-2024-002', cliente: 'Distribuidora XYZ', data: '2024-01-14', status: 'confirmed', total: 3450.00 },
        { id: '3', numero: 'PED-2024-003', cliente: 'Comércio 123', data: '2024-01-14', status: 'shipped', total: 890.00 },
        { id: '4', numero: 'PED-2024-004', cliente: 'Mercado Central', data: '2024-01-13', status: 'delivered', total: 2100.00 },
        { id: '5', numero: 'PED-2024-005', cliente: 'Super Loja', data: '2024-01-13', status: 'pending', total: 1680.00 },
        { id: '6', numero: 'PED-2024-006', cliente: 'Atacadão Silva', data: '2024-01-12', status: 'confirmed', total: 5200.00 },
        { id: '7', numero: 'PED-2024-007', cliente: 'Empresa ABC Ltda', data: '2024-01-12', status: 'shipped', total: 980.00 },
        { id: '8', numero: 'PED-2024-008', cliente: 'Loja do João', data: '2024-01-11', status: 'delivered', total: 1450.00 },
        { id: '9', numero: 'PED-2024-009', cliente: 'Mercado Central', data: '2024-01-11', status: 'cancelled', total: 750.00 },
        { id: '10', numero: 'PED-2024-010', cliente: 'Super Loja', data: '2024-01-10', status: 'delivered', total: 3100.00 },
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (currentStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === currentStatus));
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'warning' as const },
      confirmed: { label: 'Confirmado', variant: 'info' as const },
      shipped: { label: 'Enviado', variant: 'default' as const },
      delivered: { label: 'Entregue', variant: 'success' as const },
      cancelled: { label: 'Cancelado', variant: 'error' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

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
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="mt-2 text-gray-600">Gerencie todos os pedidos dos seus clientes.</p>
      </div>

      {/* Status Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCurrentStatus(tab.value)}
                className={cn(
                  'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                  currentStatus === tab.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" label="Carregando pedidos..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Nenhum pedido encontrado"
            description="Não há pedidos para exibir com os filtros selecionados."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número do Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.numero}</TableCell>
                      <TableCell>{order.cliente}</TableCell>
                      <TableCell>{formatDate(order.data)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/fornecedor/pedidos/${order.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
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
