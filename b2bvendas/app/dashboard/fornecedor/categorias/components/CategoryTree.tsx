'use client'

import { useState } from 'react'
import { CategoriaTree } from '@/modules/categorias/types'
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, FolderOpen, Folder } from 'lucide-react'

interface CategoryTreeProps {
  categories: CategoriaTree[]
  onEdit: (category: CategoriaTree) => void
  onDelete: (category: CategoriaTree) => void
  onAddChild: (parentId: string) => void
  level?: number
}

export function CategoryTree({ 
  categories, 
  onEdit, 
  onDelete, 
  onAddChild,
  level = 0 
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <p>Nenhuma categoria cadastrada</p>
      </div>
    )
  }

  return (
    <div className={level > 0 ? 'ml-6 border-l-2 border-gray-200' : ''}>
      {categories.map((category) => {
        const isExpanded = expandedIds.has(category.id)
        const hasChildren = category.subcategorias.length > 0

        return (
          <div key={category.id} className="mb-2">
            <div
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
            >
              <div className="flex items-center flex-1 gap-3">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(category.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <div className="w-5" />
                )}

                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.nome}</span>
                    </div>
                    {category.descricao && (
                      <p className="text-sm text-gray-500 mt-1">{category.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Slug: {category.slug}</span>
                      {category._count && (
                        <span>{category._count.produtos} produto(s)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAddChild(category.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Adicionar subcategoria"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(category)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(category)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <div className="mt-2">
                <CategoryTree
                  categories={category.subcategorias}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
