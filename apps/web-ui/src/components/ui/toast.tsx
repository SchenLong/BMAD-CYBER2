/**
 * Toast Component
 * Simple notification system for role changes and other events
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: () => void;
}

const toastIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: Icons.CheckCircle,
  error: Icons.XCircle,
  warning: Icons.AlertTriangle,
  info: Icons.Info,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type];

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(onClose, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full fade-in duration-300',
        toastStyles[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <Icons.X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToasterProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

/**
 * Toast Store for managing notifications
 */
let toastId = 0;
const toastListeners = new Set<(toasts: Toast[]) => void>();
let activeToasts: Toast[] = [];

export function toast(props: Omit<Toast, 'id'>) {
  const id = String(toastId++);
  const newToast: Toast = { ...props, id };

  activeToasts = [...activeToasts, newToast];
  notifyListeners();

  return {
    dismiss: () => {
      activeToasts = activeToasts.filter((t) => t.id !== id);
      notifyListeners();
    },
  };
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...activeToasts]));
}

/**
 * Hook to use toasts in components
 */
export function useToasts() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    toastListeners.add(setToasts);
    setToasts([...activeToasts]);

    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);

  const remove = React.useCallback((id: string) => {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return { toasts, remove };
}
