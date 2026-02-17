'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { StatsCard } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Package, ShoppingCart, DollarSign, Users, Plus, Eye, FolderTree } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeClients: number;
  productsTrend: number;
  ordersTrend: number;
  revenueTrend: number;
  clientsTrend: number;
}

interface RecentOrder {
  id: string;
  numero: string;
  cliente: string;
  data: string;
  status: string;
  total: number;
}

export default function FornecedorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStats({
        totalProducts: 156,
        totalOrders: 342,
        totalRevenue: 284500,
        activeClients: 48,
        productsTrend: 12.5,
        ordersTrend: 8.3,
        revenueTrend: 15.7,
        clientsTrend: 5.2,
      });

      setRecentOrders([
        {
          id: '1',
          numero: 'PED-2024-001',
          cliente: 'Empresa ABC Ltda',
          data: '2024-01-15',
          status: 'pending',
          total: 1250.00,
        },
        {
          id: '2',
          numero: 'PED-2024-002',
          cliente: 'Distribuidora XYZ',
          data: '2024-01-14',
          status: 'confirmed',
          total: 3450.00,
        },
        {
          id: '3',
          numero: 'PED-2024-003',
          cliente: 'Comércio 123',
          data: '2024-01-14',
          status: 'shipped',
          total: 890.00,
        },
        {
          id: '4',
          numero: 'PED-2024-004',
          cliente: 'Mercado Central',
          data: '2024-01-13',
          status: 'delivered',
          total: 2100.00,
        },
        {
          id: '5',
          numero: 'PED-2024-005',
          cliente: 'Super Loja',
          data: '2024-01-13',
          status: 'pending',
          total: 1680.00,
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  if (status === 'loading' || loading) {
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {session?.user?.nome || 'Fornecedor'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Aqui está um resumo do seu negócio hoje.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Produtos"
          value={stats?.totalProducts || 0}
          icon={Package}
          variant="blue"
          trend={{
            value: stats?.productsTrend || 0,
            isPositive: (stats?.productsTrend || 0) > 0,
          }}
        />
        <StatsCard
          title="Total de Pedidos"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          variant="green"
          trend={{
            value: stats?.ordersTrend || 0,
            isPositive: (stats?.ordersTrend || 0) > 0,
          }}
        />
        <StatsCard
          title="Receita Total"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          variant="purple"
          trend={{
            value: stats?.revenueTrend || 0,
            isPositive: (stats?.revenueTrend || 0) > 0,
          }}
        />
        <StatsCard
          title="Clientes Ativos"
          value={stats?.activeClients || 0}
          icon={Users}
          variant="orange"
          trend={{
            value: stats?.clientsTrend || 0,
            isPositive: (stats?.clientsTrend || 0) > 0,
          }}
        />
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pedidos Recentes</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/fornecedor/pedidos')}
            >
              Ver todos
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.numero}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>{formatDate(order.data)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/fornecedor/pedidos/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Ações Rápidas</h2>
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/fornecedor/produtos/novo')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Produto
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/fornecedor/pedidos')}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ver Pedidos
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/fornecedor/categorias')}
            >
              <FolderTree className="mr-2 h-5 w-5" />
              Gerenciar Categorias
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/fornecedor/estoque')}
            >
              <Package className="mr-2 h-5 w-5" />
              Controle de Estoque
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/fornecedor/clientes')}
            >
              <Users className="mr-2 h-5 w-5" />
              Ver Clientes
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
