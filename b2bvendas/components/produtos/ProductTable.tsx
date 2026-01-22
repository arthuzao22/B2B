'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Produto {
  id: string
  nome: string
  sku: string
  precoBase: number | string
  quantidadeEstoque: number
  ativo: boolean
  unidade: string
}

interface ProductTableProps {
  produtos: Produto[]
  onDelete: (id: string) => Promise<void>
}

export default function ProductTable({ produtos, onDelete }: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja desativar o produto "${nome}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numPrice)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preço Base
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estoque
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {produtos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Nenhum produto encontrado
              </td>
            </tr>
          ) : (
            produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{produto.sku}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatPrice(produto.precoBase)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {produto.quantidadeEstoque} {produto.unidade}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produto.ativo ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/dashboard/fornecedor/produtos/${produto.id}/editar`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(produto.id, produto.nome)}
                    disabled={deletingId === produto.id}
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                  >
                    {deletingId === produto.id ? 'Desativando...' : 'Desativar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
