'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { ProductCard } from '@/components/public';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Product {
  id: string;
  nome: string;
  precoBase: number;
  imagens: string[];
  ativo: boolean;
  fornecedor: {
    nomeFantasia?: string;
    razaoSocial: string;
  };
  categoria?: {
    id: string;
    nome: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProdutos();
  }, [busca, precoMin, precoMax, page]);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (busca) params.append('busca', busca);
      if (precoMin) params.append('precoMin', precoMin);
      if (precoMax) params.append('precoMax', precoMax);

      const response = await fetch(`/api/public/produtos?${params}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProdutos(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBusca(buscaInput);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchProdutos();
  };

  const handleClearFilters = () => {
    setPrecoMin('');
    setPrecoMax('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Catálogo de Produtos
          </h1>
          <p className="mt-2 text-gray-600">
            Explore nosso catálogo completo de produtos B2B
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filtros
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>

                <div className={`space-y-4 ${showFilters || 'hidden lg:block'}`}>
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Faixa de Preço
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        value={precoMin}
                        onChange={(e) => setPrecoMin(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        placeholder="Máximo"
                        value={precoMax}
                        onChange={(e) => setPrecoMax(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApplyFilters}
                      className="w-full"
                    >
                      Aplicar Filtros
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={buscaInput}
                    onChange={(e) => setBuscaInput(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" variant="primary" size="md">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Results Info */}
            {!loading && (
              <div className="mb-4 text-sm text-gray-600">
                Mostrando {produtos.length} de {meta.total} produtos
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Nenhum produto encontrado"
                description="Tente ajustar os filtros ou fazer uma nova busca"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {produtos.map((produto) => {
                    const precoBase = typeof produto.precoBase === 'number' 
                      ? produto.precoBase 
                      : parseFloat(String(produto.precoBase)) || 0;
                    
                    return (
                      <ProductCard
                        key={produto.id}
                        id={produto.id}
                        nome={produto.nome}
                        precoBase={precoBase}
                        imagens={produto.imagens}
                        fornecedor={produto.fornecedor}
                        ativo={produto.ativo}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm text-gray-600">
                        Página {page} de {meta.totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={page === meta.totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
