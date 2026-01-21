/**
 * UI Components Example Usage
 * This file demonstrates how to use all UI components
 */

import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  ToastProvider,
  useToast,
  Spinner,
  SpinnerOverlay,
  EmptyState,
  EmptyStateCard,
  ProgressBar,
  progressBar,
  useProgressBar,
} from './index';

import { Package } from 'lucide-react';

// Example 1: Skeleton Loading States
export function SkeletonExample() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-8" />
      <Skeleton variant="circular" width={48} height={48} />
      <SkeletonCard showImage />
      <SkeletonTable rows={3} columns={4} />
      <SkeletonList items={3} showAvatar />
    </div>
  );
}

// Example 2: Toast Notifications
export function ToastExample() {
  const { addToast } = useToast();

  const showSuccessToast = () => {
    addToast({
      title: 'Success!',
      description: 'Your operation completed successfully.',
      variant: 'success',
    });
  };

  const showErrorToast = () => {
    addToast({
      title: 'Error',
      description: 'Something went wrong. Please try again.',
      variant: 'error',
    });
  };

  return (
    <div className="space-x-2">
      <button onClick={showSuccessToast}>Show Success</button>
      <button onClick={showErrorToast}>Show Error</button>
    </div>
  );
}

// Example 3: Spinners
export function SpinnerExample() {
  return (
    <div className="space-y-4">
      <Spinner size="sm" color="primary" />
      <Spinner size="md" color="success" />
      <Spinner size="lg" color="error" />
      <SpinnerOverlay show={true} size="lg" label="Loading..." />
    </div>
  );
}

// Example 4: Empty States
export function EmptyStateExample() {
  return (
    <div className="space-y-8">
      <EmptyState
        icon={Package}
        title="No products found"
        description="Start by adding your first product."
        variant="noData"
        action={{
          label: 'Add Product',
          onClick: () => console.log('Add product'),
        }}
      />
      
      <EmptyStateCard
        bordered
        icon={Package}
        title="Empty Cart"
        description="Your cart is empty."
      />
    </div>
  );
}

// Example 5: Progress Bar
export function ProgressBarExample() {
  return (
    <div className="space-y-4">
      <ProgressBar color="bg-blue-600" height={2} showSpinner />
      <button onClick={() => progressBar.start()}>Start</button>
      <button onClick={() => progressBar.set(50)}>Set 50%</button>
      <button onClick={() => progressBar.done()}>Done</button>
    </div>
  );
}

// Root App Example with ToastProvider
export function AppExample() {
  useProgressBar();

  return (
    <ToastProvider>
      <ProgressBar />
      <div className="p-8 space-y-8">
        <h1>UI Components Demo</h1>
        <SkeletonExample />
        <ToastExample />
        <SpinnerExample />
        <EmptyStateExample />
        <ProgressBarExample />
      </div>
    </ToastProvider>
  );
}
