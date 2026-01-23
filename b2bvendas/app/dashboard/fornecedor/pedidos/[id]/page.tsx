'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, User, Mail, Phone, MapPin, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface OrderDetails {
  id: string;
  numero: string;
  data: string;
  status: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  };
  items: OrderItem[];
  subtotal: number;
  frete: number;
  total: number;
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadOrderDetails();
    }
  }, [status, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOrder: OrderDetails = {
        id: orderId,
        numero: `PED-2024-${orderId.padStart(3, '0')}`,
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

      setOrder(mockOrder);
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
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
    return <Badge variant={config.variant} size="lg">{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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

  if (!order) {
    return (
      <DashboardLayout userType="fornecedor">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Pedido não encontrado</h2>
          <Button className="mt-4" onClick={() => router.push('/dashboard/fornecedor/pedidos')}>
            Voltar para Pedidos
          </Button>
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
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/dashboard/fornecedor/pedidos')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Pedidos
      </Button>

      {/* Order Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.numero}</h1>
            <p className="mt-2 text-gray-600">{formatDateTime(order.data)}</p>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Informações do Cliente</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-gray-900">{order.cliente.nome}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{order.cliente.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="text-gray-900">{order.cliente.telefone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Endereço</p>
                <p className="text-gray-900">{order.cliente.endereco}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items and Summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Itens do Pedido</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Unitário</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.produto}</TableCell>
                      <TableCell className="text-center">{item.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.precoUnitario)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>{formatCurrency(order.frete)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Status Update Section */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Atualizar Status do Pedido</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Button
                variant={order.status === 'confirmed' ? 'primary' : 'outline'}
                size="sm"
                disabled={updating || order.status === 'cancelled'}
                onClick={() => updateOrderStatus('confirmed')}
              >
                <Package className="mr-2 h-4 w-4" />
                Confirmar
              </Button>
              <Button
                variant={order.status === 'shipped' ? 'primary' : 'outline'}
                size="sm"
                disabled={updating || order.status === 'cancelled' || order.status === 'pending'}
                onClick={() => updateOrderStatus('shipped')}
              >
                <Truck className="mr-2 h-4 w-4" />
                Enviar
              </Button>
              <Button
                variant={order.status === 'delivered' ? 'primary' : 'outline'}
                size="sm"
                disabled={updating || order.status === 'cancelled' || order.status !== 'shipped'}
                onClick={() => updateOrderStatus('delivered')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Entregar
              </Button>
              <Button
                variant={order.status === 'cancelled' ? 'error' : 'outline'}
                size="sm"
                disabled={updating || order.status === 'cancelled' || order.status === 'delivered'}
                onClick={() => updateOrderStatus('cancelled')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
