import { cn } from "@/lib/cn";
import { Home, Compass, Pickaxe, Wallet, BarChart3, Network, User, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/explorer", label: "Explorer", icon: <Compass size={18} /> },
  { to: "/mining", label: "Mining", icon: <Pickaxe size={18} /> },
  { to: "/wallet", label: "Wallet", icon: <Wallet size={18} /> },
  { to: "/transactions", label: "Transactions", icon: <Wallet size={18} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { to: "/network", label: "Network", icon: <Network size={18} /> },
  { to: "/profile", label: "Profile", icon: <User size={18} /> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] shadow-card" />
              <div className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                Ledgerforge
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-weak)]">
              Platform
            </div>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-[var(--accent-weak)] text-[var(--accent)]"
                          : "text-[var(--text)] hover:bg-[var(--bg-layer-2)]"
                      )
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-6 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-weak)]">
              System
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-[var(--accent-weak)] text-[var(--accent)]"
                        : "text-[var(--text)] hover:bg-[var(--bg-layer-2)]"
                    )
                  }
                >
                  <Settings size={18} />
                  <span className="truncate">Settings</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-layer-2)] p-3">
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[var(--text-strong)]">User</div>
                <div className="truncate text-xs text-[var(--text-weak)]">user@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-[260px]">
        <main className="min-h-[calc(100vh-64px)] p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
