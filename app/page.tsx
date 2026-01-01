"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Cpu,
  Code2,
  Layers,
  Globe,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Play,
  ShieldCheck,
  Activity,
  Command,
  MousePointer2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Boxes,
  Workflow,
  Search,
  ChevronDown,
  Key
} from 'lucide-react';

/**
 * GEMINI DESIGN MCP - PREMIUM LANDING PAGE
 * Design Vibe: The Precision Architect
 * Focus: High-end engineering, monochromatic, surgical precision.
 */

// --- Tool Configurations ---
const TOOLS = [
  { id: "claude-code", name: "Claude Code", category: "CLI" },
  { id: "cursor", name: "Cursor", category: "IDE" },
  { id: "vscode", name: "VS Code", category: "IDE" },
  { id: "windsurf", name: "Windsurf", category: "IDE" },
  { id: "zed", name: "Zed", category: "IDE" },
  { id: "jetbrains", name: "JetBrains AI", category: "IDE" },
  { id: "neovim", name: "Neovim", category: "Terminal" },
  { id: "warp", name: "Warp", category: "Terminal" },
  { id: "gemini-cli", name: "Gemini CLI", category: "CLI" },
  { id: "claude-desktop", name: "Claude Desktop", category: "App" },
  { id: "lm-studio", name: "LM Studio", category: "App" },
];

function getConfiguration(toolId: string): { code: string; language: string } {
  const configs: Record<string, { code: string; language: string }> = {
    "claude-code": {
      code: `claude mcp add gemini-design-mcp --env API_KEY=YOUR_API_KEY -- npx -y gemini-design-mcp@latest`,
      language: "bash",
    },
    cursor: {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
    vscode: {
      code: JSON.stringify({
        mcp: {
          servers: {
            "gemini-design-mcp": {
              type: "stdio",
              command: "npx",
              args: ["-y", "gemini-design-mcp@latest"],
              env: { API_KEY: "YOUR_API_KEY" },
            },
          },
        },
      }, null, 2),
      language: "json",
    },
    windsurf: {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
    zed: {
      code: JSON.stringify({
        context_servers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
    jetbrains: {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
    "claude-desktop": {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
    "gemini-cli": {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
    neovim: {
      code: `-- Add to your init.lua
require('gemini-design').setup({
  api_key = "YOUR_API_KEY"
})`,
      language: "lua",
    },
    warp: {
      code: JSON.stringify({
        "gemini-design-mcp": {
          command: "npx",
          args: ["-y", "gemini-design-mcp@latest"],
          env: { API_KEY: "YOUR_API_KEY" },
        },
      }, null, 2),
      language: "json",
    },
    "lm-studio": {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "YOUR_API_KEY" },
          },
        },
      }, null, 2),
      language: "json",
    },
  };

  return configs[toolId] || { code: "Configuration not available", language: "text" };
}

// --- Components ---

const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400">
    <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
    {children}
  </span>
);

const SectionHeading = ({ title, subtitle, align = 'center' }: { title: string, subtitle: string, align?: 'center' | 'left' }) => (
  <div className={`mb-10 space-y-2 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <h2 className="text-xl md:text-2xl font-light tracking-tight text-zinc-100">
      {title}
    </h2>
    <p className={`text-zinc-500 max-w-xl text-xs leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
      {subtitle}
    </p>
  </div>
);

const ToolMarquee = () => {
  const tools = ["Claude Code", "Cursor", "VS Code", "Windsurf", "Zed", "JetBrains AI", "Neovim", "Warp", "Gemini CLI", "Claude Desktop", "LM Studio", "Codex", "Copilot", "DeepSeek", "PyCharm", "and more..."];

  const ToolList = () => (
    <>
      {tools.map((tool, i) => (
        <span key={i} className="text-zinc-600 font-mono text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors cursor-default mx-6 shrink-0">
          {tool}
        </span>
      ))}
    </>
  );

  return (
    <div className="relative w-full py-12 border-y border-zinc-900 bg-zinc-950/50 overflow-hidden">
      <div className="flex items-center w-max animate-scroll">
        <div className="flex items-center">
          <ToolList />
        </div>
        <div className="flex items-center">
          <ToolList />
        </div>
      </div>
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
    </div>
  );
};

// --- Main Page ---

export default function GeminiDesignMCP() {
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const currentConfig = getConfiguration(selectedTool.id);

  const filteredTools = TOOLS.filter((tool) =>
    tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    tool.category.toLowerCase().includes(toolSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-zinc-100 selection:text-zinc-900 font-sans antialiased">
      <style jsx global>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center border border-zinc-700 rounded bg-zinc-900 shadow-inner">
              <Boxes className="w-4 h-4 text-zinc-100" />
            </div>
            <span className="font-semibold tracking-tighter text-zinc-100 text-lg">Gemini Design MCP</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-zinc-500">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#docs" className="hover:text-zinc-100 transition-colors">Integration</a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a>
            <Link href="/login" className="px-4 py-2 border border-zinc-700 text-zinc-100 rounded hover:bg-zinc-100 hover:text-zinc-950 transition-all duration-300">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <GridBackground />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge>Works with ANY AI Agent & IDE</Badge>
          <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-light tracking-tighter text-zinc-100 mb-6 max-w-3xl mx-auto leading-[0.95]">
            <span className="relative inline-flex items-center">
              <img
                src="/gemini-logo.svg"
                alt=""
                className="absolute -left-8 md:-left-10 w-6 h-6 md:w-8 md:h-8 opacity-60 rotate-12 blur-[0.5px]"
              />
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">Gemini</span>
            </span> as your <br />
            <span className="italic text-zinc-500">frontend developer.</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Combine <span className="text-zinc-100">Gemini&apos;s design power</span> with any AI model you use—Claude, Codex, GPT-4, or others. Stay in the same IDE, same conversation, same context. No switching required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 text-zinc-950 rounded font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              Get API Key <ArrowRight className="w-3 h-3" />
            </Link>
            <a href="#docs" className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-all">
              See Installation
            </a>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 overflow-hidden rounded">
            {[
              { label: "Compatibility", value: "ANY", sub: "Models & IDEs" },
              { label: "Context Loss", value: "ZERO", sub: "Same conversation" },
              { label: "Design Quality", value: "A++", sub: "Production-ready" },
              { label: "Setup Time", value: "30s", sub: "One command" }
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-950 p-4 md:p-5 text-left group hover:bg-zinc-900/50 transition-colors">
                <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 font-bold">{stat.label}</p>
                <p className="text-xl font-light text-zinc-100 tracking-tight mb-0.5">{stat.value}</p>
                <p className="text-[10px] text-zinc-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <ToolMarquee />

      {/* Video Placeholder Section */}
      <section className="py-16 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="relative group rounded-lg overflow-hidden aspect-video border border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center gap-4 shadow-xl">
            {/* Visual background details */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent)]" />
            <div className="absolute inset-0 border-[0.5px] border-zinc-700/50 m-12 pointer-events-none" />
            <div className="absolute top-0 left-0 p-4 font-mono text-[10px] text-zinc-600">
              $ gemini-design-mcp --monitor --visualize
            </div>

            <div className="relative z-10 w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900/80 backdrop-blur shadow-lg group-hover:scale-110 transition-transform duration-500 cursor-pointer">
              <div className="w-10 h-10 rounded-full border border-zinc-500/50 flex items-center justify-center animate-pulse">
                <Play className="w-5 h-5 text-zinc-100 fill-zinc-100 ml-0.5" />
              </div>
            </div>

            <div className="text-center relative z-10">
              <h3 className="text-base font-light text-zinc-300 tracking-tight">Technical Demo Coming Soon</h3>
              <p className="text-zinc-600 text-xs mt-1 font-mono italic tracking-tighter">PREVIEW: Building a React Dashboard in 2.8 seconds</p>
            </div>

            <div className="absolute bottom-4 right-6 flex gap-3">
              <div className="h-1.5 w-8 rounded-full bg-zinc-800" />
              <div className="h-1.5 w-8 rounded-full bg-zinc-800" />
              <div className="h-1.5 w-24 rounded-full bg-zinc-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Power Combo Synergy Section */}
      <section className="py-16 px-6 relative border-t border-zinc-900 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-zinc-900/50" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-zinc-900/50" />

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge>The Power Combo</Badge>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-zinc-100 mt-4 leading-[1.1]">
              The Synergy of Specialized Intelligence.
            </h2>
            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-zinc-100 font-medium text-sm mb-0.5">Architectural Logic</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Utilize Claude or GPT-4o to define your core backend architecture and complex business logic.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-zinc-100 font-medium text-sm mb-0.5">Premium UI Generation</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Leverage Gemini&apos;s specialized creative reasoning for high-fidelity, polished frontend components.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-zinc-100 font-medium text-sm mb-0.5">Context Preservation</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Both models collaborate within your existing thread, maintaining full project awareness without context switching.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-900">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                </div>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">ide_orchestrator.ts</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded border border-zinc-800 bg-zinc-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-mono text-zinc-400">Your AI Model: Computing Backend Logic</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-purple-500/50" />
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <Workflow className="w-5 h-5 text-zinc-700 animate-pulse" />
                </div>

                <div className="p-4 rounded border border-zinc-800 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-mono text-zinc-400">Gemini: Generating UI Layer</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-blue-500/50" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="h-10 border border-blue-500/20 bg-blue-500/5 rounded" />
                      <div className="h-10 border border-blue-500/20 bg-blue-500/5 rounded" />
                      <div className="h-10 border border-blue-500/20 bg-blue-500/5 rounded" />
                      <div className="h-10 border border-blue-500/20 bg-blue-500/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-6 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="MCP Capabilities"
            subtitle="Granular tools designed for high-precision frontend iteration directly through the Model Context Protocol."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-5 h-5" />,
                title: "create_frontend",
                desc: "Scaffolds complete responsive views based on high-level logic requirements. Tailored Tailwind & React."
              },
              {
                icon: <Layers className="w-5 h-5" />,
                title: "modify_frontend",
                desc: "Surgical edits to existing components. Adjust margins, color weights, or layouts with absolute precision."
              },
              {
                icon: <MousePointer2 className="w-5 h-5" />,
                title: "snippet_frontend",
                desc: "Generate standalone UI components (modals, charts, tables) to inject into your current architecture."
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "Context Isolation",
                desc: "Zero risk of breaking backend logic while styling. Intelligent context tracking keeps your code safe."
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "Responsive First",
                desc: "Everything generated is mobile-optimized by default with smart breakpoints for every device."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Direct File Write",
                desc: "Zero lag filesystem access. The MCP server writes directly to your workspace instantly."
              }
            ].map((feat, i) => (
              <div key={i} className="group p-5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all rounded relative">
                <div className="mb-3 p-1.5 w-fit border border-zinc-700 rounded bg-zinc-950 text-zinc-100 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.03)] transition-shadow">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-medium text-zinc-100 mb-1.5 font-mono tracking-tight">{feat.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{feat.desc}</p>
                <div className="flex items-center gap-1 text-[9px] text-zinc-600 uppercase tracking-widest font-semibold group-hover:text-zinc-400 cursor-pointer">
                  Learn more <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="docs" className="py-16 px-6 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            title="Integration"
            subtitle="Select your environment and get your configuration ready."
          />

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg">
            {/* Tool Selector Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 relative z-20">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowToolDropdown(!showToolDropdown);
                    if (!showToolDropdown) setToolSearch("");
                  }}
                  className="w-full h-10 px-4 flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors rounded"
                >
                  <span className="text-xs text-zinc-100">{selectedTool.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[9px] bg-zinc-800 text-zinc-500 uppercase tracking-widest rounded">
                      {selectedTool.category}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${showToolDropdown ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Dropdown - outside the card */}
                <div
                  className={`absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl shadow-black/50 z-50 transition-all duration-200 origin-top ${
                    showToolDropdown
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {/* Search */}
                  <div className="p-3 border-b border-zinc-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                        placeholder="Search tools..."
                        className="w-full h-9 pl-9 pr-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                        autoFocus={showToolDropdown}
                      />
                    </div>
                  </div>
                  {/* Options */}
                  <div className="max-h-[240px] overflow-y-auto py-1">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool);
                            setShowToolDropdown(false);
                            setToolSearch("");
                          }}
                          className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                            selectedTool.id === tool.id ? "bg-zinc-800/50" : ""
                          }`}
                        >
                          <span className="text-xs text-zinc-200">{tool.name}</span>
                          <span className="px-1.5 py-0.5 text-[9px] bg-zinc-950 text-zinc-500 uppercase tracking-widest rounded">
                            {tool.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-xs text-zinc-500">
                        No tools found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Code */}
            <div className="p-5 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                  {currentConfig.language === "bash" ? "Terminal Command" : `${currentConfig.language.toUpperCase()} Configuration`}
                </span>
              </div>
              <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded overflow-x-auto">
                <code className="text-[11px] font-mono text-zinc-300 whitespace-pre">
                  {currentConfig.code}
                </code>
              </pre>
            </div>
          </div>

          {/* API Key Notice */}
          <div className="mt-5 p-4 border border-zinc-800 rounded bg-zinc-950">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <p className="text-zinc-100 text-xs font-medium mb-1">API Key Required</p>
                <p className="text-zinc-500 text-[10px] leading-relaxed mb-3">
                  Replace <code className="px-1 py-0.5 bg-zinc-900 text-zinc-400 rounded">YOUR_API_KEY</code> with your actual key. Create a free account to get started.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 rounded text-[10px] font-medium hover:bg-white transition-colors"
                >
                  Create Account & Get Key <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Simple, Honest Pricing"
            subtitle="Start free. Scale as you grow. No hidden fees."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                tier: "Starter",
                price: "Free",
                desc: "Perfect for experimenting with the MCP protocol.",
                features: ["30K Tokens / month", "Standard Latency", "Community Support", "Any IDE support"],
                cta: "Get Started",
                highlight: false
              },
              {
                tier: "Professional",
                price: "$19",
                desc: "For engineers who demand precision and speed daily.",
                features: ["500K Tokens / month", "Priority Queue", "Full app scaffolding", "Email Support"],
                cta: "Go Pro",
                highlight: true
              },
              {
                tier: "Enterprise",
                price: "$79",
                desc: "Custom tooling for teams requiring governance and scale.",
                features: ["3M Tokens / month", "Ultra-low latency", "Team token pooling", "24/7 Priority Support"],
                cta: "Contact Sales",
                highlight: false
              }
            ].map((plan, i) => (
              <div key={i} className={`p-5 rounded-lg border ${plan.highlight ? 'border-zinc-100 bg-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.03)]' : 'border-zinc-800 bg-zinc-950'} flex flex-col h-full relative overflow-hidden group`}>
                {plan.highlight && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="bg-zinc-100 text-zinc-950 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Popular</span>
                  </div>
                )}
                <p className={`text-[9px] uppercase tracking-widest font-bold mb-2 ${plan.highlight ? 'text-zinc-400' : 'text-zinc-600'}`}>{plan.tier}</p>
                <div className="flex items-baseline gap-0.5 mb-4">
                  <span className={`text-2xl font-light tracking-tighter ${plan.highlight ? 'text-zinc-100' : 'text-zinc-300'}`}>{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-zinc-600 text-[10px]">/mo</span>}
                </div>
                <p className="text-[11px] text-zinc-500 mb-5 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <CheckCircle2 className={`w-3 h-3 ${plan.highlight ? 'text-zinc-100' : 'text-zinc-600'}`} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`w-full py-2.5 rounded text-xs font-medium transition-all text-center block ${
                  plan.highlight
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-white'
                  : 'bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800'
                }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 border-t border-zinc-900 bg-[radial-gradient(circle_at_top,rgba(24,24,27,1),rgba(9,9,11,1))]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-zinc-100 mb-4">
            Ready to add Gemini to your workflow?
          </h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto text-sm font-light leading-relaxed">
            Combine <span className="text-zinc-300">your favorite AI model</span> with <span className="text-zinc-100">Gemini&apos;s design power</span>. Same IDE, same context, better results.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-zinc-100 text-zinc-950 rounded font-medium text-xs hover:bg-white transition-all shadow-lg">
              Get Started for Free
            </Link>
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> No Credit Card Required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-1.5 mb-4">
                <Boxes className="w-4 h-4 text-zinc-100" />
                <span className="font-semibold tracking-tighter text-zinc-100 text-sm">Gemini Design MCP</span>
              </Link>
              <p className="text-zinc-500 text-[10px] max-w-xs leading-relaxed mb-4">
                Premium frontend design for every AI agent and IDE.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-[9px] uppercase tracking-widest font-bold text-zinc-600 hover:text-zinc-100 transition-colors">
                  Documentation
                </a>
                <a href="#" className="text-[9px] uppercase tracking-widest font-bold text-zinc-600 hover:text-zinc-100 transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-[9px] uppercase tracking-widest font-bold text-zinc-600 hover:text-zinc-100 transition-colors">
                  Discord
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-[9px] uppercase tracking-widest font-bold text-zinc-300 mb-4">Product</h5>
              <ul className="space-y-2 text-[10px] text-zinc-500">
                <li><a href="#features" className="hover:text-zinc-100 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a></li>
                <li><a href="#docs" className="hover:text-zinc-100 transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[9px] uppercase tracking-widest font-bold text-zinc-300 mb-4">Resources</h5>
              <ul className="space-y-2 text-[10px] text-zinc-500">
                <li><a href="#" className="hover:text-zinc-100 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[9px] uppercase tracking-widest font-bold text-zinc-300 mb-4">Legal</h5>
              <ul className="space-y-2 text-[10px] text-zinc-500">
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900 text-center">
            <p className="text-[9px] text-zinc-600 font-mono tracking-widest">
              © 2025 GEMINI DESIGN MCP
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
