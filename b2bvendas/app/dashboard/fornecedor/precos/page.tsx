'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';

interface PriceList {
  id: string;
  nome: string;
  tipo: 'cliente' | 'categoria';
  alvo: string;
  descontoTipo: 'percentual' | 'fixo';
  descontoValor: number;
  ativo: boolean;
}

export default function PrecosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'cliente' as 'cliente' | 'categoria',
    alvo: '',
    descontoTipo: 'percentual' as 'percentual' | 'fixo',
    descontoValor: 0,
    ativo: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadPriceLists();
    }
  }, [status]);

  const loadPriceLists = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockPriceLists: PriceList[] = [
        { id: '1', nome: 'Desconto VIP', tipo: 'cliente', alvo: 'Empresa ABC Ltda', descontoTipo: 'percentual', descontoValor: 15, ativo: true },
        { id: '2', nome: 'Promoção Eletrônicos', tipo: 'categoria', alvo: 'Eletrônicos', descontoTipo: 'percentual', descontoValor: 10, ativo: true },
        { id: '3', nome: 'Atacado Premium', tipo: 'cliente', alvo: 'Atacadão Silva', descontoTipo: 'percentual', descontoValor: 20, ativo: true },
        { id: '4', nome: 'Desconto Especial', tipo: 'cliente', alvo: 'Mercado Central', descontoTipo: 'fixo', descontoValor: 50, ativo: false },
      ];

      setPriceLists(mockPriceLists);
    } catch (error) {
      console.error('Error loading price lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (priceList?: PriceList) => {
    if (priceList) {
      setEditingId(priceList.id);
      setFormData({
        nome: priceList.nome,
        tipo: priceList.tipo,
        alvo: priceList.alvo,
        descontoTipo: priceList.descontoTipo,
        descontoValor: priceList.descontoValor,
        ativo: priceList.ativo,
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        tipo: 'cliente',
        alvo: '',
        descontoTipo: 'percentual',
        descontoValor: 0,
        ativo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        setPriceLists(prev =>
          prev.map(pl => (pl.id === editingId ? { ...pl, ...formData } : pl))
        );
      } else {
        const newPriceList: PriceList = {
          id: Date.now().toString(),
          ...formData,
        };
        setPriceLists(prev => [...prev, newPriceList]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving price list:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lista de preços?')) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPriceLists(prev => prev.filter(pl => pl.id !== id));
    } catch (error) {
      console.error('Error deleting price list:', error);
    }
  };

  const formatDiscount = (tipo: string, valor: number) => {
    if (tipo === 'percentual') {
      return `${valor}%`;
    } else {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    }
  };

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listas de Preços</h1>
          <p className="mt-2 text-gray-600">Gerencie descontos personalizados para clientes e categorias.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-5 w-5" />
          Criar Lista de Preços
        </Button>
      </div>

      {/* Price Lists Table */}
      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" label="Carregando listas de preços..." />
          </div>
        ) : priceLists.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Nenhuma lista de preços cadastrada"
            description="Crie sua primeira lista de preços para oferecer descontos personalizados."
            action={
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-5 w-5" />
                Criar Lista de Preços
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente/Categoria</TableHead>
                  <TableHead>Tipo de Desconto</TableHead>
                  <TableHead>Valor do Desconto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceLists.map((priceList) => (
                  <TableRow key={priceList.id}>
                    <TableCell className="font-medium">{priceList.nome}</TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {priceList.tipo === 'cliente' ? 'Cliente' : 'Categoria'}
                      </Badge>
                    </TableCell>
                    <TableCell>{priceList.alvo}</TableCell>
                    <TableCell>
                      {priceList.descontoTipo === 'percentual' ? 'Percentual' : 'Valor Fixo'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatDiscount(priceList.descontoTipo, priceList.descontoValor)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priceList.ativo ? 'success' : 'error'}>
                        {priceList.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(priceList)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(priceList.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Lista de Preços' : 'Criar Lista de Preços'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Lista</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Desconto VIP"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'cliente' | 'categoria' })}
              >
                <option value="cliente">Cliente</option>
                <option value="categoria">Categoria</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="alvo">{formData.tipo === 'cliente' ? 'Cliente' : 'Categoria'}</Label>
              <Input
                id="alvo"
                value={formData.alvo}
                onChange={(e) => setFormData({ ...formData, alvo: e.target.value })}
                placeholder={formData.tipo === 'cliente' ? 'Nome do cliente' : 'Nome da categoria'}
              />
            </div>

            <div>
              <Label htmlFor="descontoTipo">Tipo de Desconto</Label>
              <Select
                id="descontoTipo"
                value={formData.descontoTipo}
                onChange={(e) => setFormData({ ...formData, descontoTipo: e.target.value as 'percentual' | 'fixo' })}
              >
                <option value="percentual">Percentual</option>
                <option value="fixo">Valor Fixo</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="descontoValor">
                Valor do Desconto {formData.descontoTipo === 'percentual' ? '(%)' : '(R$)'}
              </Label>
              <Input
                id="descontoValor"
                type="number"
                min="0"
                step={formData.descontoTipo === 'percentual' ? '0.1' : '0.01'}
                value={formData.descontoValor}
                onChange={(e) => setFormData({ ...formData, descontoValor: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="ativo" className="cursor-pointer">Lista ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Salvar Alterações' : 'Criar Lista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
