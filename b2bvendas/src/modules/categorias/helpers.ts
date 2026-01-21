import { Categoria } from '@prisma/client'
import { CategoriaTree, CategoryPath } from './types'

/**
 * Build hierarchical tree structure from flat list of categories
 */
export function buildCategoryTree(
  categories: Categoria[],
  parentId: string | null = null
): CategoriaTree[] {
  return categories
    .filter((cat) => cat.categoriaPaiId === parentId)
    .map((cat) => ({
      ...cat,
      subcategorias: buildCategoryTree(categories, cat.id),
    }))
    .sort((a, b) => a.ordem - b.ordem)
}

/**
 * Flatten tree structure to a flat list
 */
export function flattenCategoryTree(tree: CategoriaTree[]): Categoria[] {
  const flat: Categoria[] = []
  
  function traverse(nodes: CategoriaTree[]) {
    for (const node of nodes) {
      const { subcategorias, ...categoria } = node
      flat.push(categoria as Categoria)
      if (subcategorias.length > 0) {
        traverse(subcategorias)
      }
    }
  }
  
  traverse(tree)
  return flat
}

/**
 * Get breadcrumb path from root to category
 */
export function getCategoryPath(
  categoryId: string,
  allCategories: Categoria[]
): CategoryPath[] {
  const path: CategoryPath[] = []
  let currentId: string | null = categoryId
  
  while (currentId) {
    const category = allCategories.find((cat) => cat.id === currentId)
    if (!category) break
    
    path.unshift({
      id: category.id,
      nome: category.nome,
      slug: category.slug,
    })
    
    currentId = category.categoriaPaiId
  }
  
  return path
}

/**
 * Check if category would create a circular reference
 */
export function wouldCreateCircularReference(
  categoryId: string,
  newParentId: string | null,
  allCategories: Categoria[]
): boolean {
  if (!newParentId || categoryId === newParentId) {
    return true
  }
  
  // Check if newParentId is a descendant of categoryId
  let currentId: string | null = newParentId
  const visited = new Set<string>()
  
  while (currentId) {
    if (currentId === categoryId) {
      return true // Circular reference detected
    }
    
    if (visited.has(currentId)) {
      return true // Already visited, circular reference
    }
    
    visited.add(currentId)
    const parent = allCategories.find((cat) => cat.id === currentId)
    currentId = parent?.categoriaPaiId || null
  }
  
  return false
}

/**
 * Get all descendant IDs of a category
 */
export function getDescendantIds(
  categoryId: string,
  allCategories: Categoria[]
): string[] {
  const descendants: string[] = []
  
  function traverse(parentId: string) {
    const children = allCategories.filter((cat) => cat.categoriaPaiId === parentId)
    for (const child of children) {
      descendants.push(child.id)
      traverse(child.id)
    }
  }
  
  traverse(categoryId)
  return descendants
}

/**
 * Calculate category depth in tree
 */
export function getCategoryDepth(
  categoryId: string,
  allCategories: Categoria[]
): number {
  let depth = 0
  let currentId: string | null = categoryId
  
  while (currentId) {
    const category = allCategories.find((cat) => cat.id === currentId)
    if (!category?.categoriaPaiId) break
    depth++
    currentId = category.categoriaPaiId
  }
  
  return depth
}
