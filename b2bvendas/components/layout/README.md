# Layout Components

Base layout components for the B2B sales dashboard.

## Components

### DashboardLayout
Main layout wrapper that combines Sidebar and Header components.

```tsx
import { DashboardLayout } from '@/components/layout';

export default function Page() {
  return (
    <DashboardLayout
      userType="admin"
      userName="João Silva"
      userEmail="joao@exemplo.com"
      notificationCount={5}
      onLogout={() => console.log('Logout')}
    >
      <h1>Dashboard Content</h1>
    </DashboardLayout>
  );
}
```

**Props:**
- `children`: React.ReactNode - Page content
- `userType`: 'admin' | 'fornecedor' | 'cliente' - User role
- `userName?`: string - User's display name
- `userEmail?`: string - User's email
- `userAvatar?`: string - URL to user's avatar
- `notificationCount?`: number - Number of unread notifications
- `onLogout?`: () => void - Logout callback

### Sidebar
Collapsible sidebar navigation with role-based menu items.

```tsx
import { Sidebar } from '@/components/layout';

<Sidebar userType="admin" />
```

**Props:**
- `userType`: 'admin' | 'fornecedor' | 'cliente' - Determines visible menu items

**Menu Items by Role:**

**Admin:**
- Dashboard
- Pedidos
- Produtos
- Fornecedores
- Clientes
- Relatórios
- Configurações

**Fornecedor:**
- Dashboard
- Meus Produtos
- Pedidos
- Catálogo
- Relatórios
- Minha Empresa
- Configurações

**Cliente:**
- Dashboard
- Catálogo
- Meus Pedidos
- Carrinho
- Favoritos
- Histórico
- Minha Conta

### Header
Header component with search, notifications, and user menu.

```tsx
import { Header } from '@/components/layout';

<Header
  userName="João Silva"
  userEmail="joao@exemplo.com"
  notificationCount={3}
  onLogout={() => signOut()}
/>
```

**Props:**
- `userName?`: string - User's display name
- `userEmail?`: string - User's email
- `userAvatar?`: string - URL to user's avatar
- `notificationCount?`: number - Number of unread notifications
- `onMenuClick?`: () => void - Mobile menu toggle callback
- `onLogout?`: () => void - Logout callback

### StatsCard
Card component for displaying metrics and statistics.

```tsx
import { StatsCard } from '@/components/layout';
import { DollarSign } from 'lucide-react';

<StatsCard
  title="Receita Total"
  value="R$ 125.430,00"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
  variant="blue"
/>
```

**Props:**
- `title`: string - Card title
- `value`: string | number - Main value to display
- `icon`: LucideIcon - Icon component from lucide-react
- `trend?`: { value: number; isPositive: boolean } - Trend indicator
- `variant?`: 'default' | 'blue' | 'green' | 'orange' | 'red' | 'purple' - Color variant
- `className?`: string - Additional CSS classes

## Usage Example

Complete dashboard page example:

```tsx
import { DashboardLayout, StatsCard } from '@/components/layout';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <DashboardLayout
      userType="admin"
      userName="João Silva"
      userEmail="joao@exemplo.com"
      notificationCount={5}
      onLogout={() => console.log('Logout')}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Receita Total"
            value="R$ 125.430,00"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            variant="blue"
          />
          <StatsCard
            title="Pedidos"
            value={238}
            icon={ShoppingCart}
            trend={{ value: 8.2, isPositive: true }}
            variant="green"
          />
          <StatsCard
            title="Produtos"
            value={1245}
            icon={Package}
            trend={{ value: -2.4, isPositive: false }}
            variant="orange"
          />
          <StatsCard
            title="Clientes"
            value={89}
            icon={Users}
            trend={{ value: 5.7, isPositive: true }}
            variant="purple"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## Design System

**Colors:**
- Primary: Blue (#2563EB)
- Success: Green
- Warning: Orange
- Danger: Red
- Info: Purple

**Responsive Breakpoints:**
- Mobile: < 768px (sidebar hidden, mobile menu)
- Tablet: 768px - 1024px
- Desktop: > 1024px (sidebar always visible)

## Features

- ✅ Fully responsive design
- ✅ Role-based navigation
- ✅ Collapsible sidebar
- ✅ Mobile menu overlay
- ✅ User profile dropdown
- ✅ Notification badge
- ✅ Search functionality
- ✅ Active route indication
- ✅ TypeScript support
- ✅ Accessible (ARIA labels)
