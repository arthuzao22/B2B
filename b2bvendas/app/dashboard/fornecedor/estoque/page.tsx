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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockItem {
  id: string;
  nomeProduto: string;
  sku: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  ultimaAtualizacao: string;
}

export default function EstoquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [newStockValue, setNewStockValue] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadStockItems();
    }
  }, [status]);

  useEffect(() => {
    filterItems();
  }, [showLowStockOnly, stockItems]);

  const loadStockItems = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockItems: StockItem[] = [
        { id: '1', nomeProduto: 'Produto A', sku: 'SKU-001', estoqueAtual: 150, estoqueMinimo: 50, status: 'in_stock', ultimaAtualizacao: '2024-01-15T10:30:00' },
        { id: '2', nomeProduto: 'Produto B', sku: 'SKU-002', estoqueAtual: 30, estoqueMinimo: 40, status: 'low_stock', ultimaAtualizacao: '2024-01-14T15:20:00' },
        { id: '3', nomeProduto: 'Produto C', sku: 'SKU-003', estoqueAtual: 0, estoqueMinimo: 20, status: 'out_of_stock', ultimaAtualizacao: '2024-01-13T08:45:00' },
        { id: '4', nomeProduto: 'Produto D', sku: 'SKU-004', estoqueAtual: 200, estoqueMinimo: 100, status: 'in_stock', ultimaAtualizacao: '2024-01-15T11:00:00' },
        { id: '5', nomeProduto: 'Produto E', sku: 'SKU-005', estoqueAtual: 15, estoqueMinimo: 30, status: 'low_stock', ultimaAtualizacao: '2024-01-14T16:30:00' },
        { id: '6', nomeProduto: 'Produto F', sku: 'SKU-006', estoqueAtual: 85, estoqueMinimo: 25, status: 'in_stock', ultimaAtualizacao: '2024-01-15T09:15:00' },
        { id: '7', nomeProduto: 'Produto G', sku: 'SKU-007', estoqueAtual: 5, estoqueMinimo: 15, status: 'low_stock', ultimaAtualizacao: '2024-01-13T14:20:00' },
        { id: '8', nomeProduto: 'Produto H', sku: 'SKU-008', estoqueAtual: 120, estoqueMinimo: 60, status: 'in_stock', ultimaAtualizacao: '2024-01-15T10:00:00' },
      ];

      setStockItems(mockItems);
    } catch (error) {
      console.error('Error loading stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (showLowStockOnly) {
      setFilteredItems(stockItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock'));
    } else {
      setFilteredItems(stockItems);
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { label: 'Em Estoque', variant: 'success' as const, icon: CheckCircle },
      low_stock: { label: 'Estoque Baixo', variant: 'warning' as const, icon: AlertTriangle },
      out_of_stock: { label: 'Sem Estoque', variant: 'error' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: Package };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleOpenUpdateDialog = (item: StockItem) => {
    setSelectedItem(item);
    setNewStockValue(item.estoqueAtual);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedStatus = 
        newStockValue === 0 ? 'out_of_stock' :
        newStockValue < selectedItem.estoqueMinimo ? 'low_stock' : 'in_stock';

      setStockItems(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                estoqueAtual: newStockValue,
                status: updatedStatus,
                ultimaAtualizacao: new Date().toISOString(),
              }
            : item
        )
      );
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

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
        <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
        <p className="mt-2 text-gray-600">Monitore e gerencie o estoque dos seus produtos.</p>
      </div>

      {/* Filter Toggle */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="lowStockFilter"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="lowStockFilter" className="cursor-pointer text-sm font-medium text-gray-700">
            Mostrar apenas produtos com estoque baixo ou sem estoque
          </label>
        </div>
      </div>

      {/* Stock Table */}
      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" label="Carregando estoque..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description={
              showLowStockOnly
                ? 'Não há produtos com estoque baixo ou sem estoque.'
                : 'Você ainda não possui produtos cadastrados.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Estoque Atual</TableHead>
                    <TableHead className="text-center">Estoque Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nomeProduto}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'font-bold',
                            item.status === 'out_of_stock' && 'text-red-600',
                            item.status === 'low_stock' && 'text-orange-600',
                            item.status === 'in_stock' && 'text-green-600'
                          )}
                        >
                          {item.estoqueAtual}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-gray-600">
                        {item.estoqueMinimo}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(item.ultimaAtualizacao)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenUpdateDialog(item)}
                        >
                          Atualizar Estoque
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

      {/* Update Stock Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Produto</p>
                <p className="font-medium text-gray-900">{selectedItem.nomeProduto}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-mono text-sm font-medium text-gray-900">{selectedItem.sku}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Estoque Atual</p>
                <p className="font-bold text-gray-900">{selectedItem.estoqueAtual} unidades</p>
              </div>

              <div>
                <Label htmlFor="newStock">Nova Quantidade</Label>
                <Input
                  id="newStock"
                  type="number"
                  min="0"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                />
              </div>

              {newStockValue < selectedItem.estoqueMinimo && (
                <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
                  <AlertTriangle className="mb-1 inline h-4 w-4" />
                  <span className="ml-1">
                    Atenção: A quantidade está abaixo do estoque mínimo ({selectedItem.estoqueMinimo}).
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStock}>
              Atualizar Estoque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
