/**
 * Toast Provider - Client component wrapper for Toaster
 */

'use client';

import { Toaster, useToasts } from '@/components/ui/toast';

export function ToastProvider() {
  const { toasts, remove } = useToasts();
  return <Toaster toasts={toasts} onRemove={remove} />;
}
