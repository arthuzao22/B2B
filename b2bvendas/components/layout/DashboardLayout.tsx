'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'admin' | 'fornecedor' | 'cliente';
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  userType,
  userName,
  userEmail,
  userAvatar,
  notificationCount,
  onLogout,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar userType={userType} />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar userType={userType} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300',
          'lg:ml-64' // Always account for sidebar on desktop
        )}
      >
        {/* Header */}
        <Header
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          notificationCount={notificationCount}
          onMenuClick={handleMobileMenuToggle}
          onLogout={onLogout}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6 xl:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
