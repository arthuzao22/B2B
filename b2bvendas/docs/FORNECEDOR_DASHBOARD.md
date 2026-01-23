# Fornecedor Dashboard - Documentation

## Overview

The Fornecedor (Supplier) Dashboard is a comprehensive management interface for suppliers to manage their products, orders, clients, pricing, and inventory in the B2B sales system.

## Pages

### 1. Dashboard Home
**Route:** `/dashboard/fornecedor`

**Features:**
- Welcome message with supplier name
- 4 Statistics Cards showing:
  - Total Products (with trend percentage)
  - Total Orders (with trend percentage)
  - Total Revenue (with trend percentage)
  - Active Clients (with trend percentage)
- Recent Orders table displaying the last 5 orders
- Quick Actions section with buttons to:
  - Add Product
  - View Orders
  - Manage Categories
  - Control Stock
  - View Clients

**Components Used:**
- `DashboardLayout`
- `StatsCard`
- `Card`, `Button`, `Badge`, `Table`

---

### 2. Orders List
**Route:** `/dashboard/fornecedor/pedidos`

**Features:**
- Filter tabs by order status:
  - All
  - Pending (Pendente)
  - Confirmed (Confirmado)
  - Shipped (Enviado)
  - Delivered (Entregue)
  - Cancelled (Cancelado)
- Orders table with columns:
  - Order Number
  - Client Name
  - Date
  - Status (with color-coded badges)
  - Total Amount
  - Actions (View Details button)
- Pagination support
- Empty state when no orders match filters
- Responsive design

**Components Used:**
- `DashboardLayout`
- `Table`, `TablePagination`
- `Badge` for status indicators
- `EmptyState`, `Spinner`

---

### 3. Order Details
**Route:** `/dashboard/fornecedor/pedidos/[id]`

**Features:**
- Order header with:
  - Order number
  - Status badge
  - Order date and time
- Customer information card showing:
  - Company name
  - Email
  - Phone
  - Full address
- Order items table with:
  - Product name
  - Quantity
  - Unit price
  - Subtotal
- Order summary displaying:
  - Subtotal
  - Shipping cost
  - Total amount
- Status update section with action buttons:
  - Confirm Order
  - Ship Order
  - Mark as Delivered
  - Cancel Order
- Back button to return to orders list

**Components Used:**
- `DashboardLayout`
- `Card`, `Table`, `Button`, `Badge`
- Icon components from `lucide-react`

---

### 4. Clients List
**Route:** `/dashboard/fornecedor/clientes`

**Features:**
- Search bar to filter clients by:
  - Company name
  - Contact name
  - Email
- Clients table with columns:
  - Company Name
  - Contact Name
  - Email
  - Total Orders
  - Total Spent
  - Actions (View button)
- Pagination support
- Empty state for no results
- Real-time search filtering

**Components Used:**
- `DashboardLayout`
- `Input` with search icon
- `Table`, `TablePagination`
- `EmptyState`, `Spinner`

---

### 5. Price Lists
**Route:** `/dashboard/fornecedor/precos`

**Features:**
- Create Price List button
- Price lists table showing:
  - List name
  - Type (Client or Category)
  - Target (Client/Category name)
  - Discount type (Percentage or Fixed)
  - Discount value
  - Active status
  - Actions (Edit, Delete)
- Create/Edit dialog with form fields:
  - List name
  - Type selection (Client/Category)
  - Target input
  - Discount type selection
  - Discount value input
  - Active status toggle
- Delete confirmation
- Empty state with call-to-action

**Components Used:**
- `DashboardLayout`
- `Dialog` for CRUD operations
- `Table`, `Badge`, `Button`
- `Input`, `Select`, `Label`
- `EmptyState`

---

### 6. Stock Control
**Route:** `/dashboard/fornecedor/estoque`

**Features:**
- Filter toggle to show only low/out of stock items
- Products table with columns:
  - Product Name
  - SKU
  - Current Stock (color-coded by status)
  - Minimum Stock
  - Status badge (In Stock, Low Stock, Out of Stock)
  - Last Updated timestamp
  - Actions (Update Stock button)
- Update stock modal with:
  - Product details
  - Current stock display
  - New quantity input
  - Warning for below minimum stock
- Pagination support
- Empty state

**Status Colors:**
- 🟢 In Stock (Green) - Stock above minimum
- 🟡 Low Stock (Orange) - Stock below minimum but not zero
- 🔴 Out of Stock (Red) - Zero stock

**Components Used:**
- `DashboardLayout`
- `Dialog` for stock updates
- `Table`, `TablePagination`
- `Badge` with status variants
- `Input`, `Label`
- Alert component for warnings

---

### 7. Settings
**Route:** `/dashboard/fornecedor/configuracoes`

**Features:**
Three tabs with different settings sections:

#### Profile Tab
- Company information form:
  - Company Name
  - CNPJ
  - Phone
  - Email
  - Address
  - City
  - State
  - ZIP Code
- Save button

#### Account Tab
- Email update
- Password change section:
  - Current Password
  - New Password
  - Confirm New Password
- Save button

#### Notifications Tab
- Toggle settings for:
  - New Orders notifications
  - Order Status Updates
  - Low Stock Alerts
  - Marketing Emails
- Save preferences button

**Components Used:**
- `DashboardLayout`
- `Card`, `Button`
- `Input`, `Label`
- Tab navigation

---

## API Routes

### Orders

#### GET `/api/fornecedor/pedidos`
Get all orders for the supplier.

**Query Parameters:**
- `status` (optional) - Filter by order status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "numero": "PED-2024-001",
      "cliente": "Empresa ABC",
      "data": "2024-01-15",
      "status": "pending",
      "total": 1250.00
    }
  ]
}
```

#### POST `/api/fornecedor/pedidos`
Create a new order (if applicable).

#### GET `/api/fornecedor/pedidos/[id]`
Get detailed information about a specific order.

#### PATCH `/api/fornecedor/pedidos/[id]`
Update order status or details.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

---

### Clients

#### GET `/api/fornecedor/clientes`
Get all clients for the supplier.

**Query Parameters:**
- `search` (optional) - Search by company, contact, or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nomeEmpresa": "Empresa ABC",
      "nomeContato": "João Silva",
      "email": "joao@empresa.com",
      "totalPedidos": 45,
      "totalGasto": 125000.00
    }
  ]
}
```

---

### Price Lists

#### GET `/api/fornecedor/precos`
Get all price lists.

#### POST `/api/fornecedor/precos`
Create a new price list.

**Request Body:**
```json
{
  "nome": "Desconto VIP",
  "tipo": "cliente",
  "alvo": "Empresa ABC",
  "descontoTipo": "percentual",
  "descontoValor": 15,
  "ativo": true
}
```

#### DELETE `/api/fornecedor/precos?id=[id]`
Delete a price list.

---

### Stock Control

#### GET `/api/fornecedor/estoque`
Get stock information for all products.

**Query Parameters:**
- `lowStockOnly` (optional) - Filter to show only low/out of stock items

#### PATCH `/api/fornecedor/estoque`
Update stock quantity for a product.

**Request Body:**
```json
{
  "id": "1",
  "estoqueAtual": 150
}
```

---

## Technology Stack

- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Components:** Custom UI components from `@/components/ui`

---

## Data Structure

### Order Status Types
```typescript
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
```

### Stock Status Types
```typescript
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
```

### Price List Types
```typescript
interface PriceList {
  id: string;
  nome: string;
  tipo: 'cliente' | 'categoria';
  alvo: string;
  descontoTipo: 'percentual' | 'fixo';
  descontoValor: number;
  ativo: boolean;
}
```

---

## Features

### Common Features Across All Pages
- ✅ Authentication required (redirects to login if not authenticated)
- ✅ User type validation (FORNECEDOR only)
- ✅ Loading states with spinners
- ✅ Empty states with helpful messages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional blue theme
- ✅ Consistent navigation via Sidebar
- ✅ Currency formatting (BRL)
- ✅ Date/time formatting (pt-BR locale)

### Interactive Features
- ✅ Real-time filtering and search
- ✅ Pagination for large data sets
- ✅ Modal dialogs for CRUD operations
- ✅ Status badges with color coding
- ✅ Trend indicators (up/down arrows)
- ✅ Quick actions for common tasks

---

## Mock Data

Currently, all pages use mock data for demonstration. To connect to real APIs:

1. Replace mock data in each page with actual API calls
2. Update API routes to use database queries (Prisma)
3. Add error handling and validation
4. Implement proper authentication checks

Example:
```typescript
// Replace this:
const mockOrders = [...];

// With this:
const response = await fetch('/api/fornecedor/pedidos');
const { data: orders } = await response.json();
```

---

## Navigation

The Fornecedor sidebar includes links to:
1. Dashboard Home
2. Pedidos (Orders)
3. Clientes (Clients)
4. Produtos (Products)
5. Categorias (Categories)
6. Estoque (Stock)
7. Listas de Preços (Price Lists)
8. Configurações (Settings)

---

## Next Steps

To complete the integration:

1. **Database Integration:**
   - Connect API routes to Prisma models
   - Implement proper data fetching
   - Add data validation

2. **Real-time Updates:**
   - Add WebSocket support for order notifications
   - Implement stock alert system
   - Add real-time dashboard updates

3. **Advanced Features:**
   - Export data to CSV/Excel
   - Print order invoices
   - Bulk operations (multi-select)
   - Advanced filtering and sorting
   - Analytics and charts

4. **Testing:**
   - Unit tests for components
   - Integration tests for API routes
   - E2E tests for user flows

5. **Documentation:**
   - API documentation (Swagger/OpenAPI)
   - User guides
   - Video tutorials

---

## Support

For questions or issues, please contact the development team or refer to the main project documentation.
