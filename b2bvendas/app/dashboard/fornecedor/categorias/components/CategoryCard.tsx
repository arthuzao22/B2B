'use client'

import { CategoriaWithCount } from '@/src/modules/categorias/types'
import { Edit, Trash2, FolderOpen, Package } from 'lucide-react'

interface CategoryCardProps {
  category: CategoriaWithCount
  onEdit: (category: CategoriaWithCount) => void
  onDelete: (category: CategoriaWithCount) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div
      className={`
        p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow
        ${!category.ativo ? 'opacity-60 bg-gray-50' : 'bg-white'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <FolderOpen className="h-6 w-6 text-gray-400 mt-1" />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{category.nome}</h3>
              {!category.ativo && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-300 text-gray-700">
                  Inativa
                </span>
              )}
            </div>
            
            {category.descricao && (
              <p className="text-sm text-gray-600 mb-2">{category.descricao}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {category.slug}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {category._count.produtos} produto(s)
              </span>
              <span>
                {category._count.subcategorias} subcategoria(s)
              </span>
            </div>
            
            {category.categoriaPai && (
              <div className="mt-2 text-xs text-gray-500">
                Pai: <span className="font-medium">{category.categoriaPai.nome}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Excluir"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
