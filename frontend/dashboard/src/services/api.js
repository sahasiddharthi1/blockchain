import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
export const api = axios.create({ baseURL });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("ledgerforge-auth");
    if (token) {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
            config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
    }
    return config;
});
export const apiClient = {
    async login(email, password) {
        const res = await axios.post(`${baseURL}/auth/login`, { email, password });
        return res.data;
    },
    async register(email, password) {
        const res = await axios.post(`${baseURL}/auth/register`, { email, password });
        return res.data;
    },
    async analyticsSummary() {
        const res = await axios.get(`${baseURL}/analytics/summary`);
        return res.data;
    },
};
export async function refreshAccessToken() {
    const stored = localStorage.getItem("ledgerforge-auth");
    if (!stored)
        throw new Error("No stored auth");
    const parsed = JSON.parse(stored);
    const refreshToken = parsed.state?.refreshToken;
    if (!refreshToken)
        throw new Error("No refresh token");
    const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}/auth/refresh`, {
        refreshToken,
    });
    return response.data;
}
