"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Code2,
  CreditCard,
  ExternalLink,
  Key,
  MoreHorizontal,
  Plus,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const stats = useQuery(api.queries.usage.getStats);
  const history = useQuery(api.queries.usage.getHistory, { limit: 6 });
  const subscription = useQuery(api.queries.subscriptions.getCurrent);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="text-zinc-300 font-light tracking-tight">
      {/* Header Section */}
      <header className="pb-8 flex justify-between items-end border-b border-zinc-800">
        <div>
          <h1 className="text-4xl font-light tracking-tighter mb-2 text-zinc-100">Workspace Overview</h1>
          <p className="text-sm text-zinc-500 font-medium uppercase tracking-[0.2em]">
            System Status: <span className="text-emerald-400">Operational</span> • Latency ~1.2s
          </p>
        </div>
      </header>

      <main className="py-10 space-y-12">
        {/* Top Row: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* KPI 1: Current Plan */}
          <div className="group relative p-8 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-500 ease-out rounded-lg">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">Subscription</span>
              <span className="px-2 py-0.5 text-[10px] border border-zinc-100 bg-zinc-100 text-zinc-950 font-medium uppercase">
                {subscription?.tier || "free"}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-normal text-zinc-100">
                    {((subscription?.remaining ?? 0) / 1000).toFixed(0)}k
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    / {((subscription?.quota ?? 0) / 1000).toFixed(0)}k tokens
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-zinc-100 transition-all duration-1000 ease-in-out rounded-full"
                    style={{ width: `${subscription?.percentUsed ?? 0}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Resets {subscription?.periodEnd ? new Date(subscription.periodEnd).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {/* KPI 2: Extra Credits */}
          <div className="group p-8 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-500 ease-out rounded-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold block mb-6">Credit Balance</span>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-normal text-zinc-100">
                {(stats?.creditsRemaining ?? 0).toLocaleString()}
              </div>
              <span className="text-xs text-zinc-500 font-medium">tokens</span>
            </div>
            <div className="mt-6 flex gap-1">
              {[1, 0.8, 0.6, 0.9, 1, 0.4, 0.7].map((h, i) => (
                <div key={i} className="flex-1 h-8 bg-zinc-800 flex items-end rounded-sm">
                  <div className="w-full bg-zinc-500 rounded-sm" style={{ height: `${h * 100}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* KPI 3: Usage History */}
          <div className="group p-8 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-500 ease-out rounded-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold block mb-6">Request Volume</span>
            <div className="text-4xl font-normal text-zinc-100">
              {(stats?.last30Days?.totalRequests ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Last 30 days</p>
            <div className="mt-4 flex items-end gap-[2px] h-12">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-100 transition-colors rounded-sm"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* KPI 4: Quick Actions */}
          <div className="flex flex-col gap-4">
            <Link
              href="/dashboard/api-keys"
              className="flex-1 flex items-center justify-between p-6 border border-zinc-100 bg-zinc-100 text-zinc-950 hover:bg-white transition-all duration-300 group rounded-lg"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Developer</span>
                <span className="text-lg font-medium">New API Key</span>
              </div>
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </Link>
            <Link
              href="/settings/billing"
              className="flex-1 flex items-center justify-between p-6 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-300 group rounded-lg"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Billing</span>
                <span className="text-lg font-medium text-zinc-100">Add Credits</span>
              </div>
              <CreditCard className="w-5 h-5 text-zinc-500 group-hover:text-zinc-100 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-medium tracking-tight flex items-center gap-3 text-zinc-100">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h2>
              <Link href="/dashboard/usage" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-1 font-semibold">
                View Full Log <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto bg-zinc-900/30 border border-zinc-800 rounded-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-950/50 border-b border-zinc-800">
                    <th className="px-6 py-4 font-semibold">Endpoint</th>
                    <th className="px-6 py-4 font-semibold">Tokens</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {history?.logs && history.logs.length > 0 ? (
                    history.logs.map((log, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <code className="text-xs bg-zinc-800 px-2 py-1 text-zinc-300 border border-zinc-700 font-medium rounded">
                            {log.endpoint}
                          </code>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-zinc-300">
                          {log.outputTokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-sm text-zinc-500">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className={`text-[10px] uppercase font-semibold ${log.success ? 'text-emerald-400' : 'text-red-400'}`}>
                              {log.success ? 'OK' : 'ERR'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-zinc-700 rounded border border-transparent hover:border-zinc-600">
                            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                        No activity yet. Make your first API call!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Sidebar Panels */}
          <div className="space-y-10">
            {/* API Keys Panel */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-300">Credentials</h3>
                <Link href="/dashboard/api-keys" className="p-1 hover:bg-zinc-800 rounded">
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
              </div>
              <div className="p-6 border border-zinc-800 bg-zinc-900/30 space-y-4 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-zinc-800 rounded">
                    <Key className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100 mb-1">Quick Start</h4>
                    <p className="text-xs text-zinc-500">Create your first API key</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/api-keys"
                  className="block w-full py-3 border border-zinc-700 text-xs uppercase tracking-widest hover:border-zinc-500 hover:bg-zinc-800 transition-colors text-center font-semibold text-zinc-400 rounded"
                >
                  Manage Keys
                </Link>
              </div>
            </section>

            {/* System Status */}
            <section className="space-y-6">
              <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-300">System Health</h3>
              <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 overflow-hidden rounded-lg">
                <div className="bg-zinc-900/50 p-6">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tighter block mb-1 font-semibold">Latency</span>
                  <div className="text-xl font-medium text-zinc-100">~1.2s</div>
                </div>
                <div className="bg-zinc-900/50 p-6">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tighter block mb-1 font-semibold">Uptime</span>
                  <div className="text-xl font-medium text-zinc-100">99.9%</div>
                </div>
                <div className="bg-zinc-900/50 p-6 col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-tighter block mb-1 font-semibold">Infrastructure</span>
                      <div className="text-sm font-medium text-zinc-300">Global Edge Network</div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Guide */}
            <a
              href="https://docs.gemini-design.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group overflow-hidden border border-zinc-100 bg-zinc-100 p-8 text-zinc-950 hover:bg-white transition-colors rounded-lg"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Code2 className="w-24 h-24 -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-medium mb-4">Quick Start Guide</h3>
                <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
                  Learn how to integrate Gemini Design MCP into your AI workflow.
                </p>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-zinc-950/30 pb-1 hover:border-zinc-950 transition-colors font-semibold">
                  Read Documentation <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
