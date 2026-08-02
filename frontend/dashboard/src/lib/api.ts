// lib/api.ts is the single place that knows the API's base URL and how to
// talk to it. Every feature imports from here rather than calling fetch()
// directly — that's what makes it possible to add auth headers, error
// handling, or a request timeout in one place instead of N call sites.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

  return res.json() as Promise<T>;
}

export interface Block {
  index: number;
  timestamp: number;
  prev_hash: string;
  merkle_root: string;
  transactions: string[]; // base64-encoded opaque payloads, as JSON round-trips []byte
  nonce: number;
  difficulty: number;
  hash: string;
}

export const api = {
  listBlocks: (offset = 0, limit = 50) =>
    request<{ height: number; total: number; blocks: Block[] }>(
      `/api/v1/blocks?offset=${offset}&limit=${limit}`
    ),

  getBlock: (index: number) => request<Block>(`/api/v1/blocks/${index}`),

  validateChain: () => request<{ valid: boolean; error?: string }>("/api/v1/chain/validate"),

  analyticsSummary: () =>
    request<{ chain_height: number; difficulty: number; mempool_size: number; chain_valid: boolean }>(
      "/api/v1/analytics/summary"
    ),

  createWallet: () =>
    request<{ address: string; public_key: string; private_key: string; warning: string }>(
      "/api/v1/wallets",
      { method: "POST" }
    ),

  getBalance: (address: string) =>
    request<{ address: string; balance: number }>(`/api/v1/wallets/${address}/balance`),

  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),

  mineNow: () => request<Block>("/api/v1/mining/mine", { method: "POST" }),
};
