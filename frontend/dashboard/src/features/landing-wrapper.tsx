import { lazy, Suspense } from "react";

const LandingPage = lazy(() => import("@/features/landing"));

export default function LandingPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  );
}
