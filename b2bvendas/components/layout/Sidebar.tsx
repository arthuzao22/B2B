'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Store,
  UserCog,
  Inbox,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuConfig {
  admin: MenuItem[];
  fornecedor: MenuItem[];
  cliente: MenuItem[];
}

const menuItems: MenuConfig = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pedidos', href: '/dashboard/pedidos', icon: ShoppingCart },
    { label: 'Produtos', href: '/dashboard/produtos', icon: Package },
    { label: 'Fornecedores', href: '/dashboard/fornecedores', icon: Building2 },
    { label: 'Clientes', href: '/dashboard/clientes', icon: Users },
    { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  ],
  fornecedor: [
    { label: 'Dashboard', href: '/dashboard/fornecedor', icon: LayoutDashboard },
    { label: 'Pedidos', href: '/dashboard/fornecedor/pedidos', icon: ShoppingCart },
    { label: 'Clientes', href: '/dashboard/fornecedor/clientes', icon: Users },
    { label: 'Produtos', href: '/dashboard/fornecedor/produtos', icon: Package },
    { label: 'Categorias', href: '/dashboard/fornecedor/categorias', icon: Store },
    { label: 'Estoque', href: '/dashboard/fornecedor/estoque', icon: FileText },
    { label: 'Listas de Preços', href: '/dashboard/fornecedor/precos', icon: DollarSign },
    { label: 'Configurações', href: '/dashboard/fornecedor/configuracoes', icon: Settings },
  ],
  cliente: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Catálogo', href: '/dashboard/catalogo', icon: Store },
    { label: 'Meus Pedidos', href: '/dashboard/pedidos', icon: ShoppingCart },
    { label: 'Carrinho', href: '/dashboard/carrinho', icon: Inbox },
    { label: 'Favoritos', href: '/dashboard/favoritos', icon: Package },
    { label: 'Histórico', href: '/dashboard/historico', icon: FileText },
    { label: 'Minha Conta', href: '/dashboard/conta', icon: UserCog },
  ],
};

interface SidebarProps {
  userType: 'admin' | 'fornecedor' | 'cliente';
}

export function Sidebar({ userType }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const items = menuItems[userType];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">B2B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Vendas</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900',
            isCollapsed && 'mx-auto'
          )}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-600')} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Type Badge */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs font-medium text-gray-500">Tipo de Conta</p>
            <p className="text-sm font-semibold capitalize text-gray-900">{userType}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
