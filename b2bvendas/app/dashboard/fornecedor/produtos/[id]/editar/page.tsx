'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/produtos'

interface Produto {
  id: string
  nome: string
  sku: string
  descricao?: string | null
  precoBase: number | string
  unidade: string
  quantidadeEstoque: number
  estoqueMinimo: number
  estoqueMaximo?: number | null
  categoriaId?: string | null
  ativo: boolean
  destaque: boolean
  imagens: string[]
}

export default function EditarProdutoPage() {
  const params = useParams()
  const id = params?.id as string
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`/api/produtos/${id}`)

        if (!response.ok) {
          throw new Error('Erro ao carregar produto')
        }

        const data = await response.json()
        setProduto(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduto()
    }
  }, [id])

  const handleSubmit = async (data: any) => {
    const response = await fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        precoBase: data.precoBase ? parseFloat(data.precoBase) : undefined,
        quantidadeEstoque: data.quantidadeEstoque ? parseInt(data.quantidadeEstoque, 10) : undefined,
        estoqueMinimo: data.estoqueMinimo ? parseInt(data.estoqueMinimo, 10) : undefined,
        estoqueMaximo: data.estoqueMaximo ? parseInt(data.estoqueMaximo, 10) : null,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar produto')
    }

    return response.json()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </div>
    )
  }

  if (error || !produto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Produto não encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Produto</h1>
      <ProductForm
        initialData={{
          nome: produto.nome,
          sku: produto.sku,
          descricao: produto.descricao || '',
          precoBase: produto.precoBase.toString(),
          unidade: produto.unidade,
          quantidadeEstoque: produto.quantidadeEstoque.toString(),
          estoqueMinimo: produto.estoqueMinimo.toString(),
          estoqueMaximo: produto.estoqueMaximo?.toString() || '',
          categoriaId: produto.categoriaId || '',
          ativo: produto.ativo,
          destaque: produto.destaque,
          imagens: produto.imagens,
        }}
        onSubmit={handleSubmit}
        isEdit
      />
    </div>
  )
}
