'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClientCard, ClientStats, PriceListSelector } from '@/src/components/clientes'

interface Cliente {
  id: string
  razaoSocial: string
  nomeFantasia?: string | null
  cnpj: string
  telefone?: string | null
  whatsapp?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  ativo: boolean
  associacao?: {
    listaPreco?: {
      id: string
      nome: string
      descricao?: string | null
    } | null
  }
}

interface Stats {
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date | string | null
  averageOrderValue: number
}

interface Pedido {
  id: string
  numero: string
  status: string
  valorTotal: number
  createdAt: string
}

interface ListaPreco {
  id: string
  nome: string
  descricao?: string | null
}

export default function ClienteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [listasPreco, setListasPreco] = useState<ListaPreco[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'pedidos'>('info')

  useEffect(() => {
    fetchData()
  }, [clienteId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [clienteRes, statsRes, pedidosRes, listasRes] = await Promise.all([
        fetch(`/api/clientes/${clienteId}`),
        fetch(`/api/clientes/${clienteId}/stats`).catch(() => null),
        fetch(`/api/clientes/${clienteId}/pedidos?limit=10`).catch(() => null),
        fetch('/api/precos').catch(() => null),
      ])

      if (!clienteRes.ok) {
        throw new Error('Cliente não encontrado')
      }

      const clienteData = await clienteRes.json()
      setCliente(clienteData)

      if (statsRes?.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (pedidosRes?.ok) {
        const pedidosData = await pedidosRes.json()
        setPedidos(pedidosData.data || [])
      }

      if (listasRes?.ok) {
        const listasData = await listasRes.json()
        setListasPreco(listasData.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPriceList = async (listaPrecoId: string) => {
    const response = await fetch(`/api/clientes/${clienteId}/lista-preco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listaPrecoId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atribuir lista de preços')
    }

    await fetchData()
  }

  const handleRemovePriceList = async () => {
    const response = await fetch(`/api/clientes/${clienteId}/lista-preco`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao remover lista de preços')
    }

    await fetchData()
  }

  const handleRemoveAssociation = async () => {
    if (!confirm('Tem certeza que deseja remover a associação com este cliente?')) {
      return
    }

    try {
      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao remover associação')
      }

      router.push('/dashboard/fornecedor/clientes')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover associação')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMADO: 'bg-blue-100 text-blue-800',
      PROCESSANDO: 'bg-purple-100 text-purple-800',
      ENVIADO: 'bg-indigo-100 text-indigo-800',
      ENTREGUE: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Cliente não encontrado'}
        </div>
        <Link
          href="/dashboard/fornecedor/clientes"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Voltar para clientes
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/fornecedor/clientes"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Voltar para clientes
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{cliente.razaoSocial}</h1>
          <button
            onClick={handleRemoveAssociation}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Remover Associação
          </button>
        </div>
      </div>

      {stats && (
        <div className="mb-6">
          <ClientStats stats={stats} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ClientCard cliente={cliente} />
        </div>
        <div>
          <PriceListSelector
            currentListaPrecoId={cliente.associacao?.listaPreco?.id}
            listasPreco={listasPreco}
            onAssign={handleAssignPriceList}
            onRemove={handleRemovePriceList}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informações
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'pedidos'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico de Pedidos ({pedidos.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' ? (
            <div>
              <p className="text-gray-600">
                Todas as informações do cliente estão exibidas nos cards acima.
              </p>
            </div>
          ) : (
            <div>
              {pedidos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum pedido encontrado
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pedidos.map((pedido) => (
                        <tr key={pedido.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pedido.numero}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(pedido.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                pedido.status
                              )}`}
                            >
                              {pedido.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(pedido.valorTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/fornecedor/pedidos/${pedido.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver Detalhes
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
