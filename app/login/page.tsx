"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGoogleSignIn = () => {
    void signIn("google", { redirectTo: "/dashboard" });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-zinc-100 selection:text-zinc-900 font-sans antialiased">
      <GridBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded bg-zinc-900/50">
              <Boxes className="w-4 h-4 text-zinc-100" />
            </div>
            <span className="text-sm font-semibold tracking-tighter text-zinc-100">
              Gemini <span className="text-zinc-500 font-medium">Design MCP</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <h1 className="text-xl font-light tracking-tight text-zinc-100 mb-2">
              Sign in
            </h1>
            <p className="text-xs text-zinc-500">
              Access your API keys and dashboard
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-950 rounded font-medium text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-[10px] text-zinc-600">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </main>
    </div>
  );
}
