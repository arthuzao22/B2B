'use client'

import { useEffect, useState } from 'react'
import { CategoriaTree, CategoriaWithCount } from '@/src/modules/categorias/types'
import { CategoryTree } from './components/CategoryTree'
import { CategoryForm } from './components/CategoryForm'
import { CategoryCard } from './components/CategoryCard'
import { Plus, List, Network } from 'lucide-react'

type ViewMode = 'tree' | 'list'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoriaTree[]>([])
  const [flatCategories, setFlatCategories] = useState<CategoriaWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoriaTree | null>(null)
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Fetch tree for tree view
      const treeResponse = await fetch('/api/categorias')
      if (!treeResponse.ok) throw new Error('Erro ao carregar categorias')
      const treeData = await treeResponse.json()
      setCategories(treeData)
      
      // Fetch flat list with counts for list view
      const flatResponse = await fetch('/api/categorias?flat=true&withCount=true')
      if (!flatResponse.ok) throw new Error('Erro ao carregar categorias')
      const flatData = await flatResponse.json()
      setFlatCategories(flatData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = () => {
    setEditingCategory(null)
    setParentIdForNew(null)
    setShowModal(true)
  }

  const handleAddChild = (parentId: string) => {
    setEditingCategory(null)
    setParentIdForNew(parentId)
    setShowModal(true)
  }

  const handleEdit = (category: CategoriaTree | CategoriaWithCount) => {
    setEditingCategory(category as CategoriaTree)
    setParentIdForNew(null)
    setShowModal(true)
  }

  const handleDelete = async (category: CategoriaTree | CategoriaWithCount) => {
    const productCount = category._count?.produtos || 0
    
    if (productCount > 0) {
      if (!confirm(
        `Esta categoria possui ${productCount} produto(s) associado(s). ` +
        'Deseja realmente excluir?'
      )) {
        return
      }
    } else {
      if (!confirm(`Deseja realmente excluir a categoria "${category.nome}"?`)) {
        return
      }
    }

    try {
      const response = await fetch(`/api/categorias/${category.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao excluir categoria')
      }

      await fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir categoria')
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const url = editingCategory
        ? `/api/categorias/${editingCategory.id}`
        : '/api/categorias'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar categoria')
      }

      await fetchCategories()
      setShowModal(false)
      setEditingCategory(null)
      setParentIdForNew(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar categoria')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    setEditingCategory(null)
    setParentIdForNew(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as categorias dos seus produtos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Nova Categoria
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('tree')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg
            ${viewMode === 'tree' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <Network className="h-4 w-4" />
          Visualização em Árvore
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg
            ${viewMode === 'list' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <List className="h-4 w-4" />
          Visualização em Lista
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {viewMode === 'tree' ? (
          <CategoryTree
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
          />
        ) : (
          <div className="space-y-4">
            {flatCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma categoria cadastrada</p>
              </div>
            ) : (
              flatCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
            </div>
            <div className="p-6">
              <CategoryForm
                initialData={editingCategory}
                parentId={parentIdForNew}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
