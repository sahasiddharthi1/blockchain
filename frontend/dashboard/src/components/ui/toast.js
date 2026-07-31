import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from "react";
const ToastContext = createContext({ toast: () => { } });
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const toast = useCallback((t) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...t, id }]);
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { toast }, children: [children, _jsx("div", { className: "fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2", children: toasts.map((t) => (_jsxs("div", { className: "rounded-xl border border-border bg-ink-card p-4", children: [_jsx("div", { className: "text-sm font-medium text-paper", children: t.title }), t.description && _jsx("div", { className: "mt-1 text-xs text-paper-muted", children: t.description })] }, t.id))) })] }));
}
export function useToast() {
    return useContext(ToastContext);
}
