"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserMenu } from "@/components/auth/UserMenu";
import { ChevronRight, Boxes, Github, Twitter, Cpu, Terminal } from "lucide-react";

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
                Gemini <span className="text-zinc-500 font-medium">Design</span>
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
            <div className="hidden sm:flex items-center gap-1 pr-4 mr-1 border-r border-zinc-900">
                <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Terminal size={16} />
                </button>
                <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Cpu size={16} />
                </button>
            </div>
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
                <li><Link href="#" className="hover:text-zinc-100 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-zinc-100 transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-zinc-100 transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-zinc-100 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-100">Connect</h3>
              <div className="flex gap-3">
                <Link href="#" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-900 bg-zinc-900/30 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100">
                  <Github className="h-4 w-4" />
                </Link>
                <Link href="#" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-900 bg-zinc-900/30 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100">
                  <Twitter className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-zinc-900 pt-8 sm:flex-row">
            <p className="font-mono text-[9px] font-medium text-zinc-600">
              © {new Date().getFullYear()} GEMINI DESIGN MCP
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-[10px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-[10px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}