import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const LandingPage = lazy(() => import("@/features/landing"));
const LoginPage = lazy(() => import("@/features/auth/login"));
const RegisterPage = lazy(() => import("@/features/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/features/auth/reset-password"));
const AuthenticatedRoutes = lazy(() => import("@/routes/authenticated"));

const LoadingRoute = () => (
  <div className="flex min-h-screen items-center justify-center bg-ink">
    <div className="h-8 w-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
  </div>
);

export default function Router() {
  return (
    <Suspense fallback={<LoadingRoute />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/*" element={<ProtectedRoute />} />
      </Routes>
    </Suspense>
  );
}

function ProtectedRoute() {
  const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("ledgerforge-auth"));
  return isAuth ? <AuthenticatedRoutes /> : <Navigate to="/login" replace />;
}
