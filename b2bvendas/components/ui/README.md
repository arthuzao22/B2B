# UI Components - B2B Marketplace

This directory contains reusable UI components for the B2B Marketplace application.

## Components

### 1. Skeleton
Loading skeleton components with shimmer effect.

**Usage:**
```tsx
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList } from '@/components/ui';

// Basic skeleton
<Skeleton className="w-full h-4" />

// Variants
<Skeleton variant="text" width="200px" height="20px" />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" className="w-full h-32" />

// Presets
<SkeletonCard showImage />
<SkeletonTable rows={5} columns={4} />
<SkeletonList items={5} showAvatar />
```

### 2. Toast
Toast notification system using Radix UI.

**Usage:**
```tsx
import { ToastProvider, useToast } from '@/components/ui';

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// In your component
const { addToast } = useToast();

addToast({
  title: 'Success!',
  description: 'Your changes have been saved.',
  variant: 'success',
  duration: 3000,
});

// Variants: 'success', 'error', 'warning', 'info'
```

### 3. Spinner
Loading spinner component.

**Usage:**
```tsx
import { Spinner, SpinnerOverlay } from '@/components/ui';

// Basic spinner
<Spinner size="md" color="primary" />

// Sizes: 'sm', 'md', 'lg'
// Colors: 'primary', 'white', 'gray', 'success', 'error'

// Overlay
<SpinnerOverlay 
  show={isLoading} 
  size="lg" 
  label="Loading..." 
  backdrop 
/>
```

### 4. EmptyState
Empty state component for various scenarios.

**Usage:**
```tsx
import { EmptyState, EmptyStateCard } from '@/components/ui';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No products found"
  description="Start by adding your first product to the catalog."
  variant="noData"
  action={{
    label: 'Add Product',
    onClick: () => {},
    variant: 'primary',
  }}
/>

// Variants: 'default', 'search', 'error', 'noData'

// With card wrapper
<EmptyStateCard bordered icon={Package} title="Empty" />
```

### 5. ProgressBar
Top progress bar for navigation (NProgress-like).

**Usage:**
```tsx
import { ProgressBar, progressBar, useProgressBar } from '@/components/ui';

// Add to your layout
<ProgressBar color="bg-blue-600" height={2} showSpinner />

// Programmatic control
progressBar.start();
progressBar.set(50);
progressBar.done();

// Auto-track navigation (use in layout)
useProgressBar();
```

## Features

All components include:
- ✅ TypeScript with proper types
- ✅ Accessible (ARIA labels, semantic HTML)
- ✅ Smooth animations
- ✅ Tailwind CSS styling
- ✅ Dark mode support
- ✅ Responsive design

## Animations

Components use animations defined in `tokens.css`:
- `shimmer` - For skeleton loading effect
- `fadeIn` - Fade in animation
- `slideInUp` - Slide up animation
- `spin` - Rotation animation
