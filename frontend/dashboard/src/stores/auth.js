import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAuthStore = create()(persist((set) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: true }),
    setTokens: (token, refreshToken) => set({ token, refreshToken }),
    logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
}), {
    name: "ledgerforge-auth",
}));
