'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductTable } from '@/components/produtos'

interface Produto {
  id: string
  nome: string
  sku: string
  precoBase: number | string
  quantidadeEstoque: number
  ativo: boolean
  unidade: string
}

interface PaginatedResponse {
  data: Produto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [ativo, setAtivo] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      if (search) params.append('search', search)
      if (ativo !== 'all') params.append('ativo', ativo)

      const response = await fetch(`/api/produtos?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const data: PaginatedResponse = await response.json()
      setProdutos(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [page, search, ativo])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao desativar produto')
      }

      fetchProdutos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao desativar produto')
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleAtivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAtivo(e.target.value)
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meus Produtos</h1>
        <Link
          href="/dashboard/fornecedor/produtos/novo"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Novo Produto
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome, SKU ou descrição..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={ativo}
            onChange={handleAtivoChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="true">Apenas ativos</option>
            <option value="false">Apenas inativos</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : (
        <>
          <ProductTable produtos={produtos} onDelete={handleDelete} />

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
