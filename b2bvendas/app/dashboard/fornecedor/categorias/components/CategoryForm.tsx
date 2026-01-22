'use client'

import { useState, useEffect } from 'react'
import { CategoriaTree } from '@/modules/categorias/types'

interface CategoryFormProps {
  initialData?: CategoriaTree | null
  parentId?: string | null
  categories: CategoriaTree[]
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function CategoryForm({
  initialData,
  parentId,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    imagem: initialData?.imagem || '',
    categoriaPaiId: parentId || initialData?.categoriaPaiId || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const flattenCategories = (cats: CategoriaTree[], prefix = ''): Array<{ id: string; nome: string; level: number }> => {
    const result: Array<{ id: string; nome: string; level: number }> = []
    
    for (const cat of cats) {
      // Skip current category (can't be its own parent)
      if (initialData && cat.id === initialData.id) {
        continue
      }
      
      result.push({
        id: cat.id,
        nome: prefix + cat.nome,
        level: prefix.length / 2,
      })
      
      if (cat.subcategorias.length > 0) {
        result.push(...flattenCategories(cat.subcategorias, prefix + '  '))
      }
    }
    
    return result
  }

  const availableParents = flattenCategories(categories)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit({
        ...formData,
        categoriaPaiId: formData.categoriaPaiId || null,
        descricao: formData.descricao || null,
        imagem: formData.imagem || null,
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className={`
            w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.nome ? 'border-red-500' : 'border-gray-300'}
          `}
          placeholder="Nome da categoria"
          disabled={isLoading}
        />
        {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Descrição da categoria (opcional)"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="categoriaPaiId" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria Pai
        </label>
        <select
          id="categoriaPaiId"
          name="categoriaPaiId"
          value={formData.categoriaPaiId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Nenhuma (categoria raiz)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-1">
          URL da Imagem
        </label>
        <input
          type="url"
          id="imagem"
          name="imagem"
          value={formData.imagem}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-400"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
