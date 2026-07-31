"use client";

import {
  Blocks, Shield, Cpu, Globe, Coins, ChartNoAxesCombined,
  ArrowRight, Menu, X, Check, Code2, Zap, Infinity,
  Network, Lock, Layers, ChevronDown, Sparkles, Wallet,
  Kanban, DollarSign, HardHat, Ship,
} from "lucide-react";
import { useState } from "react";

const LOGOS = [
  "Coinbase", "Databricks", "Reddit", "Snowflake",
  "Dropbox", "Pinterest", "MongoDB", "Sophos", "Canva", "McKesson",
];

const teams = [
  {
    id: "defi" as const,
    label: "DeFi",
    Icon: Coins,
    title: "DeFi protocols run on verifiable infrastructure.",
    desc: "Smart contract deployments, liquidity pool tracking, and cross-chain bridge monitoring — all with cryptographic proof at every step.",
    img: "/api/placeholder/800/500",
  },
  {
    id: "supply" as const,
    label: "Supply Chain",
    Icon: Ship,
    title: "Trace every asset from source to shelf.",
    desc: "Immutable ledger for provenance, automated smart contract settlements, and real-time IoT sensor data on-chain.",
    img: "/api/placeholder/800/500",
  },
  {
    id: "identity" as const,
    label: "Identity",
    Icon: Shield,
    title: "Self-sovereign identity without compromises.",
    desc: "DID management, verifiable credential issuance, and zero-knowledge proof verification at enterprise scale.",
    img: "/api/placeholder/800/500",
  },
  {
    id: "finance" as const,
    label: "Finance",
    Icon: DollarSign,
    title: "Settlement in blocks, not days.",
    desc: "Real-time gross settlement, automated compliance reporting, and multi-sig treasury management for financial institutions.",
    img: "/api/placeholder/800/500",
  },
  {
    id: "enterprise" as const,
    label: "Enterprise",
    Icon: HardHat,
    title: "Blockchain your enterprise already trusts.",
    desc: "Private consortium networks, audit trails for regulated industries, and secure inter-company data sharing.",
    img: "/api/placeholder/800/500",
  },
];

const features = [
  {
    icon: Blocks,
    title: "Live Blockchain Explorer",
    desc: "Browse every block and transaction with sub-second updates — no refresh required.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Mining Dashboard",
    desc: "Watch hash rate, difficulty, and mining progress update in real time.",
  },
  {
    icon: Wallet,
    title: "Wallet Management",
    desc: "Generate ECDSA keys, sign transactions, and track balances from chain state.",
  },
  {
    icon: Shield,
    title: "Transaction Verification",
    desc: "Every transaction is signature-checked and Merkle-proofed before reaching a block.",
  },
  {
    icon: Kanban,
    title: "Network Health Analytics",
    desc: "Chain validity, node health, and throughput in one operator-facing view.",
  },
  {
    icon: Globe,
    title: "REST + WebSocket API",
    desc: "Typed API for explorer, mining, and wallet flows with real-time events.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "Block propagation" },
  { value: "256-bit", label: "SHA-256 PoW" },
  { value: "ECDSA", label: "P-256 signing" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(teams[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeTeam = teams.find((t) => t.id === activeTab)!;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-signal/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent-purple/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Blocks className="h-6 w-6 text-signal" />
            Ledgerforge
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate md:flex">
            <a href="#features" className="transition-colors hover:text-paper">Features</a>
            <a href="#solutions" className="transition-colors hover:text-paper">Solutions</a>
            <a href="#how-it-works" className="transition-colors hover:text-paper">How it works</a>
            <a href="https://github.com" className="transition-colors hover:text-paper">GitHub</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <a href="/login" className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-slate hover:text-paper">
              Log in
            </a>
            <a href="/signup" className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-ink transition-all hover:bg-signal/90">
              Sign up free
            </a>
          </div>
          <button className="text-slate md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-line px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium text-slate">
              <a href="#features" className="transition-colors hover:text-paper">Features</a>
              <a href="#solutions" className="transition-colors hover:text-paper">Solutions</a>
              <a href="#how-it-works" className="transition-colors hover:text-paper">How it works</a>
              <a href="https://github.com" className="transition-colors hover:text-paper">GitHub</a>
              <div className="flex gap-3 pt-2">
                <a href="/login" className="flex-1 rounded-lg border border-line px-4 py-2 text-center text-sm font-medium">Log in</a>
                <a href="/signup" className="flex-1 rounded-lg bg-signal px-4 py-2 text-center text-sm font-semibold text-ink">Sign up</a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 border-b border-line overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center lg:pt-32 lg:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-raised px-4 py-1.5 text-xs font-medium text-slate-light mb-8">
            <Sparkles className="h-3.5 w-3.5 text-signal" />
            Introducing Ledgerforge 2.0 — powered by Go
          </div>
          <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            You told everyone to use&nbsp;blockchain.
            <br />
            <span className="bg-gradient-to-r from-signal via-accent-cyan to-accent-purple bg-clip-text text-transparent">
              Now give them a secure place to build.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate lg:text-xl">
            Ledgerforge lets every team build on the blockchain. IT and Security maintain
            complete visibility, governance, and control over the infrastructure.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 text-sm font-semibold text-ink transition-all hover:bg-signal/90 hover:shadow-lg hover:shadow-signal/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-7 py-3.5 text-sm font-medium transition-all hover:border-slate hover:bg-ink-raised"
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>

      {/* Logo bar */}
      <section className="relative z-10 border-b border-line py-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-slate">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="text-sm font-bold tracking-tight text-slate/40 transition-colors hover:text-slate/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="relative z-10 border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              AI made everyone a builder.
              <br />
              <span className="text-slate">But security and IT got 100&times; harder.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate">
              Now, DeFi is deploying on personal testnets. Marketing shipped an NFT collection
              on a public chain. Someone committed a private key to GitHub last week.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              None of it is malicious. They&apos;re doing exactly what you asked. But without
              visibility and control, innovation creates new risk. It&apos;s time to give every
              team a secure place to build on the blockchain.
            </p>
          </div>
        </div>
      </section>

      {/* Solution — 4 pillars */}
      <section className="relative z-10 border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-signal">
            Our 100&times; solution
          </p>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Freedom to build. Complete security. No&nbsp;compromises.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Cpu,
                title: "Visibility across blockchain activity",
                desc: "Know what exists, who built it, and what it touches. Focus on empowering teams without leaving a mess to untangle.",
              },
              {
                icon: Lock,
                title: "Control without bottlenecks",
                desc: "Determine where and how access happens so teams can self-serve and freely build. Make the governed path the easy one.",
              },
              {
                icon: Zap,
                title: "Autonomous validation, controlled by you",
                desc: "Ledgerforge identifies and suggests fixes for anomalies and potential chain issues. Your infrastructure gets better the longer it runs.",
              },
              {
                icon: Infinity,
                title: "Blockchain on your terms, always",
                desc: "Start where you're already working. Choose where and how your ledger is deployed, with freedom to evolve your strategy.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-line bg-ink-raised p-8 transition-all hover:border-line-light hover:bg-ink-overlay"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-signal/10 text-signal">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-slate">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use-case tabs (Tines-inspired team tabs) */}
      <section id="solutions" className="relative z-10 border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-signal">
            Teams using Ledgerforge
          </p>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Keep important workflows moving for the teams dependent on&nbsp;them.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            Ledgerforge gives teams the tools to safely leverage blockchain across the
            most sensitive systems, data, and processes at the highest level of security.
          </p>

          <div className="mt-10">
            <div className="flex flex-wrap gap-2 border-b border-line pb-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === t.id
                      ? "bg-signal/10 text-signal"
                      : "text-slate hover:text-paper"
                  }`}
                >
                  <t.Icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold leading-tight">{activeTeam.title}</h3>
                <p className="mt-4 leading-relaxed text-slate">{activeTeam.desc}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["Audit trail", "Real-time monitoring", "Smart contracts", "Multi-sig"].map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-slate-light"
                    >
                      <Check className="h-3 w-3 text-signal" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ink-overlay to-ink">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Layers className="mx-auto h-12 w-12 text-signal/30" />
                    <p className="mt-3 text-sm text-slate">
                      {activeTeam.label} workflow visualization
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="relative z-10 border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Everything an operator needs, nothing they don&apos;t
            </h2>
            <p className="mt-4 text-lg text-slate">
              From chain explorer to mining controls — all updating in real time
              over WebSocket, built on Go and React.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-line bg-ink-raised p-6 transition-all hover:border-signal/30 hover:shadow-lg hover:shadow-signal/5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="relative z-10 border-b border-line py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-signal lg:text-4xl">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-slate">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Bring your own transactions.
            <br />
            <span className="text-slate">We&apos;ll mine the block.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate">
            Open source, self-hostable, and built to be read end to end.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 text-sm font-semibold text-ink transition-all hover:bg-signal/90 hover:shadow-lg hover:shadow-signal/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-7 py-3.5 text-sm font-medium transition-all hover:border-slate hover:bg-ink-raised"
            >
              <Code2 className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <Blocks className="h-5 w-5 text-signal" />
                Ledgerforge
              </a>
              <p className="mt-3 text-sm text-slate">
                Blockchain infrastructure, productized.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Documentation", "Status"],
              },
              {
                title: "Solutions",
                links: ["DeFi", "Supply Chain", "Identity", "Enterprise", "Security"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact", "Privacy"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold">{col.title}</h4>
                <ul className="space-y-2 text-sm text-slate">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="transition-colors hover:text-paper">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-line pt-6 text-center text-sm text-slate">
            &copy; {new Date().getFullYear()} Ledgerforge. Built by Siddharthi Saha.
          </div>
        </div>
      </footer>
    </div>
  );
}
