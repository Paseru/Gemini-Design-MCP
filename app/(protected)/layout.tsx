"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserMenu } from "@/components/auth/UserMenu";
import { ChevronRight, Boxes, Twitter, Linkedin } from "lucide-react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard" },
  { label: "API Keys", href: "/dashboard/api-keys" },
  { label: "Usage", href: "/dashboard/usage" },
  { label: "Billing", href: "/settings/billing" },
];

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const createProfile = useMutation(api.mutations.users.createProfile);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      createProfile().catch(console.error);
    }
  }, [isAuthenticated, createProfile]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-zinc-500/20 opacity-20"></div>
          <Boxes className="h-6 w-6 animate-pulse text-zinc-500" />
        </div>
      </div>
    );
  }

  // Generate breadcrumb segments from pathname
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <div className="relative min-h-screen bg-zinc-950 selection:bg-zinc-100 selection:text-zinc-900">
      {/* Background Pattern Removed - Minimalist Dashboard Style */}
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link 
              href="/dashboard" 
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900/50 transition-colors group-hover:border-zinc-700">
                <Boxes className="h-4 w-4 text-zinc-100" />
              </div>
              <span className="text-sm font-semibold tracking-tighter text-zinc-100">
                Gemini <span className="text-zinc-500 font-medium">Design MCP</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium transition-colors ${
                      isActive
                        ? "text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-[-1.15rem] left-3 right-3 h-[1px] bg-zinc-200" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-4rem-12rem)]">
        {/* Breadcrumbs */}
        <div className="border-b border-zinc-900/40 bg-zinc-950/30">
            <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
                <nav className="flex items-center gap-2.5 overflow-x-auto text-[10px] font-medium tracking-widest uppercase text-zinc-500 whitespace-nowrap scrollbar-hide">
                    <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
                    {pathSegments.slice(1).map((segment, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRight className="h-2.5 w-2.5 text-zinc-800 flex-shrink-0" />
                            <span className={`transition-colors ${
                                idx === pathSegments.length - 2 ? "text-zinc-200" : "hover:text-zinc-300"
                            }`}>
                                {segment.replace(/-/g, " ")}
                            </span>
                        </React.Fragment>
                    ))}
                </nav>
            </div>
        </div>

        <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Boxes className="h-4 w-4 text-zinc-100" />
                <span className="text-sm font-semibold tracking-tighter text-zinc-100">Gemini Design MCP</span>
              </div>
              <p className="max-w-xs text-[10px] leading-relaxed text-zinc-500">
                Premium frontend design for every AI agent and IDE. The precision-engineered MCP for modern developers.
              </p>
            </div>
            
            <div>
              <h3 className="mb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-100">Product</h3>
              <ul className="space-y-3 text-[10px] font-medium text-zinc-500">
                <li><Link href="/docs" className="hover:text-zinc-100 transition-colors">Documentation</Link></li>
                <li><Link href="/docs" className="hover:text-zinc-100 transition-colors">API Reference</Link></li>
                <li><Link href="/dashboard" className="hover:text-zinc-100 transition-colors">Status</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-100">Connect</h3>
              <div className="flex gap-3">
                <a href="https://x.com/RayaneRachid_" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-900 bg-zinc-900/30 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/rayane-rachid-a47514275/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-900 bg-zinc-900/30 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://discord.gg/YHrctEUTxW" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-900 bg-zinc-900/30 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-zinc-900 pt-8 sm:flex-row">
            <p className="font-mono text-[9px] font-medium text-zinc-600">
              © {new Date().getFullYear()} GEMINI DESIGN MCP
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-[10px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[10px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}