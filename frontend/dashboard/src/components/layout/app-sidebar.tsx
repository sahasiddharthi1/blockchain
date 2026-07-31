import { Blocks, Compass, Pickaxe, Wallet, ArrowLeftRight, BarChart3, Network, User, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const GROUPS = [
  {
    title: "Platform", items: [
      { to: "/dashboard", label: "Dashboard", icon: Blocks },
      { to: "/explorer", label: "Explorer", icon: Compass },
      { to: "/mining", label: "Mining", icon: Pickaxe },
      { to: "/wallet", label: "Wallet", icon: Wallet },
      { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/network", label: "Network", icon: Network },
    ],
  },
  {
    title: "Account", items: [
      { to: "/profile", label: "Profile", icon: User },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ledgerforge-auth");
    localStorage.removeItem("lf_access_token");
    localStorage.removeItem("lf_refresh_token");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 sidebar-surface">
      <div className="flex h-16 items-center gap-3 px-5 border-b border-border/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal to-accent-blue">
          <Blocks className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold tracking-tight text-paper">Ledgerforge</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-widest text-paper-weak">
              {group.title}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                        isActive
                          ? "bg-signal-soft text-signal font-medium shadow-[inset_0_0_0_1px_rgba(124,92,252,0.25)]"
                          : "text-paper-muted hover:text-paper hover:bg-ink-overlay"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-paper-muted transition-all hover:text-paper hover:bg-ink-overlay"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
