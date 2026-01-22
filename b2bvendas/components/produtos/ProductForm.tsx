'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProdutoFormData {
  nome: string
  sku: string
  descricao: string
  precoBase: string
  unidade: string
  quantidadeEstoque: string
  estoqueMinimo: string
  estoqueMaximo: string
  categoriaId: string
  ativo: boolean
  destaque: boolean
  imagens: string[]
}

interface ProductFormProps {
  initialData?: Partial<ProdutoFormData>
  onSubmit: (data: ProdutoFormData) => Promise<void>
  isEdit?: boolean
}

export default function ProductForm({ initialData, onSubmit, isEdit = false }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ProdutoFormData>({
    nome: initialData?.nome || '',
    sku: initialData?.sku || '',
    descricao: initialData?.descricao || '',
    precoBase: initialData?.precoBase || '',
    unidade: initialData?.unidade || 'UN',
    quantidadeEstoque: initialData?.quantidadeEstoque || '0',
    estoqueMinimo: initialData?.estoqueMinimo || '0',
    estoqueMaximo: initialData?.estoqueMaximo || '',
    categoriaId: initialData?.categoriaId || '',
    ativo: initialData?.ativo ?? true,
    destaque: initialData?.destaque ?? false,
    imagens: initialData?.imagens || [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
      router.push('/dashboard/fornecedor/produtos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Produto *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
            SKU *
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="precoBase" className="block text-sm font-medium text-gray-700 mb-2">
            Preço Base *
          </label>
          <input
            type="number"
            id="precoBase"
            name="precoBase"
            value={formData.precoBase}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="unidade" className="block text-sm font-medium text-gray-700 mb-2">
            Unidade
          </label>
          <select
            id="unidade"
            name="unidade"
            value={formData.unidade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UN">Unidade</option>
            <option value="KG">Quilograma</option>
            <option value="LT">Litro</option>
            <option value="MT">Metro</option>
            <option value="CX">Caixa</option>
            <option value="PC">Peça</option>
          </select>
        </div>

        <div>
          <label htmlFor="quantidadeEstoque" className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade em Estoque
          </label>
          <input
            type="number"
            id="quantidadeEstoque"
            name="quantidadeEstoque"
            value={formData.quantidadeEstoque}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-gray-700 mb-2">
            Estoque Mínimo
          </label>
          <input
            type="number"
            id="estoqueMinimo"
            name="estoqueMinimo"
            value={formData.estoqueMinimo}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="estoqueMaximo" className="block text-sm font-medium text-gray-700 mb-2">
            Estoque Máximo
          </label>
          <input
            type="number"
            id="estoqueMaximo"
            name="estoqueMaximo"
            value={formData.estoqueMaximo}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativo"
            name="ativo"
            checked={formData.ativo}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
            Ativo
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="destaque"
            name="destaque"
            checked={formData.destaque}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="destaque" className="ml-2 block text-sm text-gray-700">
            Destaque
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
