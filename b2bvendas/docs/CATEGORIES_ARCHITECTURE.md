# Categories Module Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard Page (/dashboard/fornecedor/categorias)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ CategoryTree │  │ CategoryForm │  │ CategoryCard │          │
│  │  Component   │  │  Component   │  │  Component   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/categorias                                                 │
│  ├─ GET  (list/tree)  ──────────────────┐                       │
│  └─ POST (create)                        │                       │
│                                          │                       │
│  /api/categorias/[id]                    │                       │
│  ├─ GET    (by id)                       │                       │
│  ├─ PUT    (update)    ──────────────────┤                       │
│  └─ DELETE (delete)                      │                       │
│                                          │                       │
│         ┌─ requireRole(FORNECEDOR) ◄────┘                       │
│         │  (Authentication)                                      │
└─────────┼──────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  CategoriaController                                             │
│  ├─ getAll()         ──┐                                         │
│  ├─ getTree()          │                                         │
│  ├─ create()           │                                         │
│  ├─ getById()          │                                         │
│  ├─ update()           │  Handles HTTP                           │
│  ├─ delete()           │  Requests/Responses                     │
│  ├─ move()             │                                         │
│  ├─ getPath()          │                                         │
│  └─ getSubcategories() │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  CategoriaService (Business Logic)                               │
│  ┌──────────────────────────────────────────────────┐           │
│  │ • Slug generation (generateSlug)                 │           │
│  │ • Slug uniqueness validation                     │           │
│  │ • Parent category validation                     │           │
│  │ • Circular reference prevention                  │           │
│  │ • Product count checks                           │           │
│  │ • Tree structure building                        │           │
│  │ • Multi-tenant scoping (fornecedorId)            │           │
│  └──────────────────────────────────────────────────┘           │
│                         │                                        │
│  Uses helpers:          │                                        │
│  ├─ buildCategoryTree() │                                        │
│  ├─ getCategoryPath()   │                                        │
│  ├─ wouldCreateCircularReference()                               │
│  └─ getDescendantIds()  │                                        │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  CategoriaRepository (Data Access)                               │
│  ┌──────────────────────────────────────────────────┐           │
│  │ QUERIES:                                         │           │
│  │ • findAll()              • findById()            │           │
│  │ • findAllWithCount()     • findBySlug()          │           │
│  │ • findRootCategories()   • findSubcategories()   │           │
│  │                                                  │           │
│  │ MUTATIONS:                                       │           │
│  │ • create()               • update()              │           │
│  │ • delete()               • softDelete()          │           │
│  │ • moveCategory()         • updateOrder()         │           │
│  │                                                  │           │
│  │ CHECKS:                                          │           │
│  │ • slugExists()           • countProducts()       │           │
│  │ • countSubcategories()                           │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Prisma ORM                                                      │
│  ┌──────────────────────────────────────────────────┐           │
│  │  model Categoria {                               │           │
│  │    id              String                        │           │
│  │    fornecedorId    String   ◄─── Multi-tenant   │           │
│  │    nome            String                        │           │
│  │    slug            String   ◄─── Auto-generated │           │
│  │    descricao       String?                       │           │
│  │    imagem          String?                       │           │
│  │    categoriaPaiId  String?  ◄─── Self-reference │           │
│  │    ativo           Boolean                       │           │
│  │    ordem           Int                           │           │
│  │    createdAt       DateTime                      │           │
│  │    updatedAt       DateTime                      │           │
│  │                                                  │           │
│  │    // Relations                                  │           │
│  │    fornecedor      Fornecedor                    │           │
│  │    categoriaPai    Categoria?                    │           │
│  │    subcategorias   Categoria[]                   │           │
│  │    produtos        Produto[]                     │           │
│  │                                                  │           │
│  │    @@unique([fornecedorId, slug])                │           │
│  │  }                                               │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Creating a Category

```
User fills form → POST /api/categorias → Controller.create()
  → Service.create():
      - Generate slug from nome
      - Validate slug uniqueness
      - Validate parent exists
      - Add fornecedorId from session
  → Repository.create()
  → Prisma inserts to database
  → Returns created category
  → UI updates tree/list
```

### Tree Building Flow

```
User visits page → GET /api/categorias → Controller.getAll()
  → Service.findTree():
      - Repository.findAll() fetches flat list
      - buildCategoryTree() converts to hierarchy:
          1. Filter categories by parentId (null for roots)
          2. Recursively build subcategorias
          3. Sort by ordem, then nome
      - Returns nested tree structure
  → UI renders with CategoryTree component:
      - Recursive rendering
      - Expand/collapse state management
      - Actions per node
```

### Circular Reference Prevention

```
User tries to set parent → PUT /api/categorias/[id]
  → Service.update():
      - Get all categories for fornecedor
      - wouldCreateCircularReference():
          1. Start from newParentId
          2. Traverse up the ancestor chain
          3. Check if categoryId appears in chain
          4. Return true if circular reference detected
      - Throw error if circular
      - Otherwise proceed with update
```

## Key Design Patterns

### 1. Repository Pattern
- Encapsulates data access logic
- Abstracts Prisma queries
- Reusable across services

### 2. Service Pattern
- Business logic layer
- Validation and rules
- Orchestrates multiple repository calls

### 3. Controller Pattern
- HTTP request/response handling
- Delegates to service layer
- Error handling

### 4. Recursive Components
- CategoryTree renders itself for children
- Handles unlimited nesting depth
- Manages expand/collapse state

### 5. Multi-Tenant Scoping
- All queries filtered by fornecedorId
- Enforced at repository level
- Session-based authentication

## Security Model

```
┌────────────────────┐
│  Authentication    │  ← requireRole(FORNECEDOR)
│  (Session)         │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Authorization     │  ← fornecedorId from session
│  (Multi-tenant)    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Validation        │  ← Zod schemas
│  (Input)           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Business Rules    │  ← Service layer
│  (Logic)           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Database          │  ← Prisma (SQL injection safe)
│  (Storage)         │
└────────────────────┘
```

## Performance Considerations

### Database Queries
- Single query fetches all categories
- Includes relations with `include`
- Indexed on `[fornecedorId, slug]`

### Tree Building
- O(n) complexity
- In-memory processing
- No N+1 query problem

### Frontend Rendering
- Lazy rendering (collapsed by default)
- Memoization for components
- Batch updates with useState

### Optimization Tips
- For 1000+ categories: Consider pagination
- Cache tree structure on client
- Use `withCount` only when needed
- Debounce search/filter inputs

## Error Handling

```
┌─────────────────────────────────────────────┐
│  Controller catches all errors              │
│  ├─ ZodError → 400 (Validation)             │
│  ├─ "não encontrada" → 404 (Not Found)      │
│  ├─ Business errors → 400 (Bad Request)     │
│  └─ Unknown → 500 (Internal Server Error)   │
└─────────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests (Planned)
- Service logic (slug generation, circular refs)
- Helper functions (tree building, path finding)
- Validation schemas

### Integration Tests (Planned)
- API endpoints
- Database operations
- Authentication/Authorization

### E2E Tests (Planned)
- Full CRUD workflow
- Tree interactions
- Form submissions

## Future Enhancements

1. **Drag & Drop**: Visual reordering in tree
2. **Bulk Operations**: Multi-select and batch actions
3. **Search**: Real-time search across categories
4. **Analytics**: Category performance metrics
5. **Templates**: Pre-defined category structures
6. **Image Upload**: Direct file upload with optimization
