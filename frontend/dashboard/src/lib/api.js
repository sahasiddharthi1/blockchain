// lib/api.ts is the single place that knows the API's base URL and how to
// talk to it. Every feature imports from here rather than calling fetch()
// directly — that's what makes it possible to add auth headers, error
// handling, or a request timeout in one place instead of N call sites.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
async function request(path, init) {
    const token = localStorage.getItem("lf_access_token");
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers ?? {}),
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new ApiError(res.status, body.error ?? "Request failed");
    }
    return res.json();
}
export const api = {
    listBlocks: (offset = 0, limit = 50) => request(`/api/v1/blocks?offset=${offset}&limit=${limit}`),
    getBlock: (index) => request(`/api/v1/blocks/${index}`),
    validateChain: () => request("/api/v1/chain/validate"),
    analyticsSummary: () => request("/api/v1/analytics/summary"),
    createWallet: () => request("/api/v1/wallets", { method: "POST" }),
    getBalance: (address) => request(`/api/v1/wallets/${address}/balance`),
    login: (email, password) => request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),
    register: (email, password) => request("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),
    forgotPassword: (email) => request("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    }),
    resetPassword: (token, newPassword) => request("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
    }),
    mineNow: () => request("/api/v1/mining/mine", { method: "POST" }),
};
