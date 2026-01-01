"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Activity, Zap, TrendingUp, Clock } from "lucide-react";

export default function UsagePage() {
  const stats = useQuery(api.queries.usage.getStats);
  const history = useQuery(api.queries.usage.getHistory, { limit: 50 });
  const dailyUsage = useQuery(api.queries.usage.getDailyUsage, { days: 30 });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maxTokens = Math.max(...(dailyUsage?.map((d) => d.tokens) || [1]));

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-extralight tracking-tighter text-zinc-100 mb-2">
          Usage Statistics
        </h1>
        <p className="text-zinc-500 font-light">
          Monitor your API usage and consumption
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <Activity size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Total Requests
            </span>
          </div>
          <p className="text-3xl font-extralight text-zinc-100">
            {(stats?.last30Days?.totalRequests ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">Last 30 days</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <Zap size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Tokens Used
            </span>
          </div>
          <p className="text-3xl font-extralight text-zinc-100">
            {(stats?.last30Days?.totalOutputTokens ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">Output tokens</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <TrendingUp size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Success Rate
            </span>
          </div>
          <p className="text-3xl font-extralight text-zinc-100">
            {stats?.last30Days?.totalRequests
              ? Math.round(
                  (stats.last30Days.successfulRequests / stats.last30Days.totalRequests) * 100
                )
              : 100}
            %
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">
            {stats?.last30Days?.successfulRequests ?? 0} successful
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <Clock size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Est. Cost
            </span>
          </div>
          <p className="text-3xl font-extralight text-zinc-100">
            ${(stats?.last30Days?.totalCost ?? 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">Your savings this month</p>
        </div>
      </div>

      {/* Usage Chart */}
      <section className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-lg">
        <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-8">
          Daily Token Usage (Last 30 Days)
        </h2>
        <div className="flex items-end gap-1 h-48">
          {dailyUsage && dailyUsage.length > 0 ? (
            dailyUsage.map((day, i) => (
              <div
                key={i}
                className="flex-1 bg-zinc-800 hover:bg-zinc-100 transition-colors cursor-crosshair group relative rounded-t"
                style={{ height: `${(day.tokens / maxTokens) * 100}%`, minHeight: "4px" }}
                title={`${day.date}: ${day.tokens.toLocaleString()} tokens`}
              >
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-100 text-zinc-950 px-3 py-1.5 text-[10px] whitespace-nowrap z-10 rounded">
                  {day.tokens.toLocaleString()} tokens
                  <div className="w-2 h-2 bg-zinc-100 rotate-45 mx-auto -mb-1 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm font-light">
              No usage data yet
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6 text-[10px] text-zinc-500 uppercase tracking-widest">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </section>

      {/* Usage Log */}
      <section className="bg-zinc-900/50 border border-zinc-800 overflow-hidden rounded-lg">
        <div className="h-12 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/50">
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            Request Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/30">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500">
                  Endpoint
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Input
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Output
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-center">
                  Billed From
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Cost
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {history?.logs && history.logs.length > 0 ? (
                history.logs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-5 text-xs text-zinc-500 font-light">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-100 font-mono">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-500 text-right font-light">
                      {log.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-500 text-right font-light">
                      {log.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-3 py-1 text-[9px] uppercase tracking-widest font-medium rounded ${
                          log.billedFrom === "quota"
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {log.billedFrom}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-100 text-right font-medium">
                      ${log.costUsd.toFixed(4)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.success ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            log.success ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {log.success ? "OK" : "ERR"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 text-sm font-light">
                    No requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
