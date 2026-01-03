"use client";

import { useState } from "react";
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
  Plus,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const stats = useQuery(api.queries.usage.getStats);
  const history = useQuery(api.queries.usage.getHistory, { limit: 6 });
  const subscription = useQuery(api.queries.subscriptions.getCurrent);
  const dailyUsage = useQuery(api.queries.usage.getDailyUsage, { days: 30 });

  const [errorModal, setErrorModal] = useState<{ message: string; createdAt: number } | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  };

  const getToolLabel = (endpoint: string) => {
    const toolMap: Record<string, { label: string; color: string }> = {
      create_frontend: { label: "Create", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
      modify_frontend: { label: "Modify", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
      snippet_frontend: { label: "Snippet", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
      generate_vibes: { label: "Vibes", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
    };
    return toolMap[endpoint] || { label: endpoint, color: "text-zinc-400 border-zinc-700 bg-zinc-800" };
  };

  return (
    <div className="text-zinc-300 font-light tracking-tight">
      {/* Header Section */}
      <header className="pb-6 flex justify-between items-end border-b border-zinc-800">
        <div>
          <h1 className="text-xl md:text-2xl font-light tracking-tighter mb-1 text-zinc-100">Workspace Overview</h1>
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em]">
            System Status: <span className="text-emerald-400">Operational</span> • Latency {stats?.last30Days?.avgLatencyMs ? `~${(stats.last30Days.avgLatencyMs / 1000).toFixed(1)}s` : "—"}
          </p>
        </div>
      </header>

      <main className="py-8 space-y-8">
        {/* Top Row: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1: Current Plan */}
          <div className="group relative p-5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-500 ease-out rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">Subscription</span>
              <span className="px-1.5 py-0.5 text-[9px] border border-zinc-100 bg-zinc-100 text-zinc-950 font-medium uppercase">
                {subscription?.tier || "free"}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xl font-normal text-zinc-100">
                    {((subscription?.remaining ?? 0) / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
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
              <p className="text-[10px] text-zinc-500">
                Resets {subscription?.periodEnd ? new Date(subscription.periodEnd).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {/* KPI 2: Extra Credits */}
          <div className="group p-5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-500 ease-out rounded-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold block mb-4">Credit Balance</span>
            <div className="flex items-center gap-3">
              <div className="text-xl font-normal text-zinc-100">
                {(stats?.creditsRemaining ?? 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">tokens</span>
            </div>
            <div className="mt-4">
              {(stats?.creditsRemaining ?? 0) > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-zinc-500">Extra tokens available</span>
                </div>
              ) : (
                <Link
                  href="/settings/billing"
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Purchase credits for extra usage
                </Link>
              )}
            </div>
          </div>

          {/* KPI 3: Usage History */}
          <div className="group p-5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-500 ease-out rounded-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold block mb-4">Request Volume</span>
            <div className="text-xl font-normal text-zinc-100">
              {(stats?.last30Days?.totalRequests ?? 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Last 30 days</p>
            <div className="mt-4 flex items-end gap-1 h-8">
              {(() => {
                const data = dailyUsage || [];
                if (data.length === 0) {
                  return <span className="text-[10px] text-zinc-600">No activity yet</span>;
                }
                const maxRequests = Math.max(...data.map(d => d.requests), 1);
                // Sort by date and show only days with data
                const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
                return sortedData.map((day, i) => (
                  <div
                    key={i}
                    className="w-3 bg-zinc-600 hover:bg-zinc-100 transition-colors rounded-sm cursor-default relative group/bar"
                    style={{ height: `${Math.max((day.requests / maxRequests) * 100, 15)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="font-medium">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                      <div className="text-zinc-500">{day.requests} req</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* KPI 4: Quick Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/api-keys"
              className="flex-1 flex items-center justify-between p-4 border border-zinc-100 bg-zinc-100 text-zinc-950 hover:bg-white transition-all duration-300 group rounded-lg"
            >
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-0.5">Developer</span>
                <span className="text-sm font-medium">New API Key</span>
              </div>
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </Link>
            <Link
              href="/settings/billing"
              className="flex-1 flex items-center justify-between p-4 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-300 group rounded-lg"
            >
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">Billing</span>
                <span className="text-sm font-medium text-zinc-100">Add Credits</span>
              </div>
              <CreditCard className="w-4 h-4 text-zinc-500 group-hover:text-zinc-100 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="text-sm uppercase tracking-widest flex items-center gap-3 text-zinc-100 font-semibold">
                <Activity className="w-3.5 h-3.5" />
                Recent Activity
              </h2>
              <Link href="/dashboard/usage" className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-1 font-semibold">
                View Full Log <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto bg-zinc-900/30 border border-zinc-800 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-950/50 border-b border-zinc-800">
                    <th className="px-4 py-2.5 font-semibold text-left">Tool</th>
                    <th className="px-4 py-2.5 font-semibold text-left">Time</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Input</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Output</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Latency</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {history?.logs && history.logs.length > 0 ? (
                    history.logs.map((log, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-left">
                          {(() => {
                            const tool = getToolLabel(log.endpoint);
                            return (
                              <span className={`text-[10px] px-2 py-1 border font-medium rounded ${tool.color}`}>
                                {tool.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 text-left">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 text-right tabular-nums">
                          {log.inputTokens.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 text-right tabular-nums">
                          {log.outputTokens.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 text-right tabular-nums">
                          {log.latencyMs ? `${(log.latencyMs / 1000).toFixed(1)}s` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {log.success ? (
                            <div className="inline-flex items-center justify-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-[9px] uppercase font-semibold text-emerald-400">OK</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setErrorModal({ message: log.errorMessage || "Unknown error", createdAt: log.createdAt })}
                              className="inline-flex items-center justify-center gap-1.5 hover:bg-red-400/10 px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              <span className="text-[9px] uppercase font-semibold text-red-400">ERR</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500 text-xs">
                        No activity yet. Make your first API call!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Sidebar Panels */}
          <div className="space-y-6">
            {/* API Keys Panel */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-widest font-semibold text-zinc-300">Credentials</h3>
                <Link href="/dashboard/api-keys" className="p-1 hover:bg-zinc-800 rounded">
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
              </div>
              <div className="p-5 border border-zinc-800 bg-zinc-900/30 space-y-4 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-1.5 bg-zinc-800 rounded">
                    <Key className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100 mb-0.5">Quick Start</h4>
                    <p className="text-[10px] text-zinc-500">Create your first API key</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/api-keys"
                  className="block w-full py-2.5 border border-zinc-700 text-[10px] uppercase tracking-widest hover:border-zinc-500 hover:bg-zinc-800 transition-colors text-center font-semibold text-zinc-400 rounded"
                >
                  Manage Keys
                </Link>
              </div>
            </section>

            {/* System Status */}
            <section className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest font-semibold text-zinc-300">System Health</h3>
              <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 overflow-hidden rounded-lg">
                <div className="bg-zinc-900/50 p-4">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-tighter block mb-0.5 font-semibold">Avg Latency</span>
                  <div className="text-lg font-medium text-zinc-100">
                    {stats?.last30Days?.avgLatencyMs ? `${(stats.last30Days.avgLatencyMs / 1000).toFixed(1)}s` : "—"}
                  </div>
                </div>
                <div className="bg-zinc-900/50 p-4">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-tighter block mb-0.5 font-semibold">Success Rate</span>
                  <div className="text-lg font-medium text-zinc-100">
                    {stats?.last30Days?.totalRequests
                      ? `${((stats.last30Days.successfulRequests / stats.last30Days.totalRequests) * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
                <div className="bg-zinc-900/50 p-4 col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-tighter block mb-0.5 font-semibold">Powered by</span>
                      <div className="text-xs font-medium text-zinc-300">Google Gemini</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Guide */}
            <a
              href="/docs"
              className="block relative group overflow-hidden border border-zinc-100 bg-zinc-100 p-5 text-zinc-950 hover:bg-white transition-colors rounded-lg"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code2 className="w-16 h-16 -mr-4 -mt-4" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-medium mb-2">Quick Start Guide</h3>
                <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                  Learn how to integrate Gemini Design MCP into your AI workflow.
                </p>
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest border-b border-zinc-950/30 pb-0.5 hover:border-zinc-950 transition-colors font-semibold">
                  Read Documentation <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Error Details Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] transition-opacity"
            onClick={() => setErrorModal(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-red-400/10 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-medium text-zinc-100">Error Details</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    {formatDate(errorModal.createdAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setErrorModal(null)}
                className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="rounded border border-zinc-800 bg-zinc-900/30 p-4">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-red-400">
                  {errorModal.message}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <button
                onClick={() => setErrorModal(null)}
                className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
