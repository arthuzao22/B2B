import React from 'react';
import { LucideIcon } from 'lucide-react';

export type EmptyStateVariant = 'default' | 'search' | 'error' | 'noData';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  variant?: EmptyStateVariant;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  children,
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-400 dark:text-gray-500',
    },
    search: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    error: {
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    noData: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
  };

  const config = variantStyles[variant];

  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div 
          className={`
            ${config.iconBg}
            rounded-full p-3 mb-4
            transition-colors duration-200
          `}
          aria-hidden="true"
        >
          <Icon className={`${config.iconColor} w-8 h-8`} />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={`
            inline-flex items-center justify-center
            px-4 py-2 rounded-md
            text-sm font-medium
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              action.variant === 'secondary'
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
            }
          `}
        >
          {action.label}
        </button>
      )}
      
      {children}
    </div>
  );
};

export interface EmptyStateCardProps extends EmptyStateProps {
  bordered?: boolean;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={`
        rounded-lg bg-white dark:bg-gray-900
        ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}
        p-8
      `}
    >
      <EmptyState {...props} />
    </div>
  );
};
