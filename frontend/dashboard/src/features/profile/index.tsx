import { Shield, Key, Mail, Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-paper-muted">Manage your account details and preferences.</p>
      </div>

      <div className="rounded-xl border border-border bg-ink-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-signal to-accent-blue text-lg font-bold text-white">
              U
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-overlay border border-border text-paper-weak hover:text-paper transition-colors">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <div className="text-lg font-semibold">User</div>
            <div className="flex items-center gap-1.5 text-sm text-paper-muted">
              <Mail className="h-3.5 w-3.5" />
              user@example.com
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-ink-card p-6">
        <h3 className="text-sm font-semibold mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-paper-muted mb-1.5">Full Name</label>
            <input
              defaultValue="User"
              className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-paper-muted mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="user@example.com"
              className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
            />
          </div>
          <div className="flex justify-end">
            <button className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-ink-card p-6">
        <h3 className="text-sm font-semibold mb-4">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-ink-overlay p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-soft text-signal">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Two-Factor Authentication</div>
                <div className="text-xs text-paper-muted">Add an extra layer of security</div>
              </div>
            </div>
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:bg-ink-overlay hover:border-border-light">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-ink-overlay p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-cyan/10 text-accent-cyan">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Change Password</div>
                <div className="text-xs text-paper-muted">Update your password regularly</div>
              </div>
            </div>
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:bg-ink-overlay hover:border-border-light">
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
