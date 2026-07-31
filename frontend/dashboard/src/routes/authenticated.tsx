import { Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { AuthenticatedLayout } from "@/layouts/authenticated";
import Dashboard from "@/features/dashboard";
import Explorer from "@/features/explorer";
import Mining from "@/features/mining";
import Wallet from "@/features/wallet";
import Transactions from "@/features/transactions";
import Analytics from "@/features/analytics";
import Network from "@/features/network";
import Profile from "@/features/profile";
import Settings from "@/features/settings";

const Loading = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
  </div>
);

export default function AuthenticatedRoutes() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/mining" element={<Mining />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/network" element={<Network />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AuthenticatedLayout>
  );
}
