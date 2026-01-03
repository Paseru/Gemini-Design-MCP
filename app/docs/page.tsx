"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ChevronRight,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Search,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  Zap,
  Layout,
  Palette,
  Code2,
  RefreshCw
} from 'lucide-react';

// --- Types ---
type Tool = {
  id: string;
  name: string;
  category: "CLI" | "IDE" | "Terminal" | "App";
};

// --- Data ---
const TOOLS: Tool[] = [
  { id: "claude-code", name: "Claude Code", category: "CLI" },
  { id: "codex", name: "Codex", category: "CLI" },
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
      code: `claude mcp add gemini-design-mcp --env API_KEY=your_api_key_here -- npx -y gemini-design-mcp@latest`,
      language: "bash",
    },
    codex: {
      code: `codex mcp add gemini-design-mcp --env API_KEY=your_api_key_here -- npx -y gemini-design-mcp@latest`,
      language: "bash",
    },
    cursor: {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "your_api_key_here" },
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
              env: { API_KEY: "your_api_key_here" },
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
            env: { API_KEY: "your_api_key_here" },
          },
        },
      }, null, 2),
      language: "json",
    },
    zed: {
      code: JSON.stringify({
        context_servers: {
          "gemini-design-mcp": {
            source: "custom",
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: "your_api_key_here" },
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
            env: { API_KEY: "your_api_key_here" },
          },
        },
      }, null, 2),
      language: "json",
    },
    neovim: {
      code: `-- Add to your init.lua
require('gemini-design').setup({
  api_key = "your_api_key_here"
})`,
      language: "lua",
    },
    warp: {
      code: JSON.stringify({
        "gemini-design-mcp": {
          command: "npx",
          args: ["-y", "gemini-design-mcp@latest"],
          env: { API_KEY: "your_api_key_here" },
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
            env: { API_KEY: "your_api_key_here" },
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
            env: { API_KEY: "your_api_key_here" },
          },
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
            env: { API_KEY: "your_api_key_here" },
          },
        },
      }, null, 2),
      language: "json",
    },
  };

  return configs[toolId] || { code: "Configuration not available", language: "text" };
}

const CLAUDE_MD_INSTRUCTIONS = `# MCP Gemini Design

**Gemini is your frontend developer.** For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.

## Before writing any UI code, ask yourself:

- Is it a NEW visual component (popup, card, section, etc.)? → \`snippet_frontend\` or \`create_frontend\`
- Is it a REDESIGN of an existing element? → \`modify_frontend\`
- Is it just text/logic, or a trivial change? → Do it yourself

## Critical rules:

1. **If UI already exists and you need to redesign/restyle it** → use \`modify_frontend\`, NOT snippet_frontend.

2. **Tasks can be mixed** (logic + UI). Mentally separate them. Do the logic yourself, delegate the UI to Gemini.`;

// Example prompts for users
const EXAMPLE_PROMPTS = [
  {
    category: "Create from scratch",
    icon: <Sparkles className="w-4 h-4" />,
    prompts: [
      "Create a pricing page with 3 tiers",
      "Build me a dashboard with charts and stats",
      "Make a landing page for my SaaS",
      "Create a settings page with tabs",
      "Build a login page with social auth buttons"
    ]
  },
  {
    category: "Redesign existing",
    icon: <RefreshCw className="w-4 h-4" />,
    prompts: [
      "Make this header look more modern",
      "Redesign this card to be more premium",
      "This table looks ugly, fix it",
      "Make the sidebar look like Stripe's",
      "This form looks dated, refresh it"
    ]
  },
  {
    category: "Add components",
    icon: <Layout className="w-4 h-4" />,
    prompts: [
      "Add a search bar to the header",
      "Add a notification dropdown",
      "Add a dark mode toggle",
      "Add a user avatar menu",
      "Add a stats section above the table"
    ]
  },
  {
    category: "Style & polish",
    icon: <Palette className="w-4 h-4" />,
    prompts: [
      "Make everything more compact",
      "Use a darker color scheme",
      "Add more spacing between sections",
      "Make buttons more rounded",
      "Add subtle animations"
    ]
  }
];

// --- Components ---
const SectionHeader = ({ id, label, title, description }: { id: string, label: string, title: string, description?: string }) => (
  <header id={id} className="mb-10 scroll-mt-24">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-[1px] w-8 bg-zinc-800"></div>
      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500">{label}</span>
    </div>
    <h2 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-100 mb-3">{title}</h2>
    {description && <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">{description}</p>}
  </header>
);

// --- Main Page Component ---
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [configCopied, setConfigCopied] = useState(false);
  const [instructionsCopied, setInstructionsCopied] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [toolSearch, setToolSearch] = useState("");

  const categories = useMemo(() => {
    const cats = [...new Set(TOOLS.map((t) => t.category))];
    return cats.sort();
  }, []);

  const filteredTools = useMemo(() => {
    let tools = TOOLS;
    if (categoryFilter) {
      tools = tools.filter((t) => t.category === categoryFilter);
    }
    if (toolSearch.trim()) {
      const search = toolSearch.toLowerCase();
      tools = tools.filter((t) =>
        t.name.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search)
      );
    }
    return tools;
  }, [categoryFilter, toolSearch]);

  const currentConfig = useMemo(() => {
    return getConfiguration(selectedTool.id);
  }, [selectedTool.id]);

  const sections = [
    { id: 'getting-started', label: '01', title: 'Getting Started' },
    { id: 'how-it-works', label: '02', title: 'How It Works' },
    { id: 'what-to-ask', label: '03', title: 'What to Ask' },
    { id: 'tips', label: '04', title: 'Tips' },
    { id: 'faq', label: '05', title: 'FAQ' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-10% 0px -70% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-xl hidden lg:flex flex-col p-6 z-50">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="size-8 bg-zinc-100 rounded flex items-center justify-center">
            <Boxes className="text-zinc-950" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Gemini Design</h1>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500">Documentation</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-all rounded ${
                activeSection === section.id
                  ? 'text-zinc-100 bg-zinc-900/50'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
              }`}
            >
              <span className="text-[10px] font-mono opacity-50">{section.label}</span>
              <span className="font-medium">{section.title}</span>
              {activeSection === section.id && (
                <div className="ml-auto size-1.5 bg-zinc-100 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-zinc-900">
          <Link
            href="/dashboard/api-keys"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <Terminal size={14} />
            Get API Key
            <ArrowRight size={12} className="ml-auto" />
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-950/90 backdrop-blur-lg border-b border-zinc-900 flex items-center justify-between px-4 z-[60]">
        <Link href="/" className="flex items-center gap-2">
          <Boxes className="text-zinc-400" size={18} />
          <span className="text-sm font-bold">Docs</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[55] bg-zinc-950 pt-20 px-6">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className="w-full text-left py-3 border-b border-zinc-900 flex items-center justify-between"
              >
                <span className="text-base text-zinc-300">{section.title}</span>
                <ChevronRight size={16} className="text-zinc-600" />
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-20 pb-24 px-4 lg:px-12 max-w-4xl">

        {/* SECTION 1: GETTING STARTED */}
        <section id="getting-started" className="mb-24 scroll-mt-24">
          <SectionHeader
            id="getting-started"
            label="01 / Setup"
            title="Getting Started"
            description="Get Gemini Design working with your AI agent in under 2 minutes."
          />

          <div className="space-y-8">
            {/* Step 1: API Key */}
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-xs font-mono text-zinc-400">1</div>
              <div className="flex-1 pt-1">
                <h3 className="text-zinc-100 font-medium mb-1">Get your API Key</h3>
                <p className="text-xs text-zinc-500 mb-3">Create your API key from the dashboard. Free tier includes 10K tokens/month.</p>
                <Link
                  href="/dashboard/api-keys"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 rounded text-[10px] font-medium hover:bg-white transition-colors"
                >
                  Go to Dashboard <ArrowRight size={10} />
                </Link>
              </div>
            </div>

            {/* Step 2: Configure */}
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-xs font-mono text-zinc-400">2</div>
              <div className="flex-1 pt-1">
                <h3 className="text-zinc-100 font-medium mb-3">Configure your tool</h3>

                {/* Category filters */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setCategoryFilter(null)}
                    className={`px-2 py-1 text-[9px] transition-colors uppercase tracking-wider rounded ${
                      !categoryFilter ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-1 text-[9px] transition-colors uppercase tracking-wider rounded ${
                        categoryFilter === cat ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Tool dropdown */}
                <div className="relative mb-3">
                  <button
                    onClick={() => setShowToolDropdown(!showToolDropdown)}
                    className="w-full h-10 px-3 flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors rounded"
                  >
                    <span className="text-sm text-zinc-100">{selectedTool.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-[8px] bg-zinc-800 text-zinc-500 uppercase tracking-widest rounded">
                        {selectedTool.category}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${showToolDropdown ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {showToolDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 shadow-2xl z-50 overflow-hidden rounded">
                      <div className="p-2 border-b border-zinc-800">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                          <input
                            type="text"
                            value={toolSearch}
                            onChange={(e) => setToolSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full h-8 pl-8 pr-2 bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 rounded"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {filteredTools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setSelectedTool(tool);
                              setShowToolDropdown(false);
                              setToolSearch("");
                            }}
                            className={`w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                              selectedTool.id === tool.id ? "bg-zinc-800" : ""
                            }`}
                          >
                            <span className="text-xs text-zinc-100">{tool.name}</span>
                            <span className="px-1.5 py-0.5 text-[8px] bg-zinc-950 text-zinc-600 uppercase tracking-widest rounded">
                              {tool.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Config code */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">
                      {currentConfig.language === "bash" ? "Run in terminal" : currentConfig.language.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentConfig.code);
                        setConfigCopied(true);
                        setTimeout(() => setConfigCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {configCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {configCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 border border-zinc-800 overflow-x-auto rounded text-[11px]">
                    <code className="font-mono text-zinc-400">{currentConfig.code}</code>
                  </pre>
                </div>

                <p className="mt-2 text-[10px] text-zinc-600">
                  Replace <code className="px-1 py-0.5 bg-zinc-900 text-zinc-500 rounded">your_api_key_here</code> with your actual API key.
                </p>
              </div>
            </div>

            {/* Step 3: CLAUDE.md */}
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-xs font-mono text-zinc-400">3</div>
              <div className="flex-1 pt-1">
                <h3 className="text-zinc-100 font-medium mb-1">Add agent instructions</h3>
                <p className="text-xs text-zinc-500 mb-3">
                  Add this to your <code className="px-1 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[10px]">CLAUDE.md</code> or <code className="px-1 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[10px]">AGENTS.md</code> file.
                </p>
                <div className="relative">
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded overflow-x-auto text-[11px] text-zinc-300 space-y-3">
                    <h1 className="text-sm font-bold text-zinc-100"># MCP Gemini Design</h1>
                    <p>
                      <strong className="text-zinc-100">Gemini is your frontend developer.</strong> For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.
                    </p>
                    <h2 className="text-xs font-bold text-zinc-100 pt-2">## Before writing any UI code, ask yourself:</h2>
                    <ul className="list-disc list-inside space-y-1 text-zinc-400">
                      <li>Is it a NEW visual component (popup, card, section, etc.)? → <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">snippet_frontend</code> or <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">create_frontend</code></li>
                      <li>Is it a REDESIGN of an existing element? → <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">modify_frontend</code></li>
                      <li>Is it just text/logic, or a trivial change? → Do it yourself</li>
                    </ul>
                    <h2 className="text-xs font-bold text-zinc-100 pt-2">## Critical rules:</h2>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                      <li><strong className="text-zinc-200">If UI already exists and you need to redesign/restyle it</strong> → use <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">modify_frontend</code>, NOT snippet_frontend.</li>
                      <li className="mt-1"><strong className="text-zinc-200">Tasks can be mixed</strong> (logic + UI). Mentally separate them. Do the logic yourself, delegate the UI to Gemini.</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(CLAUDE_MD_INSTRUCTIONS);
                      setInstructionsCopied(true);
                      setTimeout(() => setInstructionsCopied(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
                    title="Copy instructions"
                  >
                    {instructionsCopied ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4: Done */}
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check size={14} className="text-emerald-400" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-zinc-100 font-medium mb-1">You're ready!</h3>
                <p className="text-xs text-zinc-500">
                  Restart your agent and start asking for frontend work. Gemini will handle the design automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section id="how-it-works" className="mb-24 scroll-mt-24">
          <SectionHeader
            id="how-it-works"
            label="02 / Flow"
            title="How It Works"
            description="You talk to your agent normally. Gemini works in the background."
          />

          <div className="grid gap-4">
            {[
              {
                step: "1",
                title: "You ask your agent",
                desc: "Write in natural language what you want. No special syntax needed.",
                example: '"Create a dashboard with user stats and a chart"'
              },
              {
                step: "2",
                title: "Agent analyzes the request",
                desc: "Your agent (Claude, Cursor, etc.) understands you need frontend work and decides to use Gemini.",
                example: "Agent thinks: this is UI work → use Gemini Design MCP"
              },
              {
                step: "3",
                title: "Gemini generates the design",
                desc: "Gemini creates production-ready React/Tailwind code that matches your project's style.",
                example: "Generates responsive, accessible, polished UI"
              },
              {
                step: "4",
                title: "Code is written to your project",
                desc: "The generated code is automatically saved to your files. No copy-paste needed.",
                example: "File saved: app/dashboard/page.tsx"
              }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400 shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-zinc-100 mb-0.5">{item.title}</h4>
                    <p className="text-xs text-zinc-500 mb-2">{item.desc}</p>
                    <div className="px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500 italic">
                      {item.example}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-300 font-medium mb-1">Key point</p>
                <p className="text-xs text-blue-400/70">
                  You never interact with Gemini directly. You just talk to your agent normally, and it uses Gemini when needed for design work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHAT TO ASK */}
        <section id="what-to-ask" className="mb-24 scroll-mt-24">
          <SectionHeader
            id="what-to-ask"
            label="03 / Examples"
            title="What You Can Ask"
            description="Here are examples of things you can ask your agent. Just talk naturally."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAMPLE_PROMPTS.map((category, i) => (
              <div key={i} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-zinc-800 rounded text-zinc-400">
                    {category.icon}
                  </div>
                  <h4 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">{category.category}</h4>
                </div>
                <ul className="space-y-2">
                  {category.prompts.map((prompt, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-zinc-500">
                      <MessageSquare size={12} className="shrink-0 mt-0.5 text-zinc-700" />
                      <span>"{prompt}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: TIPS */}
        <section id="tips" className="mb-24 scroll-mt-24">
          <SectionHeader
            id="tips"
            label="04 / Tips"
            title="Getting Better Results"
            description="A few tips to get the most out of Gemini Design."
          />

          <div className="space-y-4">
            {[
              {
                title: "Be specific about what you want",
                bad: '"Make a card"',
                good: '"Make a pricing card with 3 tiers, dark theme, highlighted Pro option"'
              },
              {
                title: "Mention existing styles to match",
                bad: '"Add a sidebar"',
                good: '"Add a sidebar that matches the header style"'
              },
              {
                title: "Iterate in small steps",
                bad: '"Create a full dashboard with everything"',
                good: '"Create the stats section first, then we\'ll add charts"'
              },
              {
                title: "Reference real products for style",
                bad: '"Make it look good"',
                good: '"Make it look like Stripe\'s dashboard"'
              }
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <h4 className="text-sm font-medium text-zinc-100 mb-3">{tip.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2 bg-red-500/5 border border-red-500/20 rounded">
                    <div className="text-[9px] uppercase tracking-wider text-red-400/70 mb-1">Avoid</div>
                    <p className="text-xs text-zinc-500 italic">{tip.bad}</p>
                  </div>
                  <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <div className="text-[9px] uppercase tracking-wider text-emerald-400/70 mb-1">Better</div>
                    <p className="text-xs text-zinc-500 italic">{tip.good}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: FAQ */}
        <section id="faq" className="mb-24 scroll-mt-24">
          <SectionHeader
            id="faq"
            label="05 / FAQ"
            title="Common Questions"
          />

          <div className="space-y-3">
            {[
              {
                q: "Do I need to learn any new syntax?",
                a: "No. You just talk to your agent normally. Say 'create a login page' or 'make this header look better' - your agent handles the rest."
              },
              {
                q: "What if I don't like the result?",
                a: "Just ask for changes! Say 'make it more compact', 'use darker colors', or 'add more spacing'. Iterate until you're happy."
              },
              {
                q: "Does it work with my existing code?",
                a: "Yes. Gemini analyzes your existing styles and generates code that matches. It won't break your design system."
              },
              {
                q: "What tech stack does it support?",
                a: "Primarily React + Tailwind CSS. It can also work with Vue, vanilla HTML/CSS, and other frameworks."
              },
              {
                q: "Is my code sent to external servers?",
                a: "Only the relevant context needed for the design request is sent to Gemini. Your full codebase stays local."
              },
              {
                q: "What's the free tier limit?",
                a: "10K tokens per month. That's roughly 6-10 component generations. Paid plans offer more."
              }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <HelpCircle size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-100 mb-1">{item.q}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
          <h3 className="text-lg font-light text-zinc-100 mb-2">Ready to start?</h3>
          <p className="text-xs text-zinc-500 mb-4">Get your API key and start building beautiful UIs.</p>
          <Link
            href="/dashboard/api-keys"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-950 rounded text-xs font-medium hover:bg-white transition-colors"
          >
            Get API Key <ArrowRight size={12} />
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-zinc-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
              Gemini Design MCP
            </p>
            <a
              href="https://discord.gg/YHrctEUTxW"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded hover:text-zinc-100 hover:border-zinc-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Join Discord
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
