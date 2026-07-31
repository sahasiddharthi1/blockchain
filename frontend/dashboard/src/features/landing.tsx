import { useState } from "react";
import { ArrowRight, Menu, X, Blocks, Shield, Zap, Globe, BarChart3, Lock, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: Blocks, title: "Real Blockchain", desc: "From-scratch Proof of Work, SHA-256 blocks, difficulty adjustment, and validated chain." },
  { icon: Shield, title: "Enterprise Security", desc: "JWT auth, refresh tokens, and wallet signing with non-exposure of private keys." },
  { icon: Zap, title: "Live Mining", desc: "Mine blocks with live nonce, hash-rate, and progress streamed over WebSockets." },
  { icon: Globe, title: "Block Explorer", desc: "Browse blocks, inspect transactions, verify hashes, and explore mempool activity." },
  { icon: BarChart3, title: "Analytics", desc: "Hash-rate, block times, difficulty, and rewards visualized with interactive charts." },
  { icon: Lock, title: "Wallets", desc: "Create wallets, import keys, sign transactions, and track balances securely." },
];

const TECH = ["Go", "Chi", "MongoDB", "Docker", "JWT", "WebSockets", "REST", "React", "TypeScript", "Vite", "Tailwind", "Recharts", "Framer Motion", "Zustand", "React Query"];

const FAQ = [
  { q: "Is the blockchain real or mocked?", a: "It is real. The platform implements a genuine Proof of Work blockchain with SHA-256 hashing, difficulty adjustment, mempool management, and chain validation." },
  { q: "Can this be deployed in production?", a: "Architecture follows production patterns: clean architecture, repository pattern, structured logging, graceful shutdown, and Docker." },
  { q: "What keys does the wallet support?", a: "Users can create wallets, generate key pairs, sign transactions, verify signatures, and view balances without exposing private keys." },
  { q: "How does mining work?", a: "Mining iterates nonces, computes SHA-256 hashes, validates difficulty targets, and broadcasts new blocks automatically." },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-signal/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal to-accent-blue">
              <Blocks className="h-4 w-4 text-white" />
            </div>
            Ledgerforge
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-paper-muted md:flex">
            <a href="#features" className="transition-colors hover:text-paper">Features</a>
            <a href="#technology" className="transition-colors hover:text-paper">Technology</a>
            <a href="#faq" className="transition-colors hover:text-paper">FAQ</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-border-light hover:text-paper">
              Log in
            </Link>
            <Link to="/register" className="rounded-xl bg-signal px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-signal/90">
              Get Started
            </Link>
          </div>
          <button className="text-paper-muted md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-border px-6 py-4 md:hidden bg-ink-raised">
            <div className="flex flex-col gap-3 text-sm text-paper-muted">
              <a href="#features" className="hover:text-paper">Features</a>
              <a href="#technology" className="hover:text-paper">Technology</a>
              <a href="#faq" className="hover:text-paper">FAQ</a>
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 rounded-xl border border-border px-4 py-2 text-center text-sm font-medium">Log in</Link>
                <Link to="/register" className="flex-1 rounded-xl bg-signal px-4 py-2 text-center text-sm font-semibold text-white">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="border-b border-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center lg:pt-32 lg:pb-32">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-ink-raised px-4 py-1.5 text-xs font-medium text-paper-muted mb-8">
              <Sparkles className="h-3.5 w-3.5 text-signal" />
              Production-ready blockchain platform
            </div>
            <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Build the future
              <br />
              <span className="bg-gradient-to-r from-signal via-accent-cyan to-accent-blue bg-clip-text text-transparent">
                on the blockchain.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-paper-muted lg:text-xl">
              A modern blockchain platform for authenticated users to mine blocks, manage wallets,
              create transactions, and explore the chain through a premium interface.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-signal/90 hover:shadow-lg hover:shadow-signal/20"
              >
                Start Building
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-medium transition-all hover:border-border-light hover:bg-ink-raised"
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="border-b border-border py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Built for the modern blockchain stack</h2>
              <p className="mt-4 text-lg text-paper-muted">From wallets to live mining dashboards, every interaction is premium, fast, and reliable.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="group rounded-2xl border border-border bg-ink-card p-6 transition-all hover:border-signal/30 hover:shadow-lg hover:shadow-signal/5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-signal-soft text-signal">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology */}
        <section id="technology" className="border-b border-border py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Proven, scalable stack</h2>
              <p className="mt-4 text-lg text-paper-muted">Built with industry-standard tools for production-grade performance.</p>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {TECH.map((item) => (
                <span key={item} className="rounded-full border border-border bg-ink-card px-4 py-2 text-sm font-medium text-paper-muted transition-colors hover:border-signal/30 hover:text-paper">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-b border-border py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="space-y-3">
              {FAQ.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-ink-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium">{item.q}</span>
                    {openFaq === idx ? <ChevronUp className="h-4 w-4 text-paper-weak" /> : <ChevronDown className="h-4 w-4 text-paper-weak" />}
                  </button>
                  {openFaq === idx && (
                    <div className="border-t border-border px-5 pb-4 text-sm text-paper-muted leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Ready to explore the chain?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-paper-muted">
              Create your account, generate a wallet, and start mining blocks in minutes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-signal/90 hover:shadow-lg hover:shadow-signal/20"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-medium transition-all hover:border-border-light hover:bg-ink-raised"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal to-accent-blue">
                  <Blocks className="h-4 w-4 text-white" />
                </div>
                Ledgerforge
              </Link>
              <p className="mt-3 text-sm text-paper-muted">Production-grade blockchain platform.</p>
            </div>
            {[
              { title: "Platform", links: ["Explorer", "Mining", "Wallet", "Analytics"] },
              { title: "Company", links: ["About", "Pricing", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-paper-muted">{col.title}</h4>
                <ul className="space-y-2 text-sm text-paper-weak">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="transition-colors hover:text-paper">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-paper-weak">
            &copy; {new Date().getFullYear()} Ledgerforge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
