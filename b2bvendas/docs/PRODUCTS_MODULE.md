# Products Module - Complete Implementation

## Overview

This document describes the complete implementation of the Products module for the B2B Marketplace, following the **Controller → Service → Repository** architectural pattern.

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│         UI Layer (Next.js Pages)        │
│  - Product Listing                      │
│  - Product Form (Create/Edit)           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         API Layer (Route Handlers)      │
│  - GET /api/produtos                    │
│  - POST /api/produtos                   │
│  - GET /api/produtos/[id]               │
│  - PUT /api/produtos/[id]               │
│  - DELETE /api/produtos/[id]            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Controller Layer                │
│  - Request/Response handling            │
│  - Authentication validation            │
│  - Error handling                       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Service Layer                   │
│  - Business logic                       │
│  - Validation (SKU uniqueness)          │
│  - Stock constraint checks              │
│  - Logging                              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Repository Layer                │
│  - Database operations                  │
│  - Query building                       │
│  - Multi-tenant filtering               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Database (PostgreSQL)           │
└─────────────────────────────────────────┘
```

## File Structure

```
src/
├── lib/
│   └── base/
│       ├── BaseRepository.ts    # Base class for repositories
│       ├── BaseService.ts       # Base class for services
│       ├── BaseController.ts    # Base class for controllers
│       └── index.ts             # Exports
│
├── modules/
│   └── produtos/
│       ├── types.ts             # TypeScript interfaces
│       ├── validation.ts        # Zod schemas
│       ├── repository.ts        # Data access layer
│       ├── service.ts           # Business logic layer
│       ├── controller.ts        # HTTP handling layer
│       └── index.ts             # Exports
│
└── components/
    └── produtos/
        ├── ProductForm.tsx      # Reusable form component
        ├── ProductTable.tsx     # Product listing table
        ├── ProductCard.tsx      # Product display card
        └── index.ts             # Exports

app/
├── api/
│   └── produtos/
│       ├── route.ts             # GET (list), POST (create)
│       └── [id]/
│           └── route.ts         # GET, PUT, DELETE by ID
│
└── dashboard/
    └── fornecedor/
        └── produtos/
            ├── page.tsx                    # Product listing page
            ├── novo/
            │   └── page.tsx                # Create product page
            └── [id]/
                └── editar/
                    └── page.tsx            # Edit product page
```

## Implementation Details

### 1. Base Classes

#### BaseRepository (`src/lib/base/BaseRepository.ts`)
- Provides access to Prisma client
- All repositories extend this class
- Ensures consistent database access patterns

#### BaseService (`src/lib/base/BaseService.ts`)
- Provides access to Winston logger
- All services extend this class
- Ensures consistent logging patterns

#### BaseController (`src/lib/base/BaseController.ts`)
- Provides error handling utilities
- Maps errors to appropriate HTTP status codes
- Handles Zod validation errors
- All controllers extend this class

### 2. Products Module

#### Types (`src/modules/produtos/types.ts`)
Defines TypeScript interfaces:
- `ProdutoCreateInput`: Data for creating a product
- `ProdutoUpdateInput`: Data for updating a product
- `ProdutoFilters`: Query filters (search, categoriaId, ativo, destaque)
- `PaginationParams`: Pagination parameters (page, limit)
- `PaginatedResponse<T>`: Paginated response structure

#### Validation (`src/modules/produtos/validation.ts`)
Zod schemas for validation:
- `createProdutoSchema`: Validates product creation data
- `updateProdutoSchema`: Validates product update data
- `produtoFiltersSchema`: Validates query parameters

#### Repository (`src/modules/produtos/repository.ts`)
Data access methods:
- `findAll()`: List products with filters and pagination
- `findById()`: Get product by ID (with fornecedor check)
- `findBySku()`: Find product by SKU (with fornecedor check)
- `create()`: Create new product
- `update()`: Update product (with fornecedor check)
- `delete()`: Soft delete (set ativo=false)
- `hardDelete()`: Permanent deletion

**Key Features:**
- Always filters by `fornecedorId` (multi-tenant)
- Includes related categoria data
- Supports search across multiple fields
- Handles Decimal type for prices

#### Service (`src/modules/produtos/service.ts`)
Business logic:
- Validates SKU uniqueness per fornecedor
- Validates stock constraints:
  - Quantity cannot be less than minimum
  - Quantity cannot exceed maximum
  - Minimum cannot exceed maximum
- Logs all CRUD operations
- Throws appropriate errors (ValidationError, NotFoundError)

#### Controller (`src/modules/produtos/controller.ts`)
HTTP request handling:
- `getAll()`: Handle GET /api/produtos
- `getById()`: Handle GET /api/produtos/[id]
- `create()`: Handle POST /api/produtos
- `update()`: Handle PUT /api/produtos/[id]
- `delete()`: Handle DELETE /api/produtos/[id]

**Key Features:**
- Parses query parameters
- Validates request bodies using Zod
- Catches and handles all errors
- Returns proper HTTP status codes

### 3. API Routes

#### `/api/produtos/route.ts`
- **GET**: List products with filters and pagination
  - Requires FORNECEDOR role
  - Automatically filters by authenticated user's fornecedorId
  - Query params: search, categoriaId, ativo, destaque, page, limit
  
- **POST**: Create new product
  - Requires FORNECEDOR role
  - Automatically sets fornecedorId from session
  - Validates all required fields

#### `/api/produtos/[id]/route.ts`
- **GET**: Get product by ID
  - Requires FORNECEDOR role
  - Checks ownership (fornecedorId match)
  
- **PUT**: Update product
  - Requires FORNECEDOR role
  - Checks ownership (fornecedorId match)
  - Only updates provided fields
  
- **DELETE**: Soft delete product
  - Requires FORNECEDOR role
  - Checks ownership (fornecedorId match)
  - Sets ativo=false (doesn't actually delete)

### 4. UI Components

#### ProductForm (`src/components/produtos/ProductForm.tsx`)
Reusable form component for create/edit:
- All product fields (nome, SKU, preço, estoque, etc.)
- Checkbox fields (ativo, destaque)
- Client-side validation
- Error display
- Loading states
- Used by both create and edit pages

#### ProductTable (`src/components/produtos/ProductTable.tsx`)
Product listing table:
- Displays: nome, SKU, preço, estoque, status
- Edit button (links to edit page)
- Delete button (with confirmation)
- Format price in BRL
- Show status badge (Ativo/Inativo)

#### ProductCard (`src/components/produtos/ProductCard.tsx`)
Product card for grid view:
- Product image or placeholder
- Product name, SKU, description
- Price formatted in BRL
- Stock quantity with unit
- Status badge
- Destaque badge if applicable

### 5. Dashboard Pages

#### List Page (`app/dashboard/fornecedor/produtos/page.tsx`)
- Fetches products from API
- Search functionality
- Status filter (all, active, inactive)
- Pagination controls
- "New Product" button
- Uses ProductTable component

#### Create Page (`app/dashboard/fornecedor/produtos/novo/page.tsx`)
- Uses ProductForm component
- Submits to POST /api/produtos
- Redirects to list on success
- Shows validation errors

#### Edit Page (`app/dashboard/fornecedor/produtos/[id]/editar/page.tsx`)
- Fetches product data from API
- Pre-fills ProductForm with existing data
- Submits to PUT /api/produtos/[id]
- Redirects to list on success
- Shows validation errors

## Multi-Tenancy

All product operations are multi-tenant aware:

1. **Authentication**: All endpoints require FORNECEDOR role
2. **Automatic filtering**: Products are always filtered by the authenticated user's fornecedorId
3. **Ownership validation**: Update/Delete operations verify the product belongs to the authenticated fornecedor
4. **SKU uniqueness**: SKU is validated as unique per fornecedor (not globally)

## Validation Rules

### Create Product
- **Required**: fornecedorId, nome, sku, precoBase
- **Optional**: categoriaId, descricao, imagens, unidade, estoque fields
- **Constraints**:
  - nome: 3-255 characters
  - sku: 1-100 characters
  - precoBase: must be positive
  - Stock fields: must be non-negative integers

### Update Product
- All fields optional (partial update)
- Same constraints as create for provided fields
- SKU uniqueness checked if SKU is updated

### Stock Constraints
- Quantity ≥ Minimum
- Quantity ≤ Maximum (if set)
- Minimum ≤ Maximum (if set)

## Error Handling

The system uses a hierarchical error handling approach:

1. **Zod Validation Errors** → 400 with validation details
2. **ValidationError** → 400 with custom message
3. **UnauthorizedError** → 401
4. **ForbiddenError** → 403
5. **NotFoundError** → 404
6. **AppError** → Custom status code
7. **Generic Error** → 500

All errors are logged using Winston logger.

## Session Enhancement

Updated authentication to include fornecedorId and clienteId:

### Type Definition (`src/types/next-auth.d.ts`)
Added optional fields to Session and JWT:
- `fornecedorId?: string`
- `clienteId?: string`

### Auth Options (`src/lib/authOptions.ts`)
- Fetches fornecedor and cliente relationships on login
- Includes IDs in JWT token
- Populates session with IDs

## Testing Checklist

- [ ] Create product with all required fields
- [ ] Create product with optional fields
- [ ] Validate required fields (should fail)
- [ ] Validate SKU uniqueness within same fornecedor
- [ ] Validate stock constraints
- [ ] List products with pagination
- [ ] Search products by name/SKU/description
- [ ] Filter products by category
- [ ] Filter products by status (ativo)
- [ ] Get product by ID
- [ ] Update product (partial update)
- [ ] Update product SKU (validate uniqueness)
- [ ] Delete product (soft delete)
- [ ] Verify multi-tenancy (can't access other fornecedor's products)
- [ ] Test authentication (all endpoints require FORNECEDOR role)

## Future Enhancements

Potential improvements for the Products module:

1. **Image Upload**: Integrate with cloud storage (S3, Cloudinary)
2. **Bulk Operations**: Import/export products via CSV
3. **Product Variants**: Support for sizes, colors, etc.
4. **Inventory Alerts**: Notify when stock is low
5. **Price History**: Track price changes over time
6. **Product Analytics**: View metrics, popular products
7. **Advanced Search**: Elasticsearch integration
8. **Product Tags**: Additional categorization
9. **Product Reviews**: Customer feedback
10. **Related Products**: Recommendations

## Performance Considerations

1. **Database Indexes**: Ensure indexes on:
   - `fornecedorId` (filter)
   - `sku` (uniqueness check)
   - `ativo` (filter)
   - `categoriaId` (filter)

2. **Pagination**: Default limit of 10, max of 100

3. **Query Optimization**: 
   - Use `select` to fetch only needed fields
   - Use `include` sparingly
   - Consider caching for frequently accessed data

4. **Search Performance**:
   - Full-text search on name/description
   - Consider Elasticsearch for better search

## Security Considerations

1. **Authentication**: All endpoints require valid session
2. **Authorization**: FORNECEDOR role required for all operations
3. **Multi-tenancy**: Automatic fornecedorId filtering prevents cross-tenant access
4. **Input Validation**: All inputs validated with Zod schemas
5. **SQL Injection**: Protected by Prisma ORM
6. **Error Messages**: Don't expose sensitive information

## Conclusion

This implementation provides a complete, production-ready Products module with:
- Clean separation of concerns
- Type safety
- Input validation
- Multi-tenancy
- Error handling
- Logging
- Reusable components
- Full CRUD operations
- Search and filtering
- Pagination
