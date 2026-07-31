import { useState } from "react";
import { api } from "../../lib/api";
import { Wallet, Copy, Check, Search } from "lucide-react";

export default function WalletPage() {
  const [created, setCreated] = useState<{ address: string; public_key: string; private_key: string } | null>(null);
  const [lookupAddress, setLookupAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setError(null);
    try {
      const wallet = await api.createWallet();
      setCreated(wallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create wallet");
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.getBalance(lookupAddress.trim());
      setBalance(res.balance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch balance");
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="mt-1 text-sm text-paper-muted">Generate wallets and check balances on the Ledgerforge chain.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-ink-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-soft text-signal">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Generate Wallet</h2>
              <p className="text-xs text-paper-muted">Create a new ECDSA key pair</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90"
          >
            Generate new wallet
          </button>
          {created && (
            <div className="mt-4 rounded-xl border border-border bg-ink-overlay p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-paper-muted">Address</span>
                  <button onClick={() => copyToClipboard(created.address)} className="text-paper-weak hover:text-paper transition-colors">
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <code className="block text-xs font-mono text-paper break-all bg-ink px-2 py-1 rounded">{created.address}</code>
              </div>
              <div>
                <span className="text-xs font-medium text-paper-muted">Private key (shown once — save it now)</span>
                <code className="block mt-1 text-xs font-mono text-warning break-all bg-ink px-2 py-1 rounded">{created.private_key}</code>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-ink-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Check Balance</h2>
              <p className="text-xs text-paper-muted">Look up any address balance</p>
            </div>
          </div>
          <form onSubmit={handleLookup} className="space-y-3">
            <input
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
              placeholder="Enter address (LF...)"
              className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink-overlay hover:border-border-light"
            >
              Check
            </button>
          </form>
          {balance !== null && (
            <div className="mt-4 rounded-xl border border-border bg-ink-overlay p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-paper-muted">Balance</span>
                <span className="text-lg font-bold text-signal">{balance} LGF</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
