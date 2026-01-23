# UI Components - B2B Marketplace

This directory contains reusable UI components for the B2B Marketplace application.

## Components

### 1. Button
A flexible button component with multiple variants and states.

**Usage:**
```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="default">Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>

// As child (composition)
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

### 2. Input
Input field component with label and error support.

**Usage:**
```tsx
import { Input } from '@/components/ui';

// Basic
<Input placeholder="Enter text..." />

// With label
<Input label="Email" type="email" required />

// With error
<Input 
  label="Password"
  type="password"
  error
  errorMessage="Password must be at least 8 characters"
/>

// Different types
<Input type="number" label="Age" />
<Input type="date" label="Birth Date" />
<Input type="email" label="Email" />
```

### 3. Label
Accessible label component using Radix UI.

**Usage:**
```tsx
import { Label } from '@/components/ui';

<Label htmlFor="email">Email</Label>
<Label htmlFor="password" required>Password</Label>
<Label variant="error">Error Label</Label>
```

### 4. Select
Dropdown select component with search support using Radix UI.

**Usage:**
```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

<Select
  options={options}
  value={value}
  onValueChange={setValue}
  placeholder="Select an option..."
  label="Choose"
  required
/>

// With error
<Select
  options={options}
  error
  errorMessage="This field is required"
/>
```

### 5. Dialog
Modal/Dialog component using Radix UI.

**Usage:**
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 6. Card
Card container component with sections.

**Usage:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants: 'default', 'elevated', 'outline'
```

### 7. Badge
Badge/Tag component for status indicators.

**Usage:**
```tsx
import { Badge } from '@/components/ui';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### 8. Table
Comprehensive table component with sorting, pagination, and selection.

**Usage:**
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableTableHead,
  TablePagination,
  DataTable,
  TableCheckbox,
} from '@/components/ui';

// Basic table
<DataTable loading={loading} empty={isEmpty}>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>
          <TableCheckbox />
        </TableHead>
        <SortableTableHead
          sortable
          sortDirection={sortDirection}
          onSort={handleSort}
        >
          Name
        </SortableTableHead>
        <TableHead>Email</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id} selected={selected.has(row.id)}>
          <TableCell>
            <TableCheckbox checked={selected.has(row.id)} />
          </TableCell>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.email}</TableCell>
          <TableCell>
            <Badge variant="success">{row.status}</Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</DataTable>

// Pagination
<TablePagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### 9. Skeleton
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

### 10. Toast
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

### 11. Spinner
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

### 12. EmptyState
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

### 13. ProgressBar
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

## Design Guidelines

### Colors
- **Primary**: Blue (#2563EB) - Main actions, links, focus states
- **Success**: Green - Success messages, positive actions
- **Warning**: Yellow - Warnings, cautions
- **Error**: Red - Errors, destructive actions
- **Info**: Blue (lighter) - Informational messages

### Typography
- Use semantic HTML elements (h1-h6, p, etc.)
- Font sizes follow Tailwind scale (text-sm, text-base, text-lg, etc.)
- Font weights: regular (400), medium (500), semibold (600), bold (700)

### Spacing
- Use Tailwind spacing scale (p-4, m-2, gap-3, etc.)
- Consistent padding: Components use p-4 or p-6 typically
- Gap between elements: gap-2 (8px) or gap-4 (16px)

### Accessibility
- All interactive elements have focus states
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Color contrast meets WCAG AA standards

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Tables scroll horizontally on mobile
- Dialogs are full-width on small screens

## Complete Examples

See `component-examples.tsx` for comprehensive usage examples of all components.

## Features

All components include:
- ✅ TypeScript with proper types
- ✅ Accessible (ARIA labels, semantic HTML)
- ✅ Smooth animations
- ✅ Tailwind CSS v4 styling
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Radix UI primitives where appropriate
- ✅ Focus states and keyboard navigation
- ✅ Loading and error states
- ✅ Class name merging with `cn()` utility
