"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the performance dashboard only in development
const PerformanceDashboard = dynamic(
  () => import('./PerformanceDashboard'),
  {
    ssr: false, // Only render on client side
    loading: () => null // No loading state needed
  }
);

export default function DynamicPerformanceDashboard() {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <PerformanceDashboard />
    </Suspense>
  );
}