"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Chrome, Loader2, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const router = useRouter();

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
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out">
        <div className="relative">
          <div className="w-16 h-16 border-[1px] border-stone-200 rounded-full animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-800 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-stone-400 font-light animate-pulse">
          Curating Space...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-stone-200 selection:text-stone-900 flex flex-col font-sans text-stone-900">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-100 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-100 to-transparent" />
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-stone-50" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-stone-50" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] transition-all duration-700 ease-out">

          {/* Brand Presentation */}
          <div className="flex flex-col items-center mb-16 space-y-8">
            <div className="group relative">
              <div className="w-14 h-14 bg-gradient-to-br from-stone-900 via-stone-700 to-stone-800 rounded-xl shadow-2xl flex items-center justify-center transform transition-transform duration-700 group-hover:rotate-45">
                <div className="w-6 h-6 border-[1.5px] border-white/20 rounded-sm rotate-45" />
              </div>
              <div className="absolute -inset-4 border border-stone-100 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-stone-900">
                Gemini <span className="font-medium">Design</span>
              </h1>
              <p className="text-[12px] tracking-[0.05em] text-stone-400 font-light max-w-[280px] mx-auto leading-relaxed">
                Premium frontend generation for AI agents
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-10 sm:p-12 rounded-none relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-[1px] bg-stone-300" />
            <div className="absolute top-0 left-0 w-[1px] h-4 bg-stone-300" />

            <header className="mb-10 text-center">
              <h2 className="text-lg font-medium tracking-tight text-stone-900 mb-2">Sign in</h2>
              <p className="text-sm text-stone-400 font-light">Continue with your Google account</p>
            </header>

            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-stone-900 text-white hover:bg-black transition-all duration-300 ease-in-out"
              >
                <Chrome className="w-4 h-4 text-stone-300 group-hover:text-white transition-colors" />
                <span className="text-[13px] font-medium tracking-wide">Continue with Google</span>
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Micro-features in the card */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-stone-50 pt-8">
              <div className="flex flex-col gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-300" />
                <span className="text-[10px] text-stone-400 font-light leading-tight">Secure production environment</span>
              </div>
              <div className="flex flex-col gap-2">
                <Globe className="w-4 h-4 text-stone-300" />
                <span className="text-[10px] text-stone-400 font-light leading-tight">Global CDN propagation</span>
              </div>
            </div>
          </div>

          {/* Footer Meta */}
          <footer className="mt-12 text-center space-y-6">
            <p className="text-[11px] text-stone-400 font-light leading-relaxed max-w-sm mx-auto">
              By signing in, you agree to our Terms of Service
            </p>

            <div className="flex items-center justify-center gap-8">
              <div className="h-12 w-[1px] bg-stone-100" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-medium tracking-tighter text-stone-300 uppercase">Version</span>
                <span className="text-[12px] font-mono text-stone-400">2025.0.1</span>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Decorative Floor Reflection / Bottom Bar */}
      <div className="h-2 w-full bg-gradient-to-t from-stone-50 to-transparent opacity-50" />

      {/* Floating Interaction Labels */}
      <div className="fixed bottom-8 left-8 hidden lg:block">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Systems Nominal</span>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 hidden lg:block">
        <div className="flex items-center gap-2 text-stone-300 hover:text-stone-600 transition-colors cursor-pointer">
          <span className="text-[10px] uppercase tracking-[0.2em]">Contact Support</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
