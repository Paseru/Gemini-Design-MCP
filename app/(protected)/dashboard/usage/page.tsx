"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Activity, Zap, TrendingUp, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PAGE_SIZE = 10;

export default function UsagePage() {
  const [currentPage, setCurrentPage] = useState(0);

  const stats = useQuery(api.queries.usage.getStats);
  const paginatedHistory = useQuery(api.queries.usage.getHistoryPaginated, {
    page: currentPage,
    pageSize: PAGE_SIZE,
  });
  const dailyUsage = useQuery(api.queries.usage.getDailyUsage, { days: 30 });

  // Keep previous data while loading new page
  const lastValidData = useRef(paginatedHistory);
  useEffect(() => {
    if (paginatedHistory !== undefined) {
      lastValidData.current = paginatedHistory;
    }
  }, [paginatedHistory]);

  const displayData = paginatedHistory ?? lastValidData.current;
  const isLoading = paginatedHistory === undefined;
  const isFirstLoad = isLoading && !lastValidData.current;
  const totalPages = displayData?.totalPages ?? 0;
  const totalCount = displayData?.totalCount ?? 0;

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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-xl md:text-2xl font-extralight tracking-tighter text-zinc-100 mb-1">
          Usage Statistics
        </h1>
        <p className="text-xs text-zinc-500 font-light">
          Monitor your API usage and consumption
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <Activity size={16} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Total Requests
            </span>
          </div>
          <p className="text-xl font-extralight text-zinc-100">
            {(stats?.last30Days?.totalRequests ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">Last 30 days</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-5 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <Zap size={16} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Tokens Used
            </span>
          </div>
          <p className="text-xl font-extralight text-zinc-100">
            {(stats?.last30Days?.totalOutputTokens ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">Output tokens</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-5 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <TrendingUp size={16} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Success Rate
            </span>
          </div>
          <p className="text-xl font-extralight text-zinc-100">
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

        <div className="bg-zinc-900/50 border border-zinc-800 p-5 group hover:border-zinc-700 transition-all duration-500 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors rounded">
              <Clock size={16} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Avg Latency
            </span>
          </div>
          <p className="text-xl font-extralight text-zinc-100">
            {stats?.last30Days?.avgLatencyMs
              ? `${(stats.last30Days.avgLatencyMs / 1000).toFixed(1)}s`
              : "—"}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-light">Response time (30 days)</p>
        </div>
      </div>

      {/* Usage Chart */}
      <section className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-lg">
        <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-5">
          Daily Token Usage (Last 30 Days)
        </h2>
        <div className="h-72">
          {dailyUsage && dailyUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyUsage.map(d => ({
                  ...d,
                  dateLabel: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                }))}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
                  itemStyle={{ color: "#fafafa" }}
                  formatter={(value: number) => [`${value.toLocaleString()} tokens`, "Usage"]}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  fill="url(#tokenGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-light">
              No usage data yet
            </div>
          )}
        </div>
      </section>

      {/* Usage Log */}
      <section className="bg-zinc-900/50 border border-zinc-800 overflow-hidden rounded-lg">
        <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-950/50">
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            Request Log
          </span>
        </div>

        <div className="overflow-x-auto relative">
          {/* Loading overlay */}
          {isLoading && !isFirstLoad && (
            <div className="absolute inset-0 bg-zinc-950/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/30">
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-zinc-500">
                  Timestamp
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-zinc-500">
                  Endpoint
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Input
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Output
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-center">
                  Billed From
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-zinc-500 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isFirstLoad ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-500 mx-auto" />
                  </td>
                </tr>
              ) : displayData?.logs && displayData.logs.length > 0 ? (
                displayData.logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-zinc-500 font-light">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-100 font-mono">
                      {log.endpoint}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 text-right font-light">
                      {log.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 text-right font-light">
                      {log.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-right">
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
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500 text-xs font-light">
                    No requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="h-14 border-t border-zinc-800 flex items-center justify-between px-4 bg-zinc-950/50">
            <div className="text-[11px] text-zinc-500 font-light">
              Showing{" "}
              <span className="text-zinc-300 font-medium">
                {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, totalCount)}
              </span>{" "}
              of <span className="text-zinc-300 font-medium">{totalCount}</span> results
            </div>

            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || isLoading}
                className={`
                  p-2 rounded transition-all duration-200
                  ${currentPage === 0 || isLoading
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    pageNum === 0 ||
                    pageNum === totalPages - 1 ||
                    Math.abs(pageNum - currentPage) <= 1;

                  // Show ellipsis
                  const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 2;
                  const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 3;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <span key={pageNum} className="px-1 text-zinc-600 text-xs">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                      className={`
                        min-w-[32px] h-8 px-2 text-xs font-medium rounded transition-all duration-200
                        ${pageNum === currentPage
                          ? "bg-zinc-100 text-zinc-950"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || isLoading}
                className={`
                  p-2 rounded transition-all duration-200
                  ${currentPage >= totalPages - 1 || isLoading
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }
                `}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
