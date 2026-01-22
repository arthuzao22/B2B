'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export interface ToastProviderProps {
  children: React.ReactNode;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children,
  swipeDirection = 'right'
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection={swipeDirection}>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          />
        ))}
        <ToastPrimitive.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-full max-w-md z-[100] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

interface ToastProps extends ToastItem {
  onOpenChange: (open: boolean) => void;
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'info',
  duration = 5000,
  onOpenChange,
}) => {
  const variantStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const config = variantStyles[variant];
  const Icon = config.icon;

  return (
    <ToastPrimitive.Root
      duration={duration}
      onOpenChange={onOpenChange}
      className={`
        ${config.bg}
        border rounded-lg shadow-lg p-4
        data-[state=open]:animate-[slideInRight_0.15s_ease-out]
        data-[state=closed]:animate-[slideOutRight_0.15s_ease-in]
        data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
        data-[swipe=cancel]:translate-x-0
        data-[swipe=cancel]:transition-[transform_200ms_ease-out]
        data-[swipe=end]:animate-[slideOutRight_0.15s_ease-in]
      `}
    >
      <div className="flex gap-3">
        <Icon className={`${config.iconColor} flex-shrink-0 w-5 h-5 mt-0.5`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <ToastPrimitive.Title className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close
          aria-label="Close notification"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  );
};

// Keyframes for animations
const styles = `
  @keyframes slideInRight {
    from {
      transform: translateX(calc(100% + 1.5rem));
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(100% + 1.5rem));
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
