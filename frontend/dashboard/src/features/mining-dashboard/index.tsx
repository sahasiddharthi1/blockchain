import { useEffect, useState } from "react";
import { api, Block } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";

// Mining Dashboard: a "Mine Block" button that calls the synchronous
// POST /mining/mine endpoint, plus a live feed of blocks as the hub
// broadcasts them — useful when auto-mining is enabled server-side, so
// this page reflects mining happening even without the button being
// clicked from this particular browser tab.
export default function MiningDashboard() {
  const [mining, setMining] = useState(false);
  const [lastMined, setLastMined] = useState<Block | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { lastEvent, connected } = useWebSocket();

  useEffect(() => {
    if (lastEvent?.topic === "block:new") {
      setLastMined(lastEvent.payload as Block);
    }
  }, [lastEvent]);

  async function handleMine() {
    setMining(true);
    setError(null);
    try {
      const block = await api.mineNow();
      setLastMined(block);
    } catch (e) {
      // A 401 here means no operator is logged in — mining is an
      // auth-gated route (see backend/internal/api/router.go). Surface
      // that plainly rather than a generic failure message.
      setError(
        e instanceof Error && e.message.includes("token")
          ? "Log in as an operator to mine a block."
          : e instanceof Error
          ? e.message
          : "Mining failed"
      );
    } finally {
      setMining(false);
    }
  }

  return (
    <section>
      <h1>Mining Dashboard</h1>
      <p>Live feed: {connected ? "connected" : "reconnecting…"}</p>

      <button onClick={handleMine} disabled={mining}>
        {mining ? "Mining…" : "Mine Block"}
      </button>

      {error && <p role="alert">{error}</p>}

      {lastMined && (
        <div style={{ marginTop: 16 }}>
          <h2>Latest block</h2>
          <p>
            Index: {lastMined.index} · Nonce: {lastMined.nonce} · Difficulty: {lastMined.difficulty}
          </p>
          <p style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{lastMined.hash}</p>
        </div>
      )}
    </section>
  );
}
