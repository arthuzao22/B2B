'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClientTable } from '@/src/components/clientes'

interface Cliente {
  id: string
  razaoSocial: string
  nomeFantasia?: string | null
  cnpj: string
  cidade?: string | null
  estado?: string | null
  ativo: boolean
  associacao?: {
    listaPreco?: {
      id: string
      nome: string
    } | null
  }
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    ativo: '',
    cidade: '',
    estado: '',
  })

  useEffect(() => {
    fetchClientes()
  }, [search, filters])

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (search) params.append('search', search)
      if (filters.ativo) params.append('ativo', filters.ativo)
      if (filters.cidade) params.append('cidade', filters.cidade)
      if (filters.estado) params.append('estado', filters.estado)

      const response = await fetch(`/api/clientes?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }

      const data = await response.json()
      setClientes(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover a associação com este cliente?')) {
      return
    }

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao remover associação')
      }

      await fetchClientes()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover associação')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <Link
            href="/dashboard/fornecedor/clientes/novo"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Novo Cliente
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por nome, CNPJ ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={filters.ativo}
                onChange={(e) => setFilters({ ...filters, ativo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="Filtrar por estado (UF)"
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value.toUpperCase() })}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ClientTable clientes={clientes} onDelete={handleDelete} />
        </div>
      )}
    </div>
  )
}
