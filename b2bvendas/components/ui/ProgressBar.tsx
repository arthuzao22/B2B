'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface ProgressBarProps {
  color?: string;
  height?: number;
  showSpinner?: boolean;
}

let progressBarInstance: {
  start: () => void;
  done: () => void;
  set: (progress: number) => void;
} | null = null;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  color = 'bg-blue-600',
  height = 2,
  showSpinner = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const start = useCallback(() => {
    setVisible(true);
    setProgress(0);
    setTransitioning(true);
    
    // Increment progress gradually
    const increment = () => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const diff = 90 - prev;
        return prev + Math.random() * diff * 0.1;
      });
    };

    const interval = setInterval(increment, 300);
    
    return () => clearInterval(interval);
  }, []);

  const done = useCallback(() => {
    setProgress(100);
    setTransitioning(true);
    
    setTimeout(() => {
      setVisible(false);
      setTransitioning(false);
      setProgress(0);
    }, 300);
  }, []);

  const set = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
    setTransitioning(true);
  }, []);

  useEffect(() => {
    progressBarInstance = { start, done, set };
    
    return () => {
      progressBarInstance = null;
    };
  }, [start, done, set]);

  if (!visible) return null;

  return (
    <>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Page loading progress"
        className={`
          fixed top-0 left-0 right-0 z-[99999]
          ${color}
          ${transitioning ? 'transition-all duration-300 ease-out' : ''}
        `}
        style={{
          height: `${height}px`,
          width: `${progress}%`,
          boxShadow: progress < 100 ? `0 0 10px ${color.replace('bg-', '')}` : 'none',
        }}
      />
      
      {showSpinner && progress < 100 && (
        <div
          className={`
            fixed top-2 right-2 z-[99999]
            w-6 h-6 border-2 ${color.replace('bg-', 'border-')}
            border-t-transparent rounded-full
            animate-spin
          `}
          aria-hidden="true"
        />
      )}
    </>
  );
};

// Singleton helper functions
export const progressBar = {
  start: () => {
    if (progressBarInstance) {
      progressBarInstance.start();
    }
  },
  done: () => {
    if (progressBarInstance) {
      progressBarInstance.done();
    }
  },
  set: (progress: number) => {
    if (progressBarInstance) {
      progressBarInstance.set(progress);
    }
  },
};

// Hook for router integration
export const useProgressBar = () => {
  useEffect(() => {
    const handleStart = () => progressBar.start();
    const handleComplete = () => progressBar.done();

    // For Next.js App Router
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleStart);
      window.addEventListener('load', handleComplete);
      
      // Handle client-side navigation
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function(...args) {
        handleStart();
        const result = originalPushState.apply(this, args);
        setTimeout(handleComplete, 300);
        return result;
      };

      window.history.replaceState = function(...args) {
        handleStart();
        const result = originalReplaceState.apply(this, args);
        setTimeout(handleComplete, 300);
        return result;
      };

      return () => {
        window.removeEventListener('beforeunload', handleStart);
        window.removeEventListener('load', handleComplete);
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }
  }, []);
};
