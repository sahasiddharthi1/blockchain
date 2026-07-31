import { format } from "date-fns";
export function formatDate(date) {
    return format(new Date(date), "MMM dd, yyyy");
}
export function formatDateTime(date) {
    return format(new Date(date), "MMM dd, yyyy HH:mm");
}
export function formatCompactHash(hash) {
    if (!hash)
        return "";
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}
export function formatHashRate(hps) {
    if (hps >= 1_000_000_000)
        return `${(hps / 1_000_000_000).toFixed(2)} GH/s`;
    if (hps >= 1_000_000)
        return `${(hps / 1_000_000).toFixed(2)} MH/s`;
    if (hps >= 1_000)
        return `${(hps / 1_000).toFixed(2)} KH/s`;
    return `${hps.toFixed(0)} H/s`;
}
export function formatNumber(n) {
    return new Intl.NumberFormat("en-US").format(n);
}
export function formatCurrency(n, symbol = "LGF") {
    return `${symbol} ${n.toFixed(4)}`;
}
