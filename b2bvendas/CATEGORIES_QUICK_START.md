# Categories Module - Quick Start Guide

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [API Examples](#api-examples)
3. [UI Examples](#ui-examples)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

## Basic Usage

### Creating Categories

#### Simple Root Category
```typescript
// POST /api/categorias
{
  "nome": "Eletrônicos"
}
// Result: { id: "clx...", slug: "eletronicos", ... }
```

#### Category with Description
```typescript
{
  "nome": "Eletrônicos",
  "descricao": "Produtos eletrônicos em geral"
}
```

#### Subcategory
```typescript
{
  "nome": "Celulares",
  "categoriaPaiId": "clx123..."  // ID of "Eletrônicos"
}
```

#### Complete Category
```typescript
{
  "nome": "Smartphones Premium",
  "descricao": "Smartphones de alta qualidade",
  "categoriaPaiId": "clx456...",  // ID of "Celulares"
  "imagem": "https://example.com/smartphones.jpg",
  "ordem": 1,
  "ativo": true
}
```

### Updating Categories

#### Change Name (Slug Auto-Updates)
```typescript
// PUT /api/categorias/clx123...
{
  "nome": "Eletrônicos e Tecnologia"
}
// Slug changes from "eletronicos" to "eletronicos-e-tecnologia"
```

#### Move to Different Parent
```typescript
{
  "categoriaPaiId": "clx789..."  // New parent
}
```

#### Move to Root Level
```typescript
{
  "categoriaPaiId": null
}
```

#### Deactivate Category
```typescript
{
  "ativo": false
}
```

### Deleting Categories

#### Delete Empty Category
```typescript
// DELETE /api/categorias/clx123...
// Success if no products assigned
```

#### Force Delete (Even with Products)
```typescript
// DELETE /api/categorias/clx123...?force=true
// Removes category even if products are assigned
```

## API Examples

### Fetch Categories Tree

```javascript
const response = await fetch('/api/categorias')
const tree = await response.json()

console.log(tree)
// [
//   {
//     id: "1",
//     nome: "Eletrônicos",
//     subcategorias: [
//       {
//         id: "2",
//         nome: "Celulares",
//         subcategorias: [...]
//       }
//     ]
//   }
// ]
```

### Fetch Flat List

```javascript
const response = await fetch('/api/categorias?flat=true')
const categories = await response.json()

console.log(categories)
// [
//   { id: "1", nome: "Eletrônicos", categoriaPaiId: null },
//   { id: "2", nome: "Celulares", categoriaPaiId: "1" },
//   { id: "3", nome: "Samsung", categoriaPaiId: "2" }
// ]
```

### Fetch with Counts

```javascript
const response = await fetch('/api/categorias?flat=true&withCount=true')
const categories = await response.json()

console.log(categories[0])
// {
//   id: "1",
//   nome: "Eletrônicos",
//   _count: {
//     produtos: 15,
//     subcategorias: 3
//   }
// }
```

### Create Category

```javascript
const response = await fetch('/api/categorias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Nova Categoria',
    descricao: 'Descrição aqui',
  }),
})

if (response.ok) {
  const categoria = await response.json()
  console.log('Criado:', categoria.id)
} else {
  const error = await response.json()
  console.error('Erro:', error.error)
}
```

### Update Category

```javascript
const response = await fetch('/api/categorias/clx123...', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Nome Atualizado',
    ordem: 5,
  }),
})

if (response.ok) {
  const categoria = await response.json()
  console.log('Atualizado:', categoria)
}
```

### Delete Category

```javascript
// Try normal delete first
const response = await fetch('/api/categorias/clx123...', {
  method: 'DELETE',
})

if (!response.ok) {
  const error = await response.json()
  
  if (error.error.includes('produto(s)')) {
    // Has products, ask user for confirmation
    const confirmForce = confirm(
      'Esta categoria possui produtos. Deseja forçar a exclusão?'
    )
    
    if (confirmForce) {
      const forceResponse = await fetch(
        '/api/categorias/clx123...?force=true',
        { method: 'DELETE' }
      )
      
      if (forceResponse.ok) {
        console.log('Categoria excluída com força')
      }
    }
  }
}
```

## UI Examples

### Display Category Tree

```tsx
import { CategoryTree } from './components/CategoryTree'

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(setCategories)
  }, [])
  
  return (
    <CategoryTree
      categories={categories}
      onEdit={(cat) => console.log('Edit:', cat)}
      onDelete={(cat) => console.log('Delete:', cat)}
      onAddChild={(parentId) => console.log('Add child to:', parentId)}
    />
  )
}
```

### Create Form

```tsx
import { CategoryForm } from './components/CategoryForm'

function CreateCategoryModal({ categories, onClose }) {
  const handleSubmit = async (data) => {
    const response = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      onClose()
      // Refresh list
    }
  }
  
  return (
    <CategoryForm
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={onClose}
      isLoading={false}
    />
  )
}
```

### Edit Form

```tsx
function EditCategoryModal({ category, categories, onClose }) {
  const handleSubmit = async (data) => {
    const response = await fetch(`/api/categorias/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      onClose()
      // Refresh list
    }
  }
  
  return (
    <CategoryForm
      initialData={category}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={onClose}
      isLoading={false}
    />
  )
}
```

## Common Patterns

### 1. Building a Category Selector

```tsx
function CategorySelector({ value, onChange, categories }) {
  // Flatten tree to show all categories
  const flatCategories = flattenTree(categories)
  
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Nenhuma categoria</option>
      {flatCategories.map(cat => (
        <option key={cat.id} value={cat.id}>
          {'  '.repeat(cat.depth)}{cat.nome}
        </option>
      ))}
    </select>
  )
}

function flattenTree(tree, depth = 0) {
  return tree.flatMap(cat => [
    { ...cat, depth },
    ...flattenTree(cat.subcategorias, depth + 1)
  ])
}
```

### 2. Display Category Breadcrumb

```tsx
function CategoryBreadcrumb({ categoryId, categories }) {
  const path = getCategoryPath(categoryId, categories)
  
  return (
    <nav>
      {path.map((cat, i) => (
        <span key={cat.id}>
          {i > 0 && ' > '}
          <a href={`/categorias/${cat.slug}`}>{cat.nome}</a>
        </span>
      ))}
    </nav>
  )
}

function getCategoryPath(categoryId, categories) {
  const path = []
  let currentId = categoryId
  
  while (currentId) {
    const cat = categories.find(c => c.id === currentId)
    if (!cat) break
    path.unshift(cat)
    currentId = cat.categoriaPaiId
  }
  
  return path
}
```

### 3. Filter Products by Category (Including Subcategories)

```tsx
async function getProductsByCategory(categoryId) {
  // Get all descendant category IDs
  const response = await fetch('/api/categorias?flat=true')
  const categories = await response.json()
  
  const descendantIds = getDescendantIds(categoryId, categories)
  const allCategoryIds = [categoryId, ...descendantIds]
  
  // Fetch products for all these categories
  const productsResponse = await fetch(
    `/api/produtos?categoriaIds=${allCategoryIds.join(',')}`
  )
  return productsResponse.json()
}

function getDescendantIds(categoryId, categories) {
  const descendants = []
  
  function traverse(parentId) {
    const children = categories.filter(c => c.categoriaPaiId === parentId)
    for (const child of children) {
      descendants.push(child.id)
      traverse(child.id)
    }
  }
  
  traverse(categoryId)
  return descendants
}
```

### 4. Reorder Categories

```tsx
async function reorderCategories(categoryId, newOrder) {
  const response = await fetch(`/api/categorias/${categoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordem: newOrder }),
  })
  
  return response.json()
}

// Batch update multiple categories
async function batchReorder(updates) {
  const promises = updates.map(({ id, ordem }) =>
    reorderCategories(id, ordem)
  )
  
  await Promise.all(promises)
}
```

### 5. Search Categories

```tsx
function searchCategories(categories, query) {
  const lowerQuery = query.toLowerCase()
  
  return categories.filter(cat => {
    // Search in name
    if (cat.nome.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // Search in description
    if (cat.descricao?.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // Search in slug
    if (cat.slug.includes(lowerQuery)) {
      return true
    }
    
    return false
  })
}
```

### 6. Export Categories to CSV

```tsx
function exportToCSV(categories) {
  const rows = [
    ['ID', 'Nome', 'Slug', 'Pai', 'Produtos', 'Ativo']
  ]
  
  categories.forEach(cat => {
    rows.push([
      cat.id,
      cat.nome,
      cat.slug,
      cat.categoriaPai?.nome || '-',
      cat._count?.produtos || 0,
      cat.ativo ? 'Sim' : 'Não'
    ])
  })
  
  const csv = rows.map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'categorias.csv'
  a.click()
}
```

## Troubleshooting

### Issue: "Já existe uma categoria com este slug"

**Cause:** Slug must be unique per fornecedor.

**Solution:**
```typescript
// Option 1: Change the name
{ nome: "Eletrônicos 2" }  // slug: "eletronicos-2"

// Option 2: Manually set slug (not recommended)
{ nome: "Eletrônicos", slug: "eletronicos-especiais" }
```

### Issue: "Esta operação criaria uma referência circular"

**Cause:** Trying to make a descendant the parent.

**Example:**
```
A → B → C

Trying to set A's parent to C would create: C → A → B → C (circular)
```

**Solution:** Choose a different parent that is not a descendant.

### Issue: "Categoria não encontrada"

**Causes:**
1. Wrong category ID
2. Category belongs to different fornecedor
3. Category was deleted

**Solution:**
```typescript
// Check if category exists first
const response = await fetch(`/api/categorias/${id}`)
if (response.status === 404) {
  console.log('Category does not exist or not accessible')
}
```

### Issue: Category not showing in tree

**Causes:**
1. Parent category doesn't exist
2. Parent category is inactive
3. Frontend filter applied

**Solution:**
```typescript
// Fetch flat list to debug
const response = await fetch('/api/categorias?flat=true')
const categories = await response.json()

// Find the category
const cat = categories.find(c => c.id === categoryId)
console.log('Category:', cat)
console.log('Parent exists:', categories.find(c => c.id === cat.categoriaPaiId))
```

### Issue: Slow performance with many categories

**Solution:**
```typescript
// 1. Use flat view for large lists
setViewMode('list')

// 2. Implement pagination (future enhancement)

// 3. Lazy load subcategories
// Only fetch when user expands a node

// 4. Cache on client
const cachedCategories = useMemo(() => 
  buildCategoryTree(categories),
  [categories]
)
```

### Issue: Parent selector shows wrong options

**Cause:** Trying to select self or descendant as parent.

**Solution:** The form already handles this by filtering:
```typescript
// In CategoryForm.tsx
const availableParents = flattenCategories(categories)
  .filter(cat => cat.id !== initialData?.id)
```

## Testing Checklist

### Manual Testing Steps

1. **Create Root Category**
   - [ ] Create category without parent
   - [ ] Verify slug generated correctly
   - [ ] Check it appears in tree/list

2. **Create Subcategory**
   - [ ] Create category with parent
   - [ ] Verify appears under parent in tree
   - [ ] Check breadcrumb path is correct

3. **Edit Category**
   - [ ] Change name (verify slug updates)
   - [ ] Change description
   - [ ] Change parent (verify in tree)
   - [ ] Toggle active status

4. **Circular Reference Prevention**
   - [ ] Try to set A's parent to B (where B is child of A)
   - [ ] Verify error message shown

5. **Delete Category**
   - [ ] Delete empty category (success)
   - [ ] Try delete with products (shows warning)
   - [ ] Force delete with products (success)
   - [ ] Try delete with subcategories (shows warning)

6. **Tree View**
   - [ ] Expand/collapse works
   - [ ] Indentation shows correctly
   - [ ] Actions visible on each node

7. **List View**
   - [ ] All categories shown
   - [ ] Parent name displayed
   - [ ] Counts displayed

## Best Practices

1. **Always validate parent exists before setting**
2. **Check for circular references on parent change**
3. **Count products before deletion**
4. **Use slug for URLs, not IDs**
5. **Cache tree structure on client**
6. **Handle loading and error states**
7. **Show user-friendly error messages**
8. **Confirm destructive operations**

## Need Help?

- Check `CATEGORIES_MODULE_DOCUMENTATION.md` for API reference
- Check `CATEGORIES_ARCHITECTURE.md` for system design
- Check `CATEGORIES_IMPLEMENTATION_SUMMARY.md` for overview
