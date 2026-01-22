import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'primary' | 'white' | 'gray' | 'success' | 'error';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', label = 'Loading...', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-2',
      lg: 'w-12 h-12 border-3',
    };

    const colorClasses = {
      primary: 'border-blue-600 border-t-transparent dark:border-blue-400',
      white: 'border-white border-t-transparent',
      gray: 'border-gray-600 border-t-transparent dark:border-gray-400',
      success: 'border-green-600 border-t-transparent dark:border-green-400',
      error: 'border-red-600 border-t-transparent dark:border-red-400',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        aria-live="polite"
        className={`inline-block ${className}`}
        {...props}
      >
        <div
          className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            rounded-full
            animate-spin
          `}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export interface SpinnerOverlayProps {
  show: boolean;
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  backdrop?: boolean;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  show,
  size = 'lg',
  color = 'primary',
  label = 'Loading...',
  backdrop = true,
}) => {
  if (!show) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${backdrop ? 'bg-black/50 dark:bg-black/70' : ''}
      `}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size={size} color={color} label={label} />
        {label && (
          <p className="text-sm font-medium text-white">{label}</p>
        )}
      </div>
    </div>
  );
};
