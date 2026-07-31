import { useState } from "react";
import { Wallet, Key, Download, Upload, Copy, ArrowRightLeft, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCompactHash, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const WALLETS = [
  { id: "w_1", name: "Primary", balance: 2450.5, address: "0x71C7656EC7ab88b098defB751B7401B5f6d8996F", createdAt: "2025-01-12" },
  { id: "w_2", name: "Mining", balance: 892.3, address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE", createdAt: "2025-02-04" },
];

const TRANSACTIONS = [
  { id: "tx_1", type: "receive", amount: 50, from: "0xabc...123", to: "0x71C7...96F", time: "2 min ago" },
  { id: "tx_2", type: "send", amount: 12.5, from: "0x71C7...96F", to: "0xdef...456", time: "1 hour ago" },
  { id: "tx_3", type: "receive", amount: 200, from: "0xghi...789", to: "0x71C7...96F", time: "3 hours ago" },
  { id: "tx_4", type: "mining", amount: 50, from: "Coinbase", to: "0x3f5C...0bE", time: "5 hours ago" },
];

export default function WalletsPage() {
  const [selectedWallet, setSelectedWallet] = useState<string>(WALLETS[0].id);
  const wallet = WALLETS.find((w) => w.id === selectedWallet) || WALLETS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Wallets</h1>
          <p className="text-sm text-[var(--text-weak)]">Manage your wallets and transaction history.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" variant="secondary">
            <Wallet size={16} /> Create Wallet
          </Button>
          <Button className="gap-2" variant="secondary">
            <Upload size={16} /> Import
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WALLETS.map((w) => (
          <button
            key={w.id}
            onClick={() => setSelectedWallet(w.id)}
            className={cn(
              "card p-5 text-left transition-colors",
              selectedWallet === w.id && "border-[var(--accent)] ring-1 ring-[var(--accent)]"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-weak)] text-[var(--accent)]">
                  <Wallet size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text-strong)]">{w.name}</div>
                  <div className="text-xs text-[var(--text-weak)]">{formatCompactHash(w.address)}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-weak)]">Balance</div>
              <div className="mt-1 text-xl font-semibold text-[var(--text-strong)]">{formatCurrency(w.balance)}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-strong)]">Transactions</h3>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowRightLeft size={16} /> Send
            </Button>
          </div>
          <div className="space-y-3">
            {TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-layer-2)] p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.type === "send" ? "bg-[var(--danger-weak)] text-[var(--danger)]" : "bg-[var(--accent-weak)] text-[var(--accent)]"}`}>
                    <ArrowRightLeft size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-strong)]">{tx.type === "mining" ? "Mining Reward" : tx.type === "send" ? "Sent" : "Received"}</div>
                    <div className="text-xs text-[var(--text-weak)]">{tx.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${tx.type === "send" ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
                    {tx.type === "send" ? "-" : "+"}{formatCurrency(tx.amount)}
                  </div>
                  <div className="text-xs text-[var(--text-weak)]">{tx.type === "mining" ? "Coinbase" : formatCompactHash(tx.to)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-strong)]">Wallet Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-[var(--text-weak)]">Address</div>
                <div className="mt-1 break-all font-mono text-xs text-[var(--text-strong)]">{wallet.address}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Copy size={14} /> Copy
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Download size={14} /> Export
                </Button>
              </div>
              <div>
                <div className="text-xs text-[var(--text-weak)]">Public Key</div>
                <div className="mt-1 break-all font-mono text-xs text-[var(--text-strong)]">{formatCompactHash(wallet.address)}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-weak)]">Created</div>
                <div className="mt-1 text-sm text-[var(--text-strong)]">{wallet.createdAt}</div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-strong)]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="gap-2">
                <Download size={16} /> Receive
              </Button>
              <Button variant="secondary" className="gap-2">
                <Upload size={16} /> Send
              </Button>
              <Button variant="secondary" className="gap-2">
                <Key size={16} /> Keys
              </Button>
              <Button variant="secondary" className="gap-2">
                <ArrowRightLeft size={16} /> Swap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
