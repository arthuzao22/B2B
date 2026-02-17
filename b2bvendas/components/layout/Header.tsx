'use client';

import { useState } from 'react';
import { Search, Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function Header({
  userName = 'Usuário',
  userEmail = 'usuario@exemplo.com',
  userAvatar,
  notificationCount = 0,
  onMenuClick,
  onLogout,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden flex-1 md:block md:max-w-md lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar produtos, pedidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Menu Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                aria-label="Menu do usuário"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-gray-500 md:block" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[220px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
                align="end"
                sideOffset={5}
              >
                {/* User Info in dropdown (mobile) */}
                <div className="border-b border-gray-100 px-3 py-2 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>

                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100"
                  onSelect={() => (window.location.href = '/dashboard/perfil')}
                >
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100"
                  onSelect={() => (window.location.href = '/dashboard/configuracoes')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                  onSelect={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="border-t border-gray-200 px-4 py-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
