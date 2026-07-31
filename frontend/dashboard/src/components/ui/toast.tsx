import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Toast = { id: string; title: string; description?: string; variant?: "default" | "success" | "warn" | "danger" };
type ToastContextValue = { toast: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev: Toast[]) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev: Toast[]) => prev.filter((x: Toast) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t: Toast) => (
          <div key={t.id} className="rounded-xl border border-border bg-ink-card p-4">
            <div className="text-sm font-medium text-paper">{t.title}</div>
            {t.description && <div className="mt-1 text-xs text-paper-muted">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
