import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
// Mining Dashboard: a "Mine Block" button that calls the synchronous
// POST /mining/mine endpoint, plus a live feed of blocks as the hub
// broadcasts them — useful when auto-mining is enabled server-side, so
// this page reflects mining happening even without the button being
// clicked from this particular browser tab.
export default function MiningDashboard() {
    const [mining, setMining] = useState(false);
    const [lastMined, setLastMined] = useState(null);
    const [error, setError] = useState(null);
    const { lastEvent, connected } = useWebSocket();
    useEffect(() => {
        if (lastEvent?.topic === "block:new") {
            setLastMined(lastEvent.payload);
        }
    }, [lastEvent]);
    async function handleMine() {
        setMining(true);
        setError(null);
        try {
            const block = await api.mineNow();
            setLastMined(block);
        }
        catch (e) {
            // A 401 here means no operator is logged in — mining is an
            // auth-gated route (see backend/internal/api/router.go). Surface
            // that plainly rather than a generic failure message.
            setError(e instanceof Error && e.message.includes("token")
                ? "Log in as an operator to mine a block."
                : e instanceof Error
                    ? e.message
                    : "Mining failed");
        }
        finally {
            setMining(false);
        }
    }
    return (_jsxs("section", { children: [_jsx("h1", { children: "Mining Dashboard" }), _jsxs("p", { children: ["Live feed: ", connected ? "connected" : "reconnecting…"] }), _jsx("button", { onClick: handleMine, disabled: mining, children: mining ? "Mining…" : "Mine Block" }), error && _jsx("p", { role: "alert", children: error }), lastMined && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx("h2", { children: "Latest block" }), _jsxs("p", { children: ["Index: ", lastMined.index, " \u00B7 Nonce: ", lastMined.nonce, " \u00B7 Difficulty: ", lastMined.difficulty] }), _jsx("p", { style: { fontFamily: "monospace", wordBreak: "break-all" }, children: lastMined.hash })] }))] }));
}
