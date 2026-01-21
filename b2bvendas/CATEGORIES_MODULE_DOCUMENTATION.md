# Categories Module Documentation

## Overview

Complete implementation of a hierarchical categories management system for the B2B Marketplace platform. Supports unlimited nesting levels, automatic slug generation, circular reference prevention, and multi-tenant scoping.

## Architecture

### Module Structure

```
src/modules/categorias/
├── types.ts              # TypeScript interfaces and types
├── validation.ts         # Zod validation schemas
├── helpers.ts            # Tree building and utility functions
├── repository.ts         # Data access layer
├── service.ts            # Business logic layer
├── controller.ts         # HTTP request handlers
└── index.ts              # Module exports

app/api/categorias/
├── route.ts              # GET (list/tree), POST (create)
└── [id]/route.ts         # GET (by id), PUT (update), DELETE (delete)

app/dashboard/fornecedor/categorias/
├── page.tsx              # Main dashboard page
└── components/
    ├── CategoryTree.tsx  # Recursive tree component
    ├── CategoryForm.tsx  # Create/Edit form
    └── CategoryCard.tsx  # Card display for list view
```

## Features

### ✅ Core Features

1. **Hierarchical Structure**
   - Unlimited nesting depth
   - Parent-child relationships via `categoriaPaiId`
   - Self-referencing foreign key with Prisma

2. **Automatic Slug Generation**
   - Slugs auto-generated from category name
   - Unique per fornecedor (multi-tenant)
   - Normalized and URL-safe

3. **Circular Reference Prevention**
   - Validates parent selection won't create cycles
   - Checks entire ancestor chain
   - Prevents category from being its own parent/grandparent

4. **Tree Building**
   - Converts flat list to hierarchical tree
   - Recursive algorithm with optimal performance
   - Sorted by ordem and nome

5. **Multi-Tenant Isolation**
   - All queries scoped to fornecedorId
   - Unique slugs per fornecedor
   - Complete data isolation

6. **Product Association Checks**
   - Validates before deletion
   - Counts products per category
   - Force delete option available

### 🎨 UI Features

1. **Dual View Modes**
   - **Tree View**: Hierarchical with expand/collapse
   - **List View**: Flat cards with parent info

2. **Tree View Features**
   - Recursive rendering
   - Expand/collapse with icons
   - Indentation shows hierarchy
   - Quick actions on each node

3. **Form Features**
   - Parent category selector (excludes self)
   - Automatic slug generation
   - Image URL support
   - Active/inactive toggle
   - Manual ordering

4. **Visual Indicators**
   - Product count per category
   - Subcategory count
   - Active/inactive status badges
   - Folder icons

## API Reference

### Endpoints

#### `GET /api/categorias`

Get categories (tree or flat list).

**Query Parameters:**
- `flat=true` - Return flat list instead of tree
- `withCount=true` - Include product/subcategory counts

**Response (Tree):**
```json
[
  {
    "id": "clx123...",
    "fornecedorId": "clx456...",
    "nome": "Eletrônicos",
    "slug": "eletronicos",
    "descricao": "Produtos eletrônicos",
    "imagem": "https://...",
    "categoriaPaiId": null,
    "ativo": true,
    "ordem": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "subcategorias": [
      {
        "id": "clx789...",
        "nome": "Celulares",
        "slug": "celulares",
        "categoriaPaiId": "clx123...",
        "subcategorias": []
      }
    ]
  }
]
```

#### `POST /api/categorias`

Create new category.

**Request Body:**
```json
{
  "nome": "Nova Categoria",
  "descricao": "Descrição opcional",
  "categoriaPaiId": "clx123...",  // Optional
  "imagem": "https://...",         // Optional
  "ativo": true,                   // Default: true
  "ordem": 0                       // Default: 0
}
```

**Notes:**
- `fornecedorId` is automatically added from session
- `slug` is auto-generated from `nome`
- Validates parent exists and no circular references

#### `GET /api/categorias/[id]`

Get single category with counts.

**Response:**
```json
{
  "id": "clx123...",
  "nome": "Eletrônicos",
  "slug": "eletronicos",
  "_count": {
    "produtos": 15,
    "subcategorias": 3
  },
  "categoriaPai": {
    "id": "clx000...",
    "nome": "Categoria Pai"
  }
}
```

#### `PUT /api/categorias/[id]`

Update category.

**Request Body:**
```json
{
  "nome": "Nome Atualizado",
  "descricao": "Nova descrição",
  "categoriaPaiId": "clx456...",
  "ativo": false,
  "ordem": 5
}
```

**Notes:**
- All fields optional
- Slug auto-updated if nome changes
- Validates circular references if parent changes

#### `DELETE /api/categorias/[id]`

Delete category.

**Query Parameters:**
- `force=true` - Force delete even if has products

**Error Responses:**
- `400` - Category has products (without force)
- `400` - Category has subcategories
- `404` - Category not found

## Data Model

### Prisma Schema

```prisma
model Categoria {
  id             String     @id @default(cuid())
  fornecedorId   String
  nome           String
  slug           String
  descricao      String?    @db.Text
  imagem         String?
  categoriaPaiId String?
  ativo          Boolean    @default(true)
  ordem          Int        @default(0)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  // Relations
  fornecedor     Fornecedor  @relation(fields: [fornecedorId], references: [id], onDelete: Cascade)
  categoriaPai   Categoria?  @relation("SubCategorias", fields: [categoriaPaiId], references: [id], onDelete: SetNull)
  subcategorias  Categoria[] @relation("SubCategorias")
  produtos       Produto[]

  @@unique([fornecedorId, slug])
  @@map("categorias")
}
```

## Business Logic

### Slug Generation

```typescript
// From src/lib/utils.ts
generateSlug("Eletrônicos & Computadores")
// Returns: "eletronicos-computadores"
```

- Lowercase transformation
- Unicode normalization
- Special character removal
- Space to hyphen conversion
- Multiple hyphen cleanup

### Circular Reference Prevention

```typescript
// Validates: A → B → C (can't make C parent of A)
wouldCreateCircularReference(categoryId, newParentId, allCategories)
```

- Traverses ancestor chain
- Detects cycles
- Returns true if circular reference would occur

### Tree Building

```typescript
buildCategoryTree(flatCategories, parentId = null)
```

**Algorithm:**
1. Filter categories by parentId
2. For each category, recursively build subcategories
3. Sort by ordem, then nome
4. Return tree structure

**Complexity:** O(n) where n = number of categories

## Usage Examples

### Creating a Category

```typescript
// API call from frontend
const response = await fetch('/api/categorias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Eletrônicos',
    descricao: 'Produtos eletrônicos',
    ativo: true,
  }),
})
```

### Creating a Subcategory

```typescript
const response = await fetch('/api/categorias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Celulares',
    categoriaPaiId: 'clx123...', // Parent category ID
  }),
})
```

### Moving a Category

```typescript
const response = await fetch(`/api/categorias/${categoryId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    categoriaPaiId: 'clx456...', // New parent
  }),
})
```

### Deleting with Products

```typescript
// Force delete (removes products association)
const response = await fetch(`/api/categorias/${categoryId}?force=true`, {
  method: 'DELETE',
})
```

## Helper Functions

### buildCategoryTree

Converts flat list to hierarchical tree structure.

```typescript
const tree = buildCategoryTree(categories, null)
```

### flattenCategoryTree

Converts tree back to flat list.

```typescript
const flat = flattenCategoryTree(tree)
```

### getCategoryPath

Gets breadcrumb path from root to category.

```typescript
const path = getCategoryPath(categoryId, allCategories)
// Returns: [{ id, nome, slug }, ...]
```

### getDescendantIds

Gets all descendant IDs recursively.

```typescript
const descendants = getDescendantIds(categoryId, allCategories)
// Returns: ['id1', 'id2', 'id3', ...]
```

### getCategoryDepth

Calculates nesting depth.

```typescript
const depth = getCategoryDepth(categoryId, allCategories)
// Returns: 0 (root), 1 (child), 2 (grandchild), etc.
```

## Component Documentation

### CategoryTree Component

Recursive tree component with expand/collapse.

**Props:**
- `categories: CategoriaTree[]` - Tree data
- `onEdit: (category) => void` - Edit handler
- `onDelete: (category) => void` - Delete handler
- `onAddChild: (parentId) => void` - Add subcategory handler
- `level?: number` - Current nesting level (internal)

**Features:**
- Expandable/collapsible nodes
- Indentation shows hierarchy
- Icons: folder, chevron, actions
- Product count display
- Active/inactive badges

### CategoryForm Component

Create/Edit form with validation.

**Props:**
- `initialData?: CategoriaTree` - For editing
- `parentId?: string` - Pre-select parent
- `categories: CategoriaTree[]` - For parent selector
- `onSubmit: (data) => Promise<void>` - Submit handler
- `onCancel: () => void` - Cancel handler
- `isLoading: boolean` - Loading state

**Features:**
- Auto-complete fields from initialData
- Parent selector (excludes self)
- Client-side validation
- Error display per field
- Disabled during submission

### CategoryCard Component

Card display for list view.

**Props:**
- `category: CategoriaWithCount` - Category data
- `onEdit: (category) => void` - Edit handler
- `onDelete: (category) => void` - Delete handler

**Features:**
- Folder icon
- Slug badge
- Product/subcategory counts
- Parent category link
- Action buttons

## Security

### Authentication

All endpoints require `Role.FORNECEDOR` authentication via `requireRole()`.

### Authorization

All queries scoped to `fornecedorId` from session:
- Cannot access other fornecedor's categories
- Unique slugs per fornecedor
- Cascade delete on fornecedor removal

### Validation

- Zod schemas validate all inputs
- Type-safe with TypeScript
- SQL injection prevented by Prisma

## Performance

### Optimizations

1. **Batch Queries**: Single query fetches all categories
2. **In-Memory Tree Building**: O(n) algorithm
3. **Index on slug**: Fast slug uniqueness checks
4. **Lazy Loading**: Subcategories only when expanded

### Database Indexes

```prisma
@@unique([fornecedorId, slug])  // Slug lookup and uniqueness
```

### Recommendations

- For 1000+ categories, consider pagination
- Use tree view for better UX with deep hierarchies
- Cache tree structure on client

## Testing

### Manual Testing Checklist

- [ ] Create root category
- [ ] Create subcategory
- [ ] Create grandchild category
- [ ] Edit category name (slug updates)
- [ ] Change parent (move category)
- [ ] Try circular reference (should fail)
- [ ] Delete category with products (should warn)
- [ ] Delete empty category
- [ ] Toggle active/inactive
- [ ] Reorder categories
- [ ] View in tree mode
- [ ] View in list mode
- [ ] Search/filter (future feature)

### API Testing

```bash
# Get categories tree
curl -X GET http://localhost:3000/api/categorias \
  -H "Cookie: session=..."

# Create category
curl -X POST http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"nome":"Test Category"}'

# Update category
curl -X PUT http://localhost:3000/api/categorias/clx123... \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"nome":"Updated Name"}'

# Delete category
curl -X DELETE http://localhost:3000/api/categorias/clx123... \
  -H "Cookie: session=..."
```

## Future Enhancements

### Planned Features

1. **Drag & Drop Reordering**
   - Visual drag and drop in tree view
   - Auto-update ordem field

2. **Image Upload**
   - Direct file upload
   - Image optimization
   - CDN integration

3. **Search & Filter**
   - Search by name
   - Filter by active status
   - Filter by product count

4. **Bulk Operations**
   - Multi-select categories
   - Bulk activate/deactivate
   - Bulk delete

5. **Category Templates**
   - Pre-defined category structures
   - Import from marketplace standards

6. **Analytics**
   - Most popular categories
   - Product distribution
   - Sales by category

## Troubleshooting

### Common Issues

**Issue: "Já existe uma categoria com este slug"**
- Solution: Change category name or manually set slug

**Issue: "Esta operação criaria uma referência circular"**
- Solution: Cannot make a descendant the parent

**Issue: "Esta categoria possui X produto(s) associado(s)"**
- Solution: Reassign products or use force delete

**Issue: Category not showing in tree**
- Solution: Check if parent category exists and is valid

## Support

For issues or questions:
1. Check this documentation
2. Review API error messages
3. Check browser console for frontend errors
4. Review server logs for backend errors

## Contributors

- Initial implementation: Categories Module v1.0
- Architecture: Based on existing Produtos module pattern
- UI Components: Lucide React icons, Tailwind CSS
