import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/theme";
import Router from "@/routes";
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1_000, retry: 1 } } });
export default function App() {
    return (_jsx(ThemeProvider, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsx(Router, {}) }) }) }));
}
