"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Terminal,
  ChevronDown,
  ExternalLink,
  Server,
  Search,
  RefreshCw,
  FileText,
} from "lucide-react";

// Instructions to copy for CLAUDE.md/AGENTS.md
const CLAUDE_MD_INSTRUCTIONS = `# MCP Gemini Design

**Gemini is your frontend developer.** For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.

## Before writing any UI code, ask yourself:

- Is it a NEW visual component (popup, card, section, etc.)? → \`snippet_frontend\` or \`create_frontend\`
- Is it a REDESIGN of an existing element? → \`modify_frontend\`
- Is it just text/logic, or a trivial change? → Do it yourself

## Critical rules:

1. **If UI already exists and you need to redesign/restyle it** → use \`modify_frontend\`, NOT snippet_frontend.

3. **Tasks can be mixed** (logic + UI). Mentally separate them. Do the logic yourself, delegate the UI to Gemini.`;

// Tool configurations
const TOOLS = [
  { id: "claude-code", name: "Claude Code", category: "CLI", hasLocal: true },
  { id: "codex", name: "Codex", category: "CLI", hasLocal: true },
  { id: "cursor", name: "Cursor", category: "IDE", hasLocal: true },
  { id: "vscode", name: "VS Code", category: "IDE", hasLocal: true },
  { id: "windsurf", name: "Windsurf", category: "IDE", hasLocal: true },
  { id: "zed", name: "Zed", category: "IDE", hasLocal: true },
  { id: "jetbrains", name: "JetBrains AI", category: "IDE", hasLocal: true },
  { id: "neovim", name: "Neovim", category: "Terminal", hasLocal: true },
  { id: "warp", name: "Warp", category: "Terminal", hasLocal: true },
  { id: "gemini-cli", name: "Gemini CLI", category: "CLI", hasLocal: true },
  { id: "claude-desktop", name: "Claude Desktop", category: "App", hasLocal: true },
  { id: "lm-studio", name: "LM Studio", category: "App", hasLocal: true },
];

function getConfiguration(toolId: string, apiKey: string): { code: string; language: string } {
  const key = apiKey || "YOUR_API_KEY";

  const configs: Record<string, { code: string; language: string }> = {
    "claude-code": {
      code: `claude mcp add gemini-design-mcp --env API_KEY=${key} -- npx -y gemini-design-mcp@latest`,
      language: "bash",
    },
    codex: {
      code: `codex mcp add gemini-design-mcp --env API_KEY=${key} -- npx -y gemini-design-mcp@latest`,
      language: "bash",
    },
    cursor: {
      code: JSON.stringify({
        mcpServers: {
          "gemini-design-mcp": {
            command: "npx",
            args: ["-y", "gemini-design-mcp@latest"],
            env: { API_KEY: key },
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
              env: { API_KEY: key },
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
            env: { API_KEY: key },
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
            env: { API_KEY: key },
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
            env: { API_KEY: key },
          },
        },
      }, null, 2),
      language: "json",
    },
    neovim: {
      code: `-- Add to your init.lua
require('gemini-design').setup({
  api_key = "${key}"
})`,
      language: "lua",
    },
    warp: {
      code: JSON.stringify({
        "gemini-design-mcp": {
          command: "npx",
          args: ["-y", "gemini-design-mcp@latest"],
          env: { API_KEY: key },
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
            env: { API_KEY: key },
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
            env: { API_KEY: key },
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
            env: { API_KEY: key },
          },
        },
      }, null, 2),
      language: "json",
    },
  };

  return configs[toolId] || { code: "Configuration not available", language: "text" };
}

export default function ApiKeysPage() {
  const apiKey = useQuery(api.queries.apiKeys.get);
  const createKey = useMutation(api.mutations.apiKeys.create);
  const regenerateKey = useMutation(api.mutations.apiKeys.regenerate);
  const removeKey = useMutation(api.mutations.apiKeys.remove);

  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
  const [configCopied, setConfigCopied] = useState(false);
  const [instructionsCopied, setInstructionsCopied] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [toolSearch, setToolSearch] = useState("");

  const configApiKey = createdKey || apiKey?.keyRaw || "gd_your_key_here";

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
    return getConfiguration(selectedTool.id, configApiKey);
  }, [selectedTool.id, configApiKey]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createKey({ name: newKeyName.trim() });
      setCreatedKey(result.key);
      setNewKeyName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyConfig = async () => {
    await navigator.clipboard.writeText(currentConfig.code);
    setConfigCopied(true);
    setTimeout(() => setConfigCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (confirm("Are you sure you want to regenerate your API key? Your current key will stop working immediately.")) {
      setIsRegenerating(true);
      try {
        const result = await regenerateKey({ name: apiKey?.name || "API Key" });
        setCreatedKey(result.key);
      } catch (error) {
        console.error("Failed to regenerate key:", error);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your API key? This cannot be undone.")) {
      await removeKey({});
      setCreatedKey(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-xl md:text-2xl font-light tracking-tight text-zinc-100 mb-1">API Key</h1>
        <p className="text-xs text-zinc-500 font-light">
          Your unique API key for accessing Gemini Design MCP
        </p>
      </header>

      {/* Created Key Alert */}
      {createdKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 relative rounded">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider mb-1">Key Created Successfully</h3>
              <p className="text-emerald-400/70 text-[10px] mb-3">
                Copy this key now. You won&apos;t be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-zinc-950 border border-emerald-500/20 text-xs font-mono text-emerald-300 rounded">
                  {createdKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="h-9 px-4 flex items-center gap-2 text-[10px] bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors rounded font-medium uppercase tracking-widest"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setCreatedKey(null)}
                className="mt-3 text-[9px] text-emerald-400/60 hover:text-emerald-300 uppercase tracking-[0.2em]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && !createdKey && !apiKey && (
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded">
          <h2 className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] mb-4">
            Create Your API Key
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., My API Key)"
              className="flex-1 h-9 px-3 bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 rounded"
            />
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim() || isCreating}
              className="h-9 px-5 text-[10px] bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 transition-colors uppercase tracking-[0.15em] rounded font-medium"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="h-9 px-3 text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* API Key Card */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded overflow-hidden">
        <div className="h-10 border-b border-zinc-800 flex items-center px-5 bg-zinc-950/50">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Your API Key
          </span>
        </div>

        {apiKey ? (
          <div className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center rounded">
                  <Key className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-zinc-100">{apiKey.name}</h3>
                    <span className="px-1.5 py-0.5 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500">{apiKey.keyPrefix}••••••••</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-0.5">Created</p>
                  <p className="text-[11px] text-zinc-400">{formatDate(apiKey.createdAt)}</p>
                </div>
                {apiKey.lastUsedAt && (
                  <div className="text-right">
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-0.5">Last Used</p>
                    <p className="text-[11px] text-zinc-400">{formatDate(apiKey.lastUsedAt)}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pl-4 border-l border-zinc-800">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(apiKey.keyRaw);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-8 px-3 flex items-center gap-2 text-[10px] border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 transition-colors uppercase tracking-widest rounded"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="h-8 px-2.5 flex items-center gap-2 text-[10px] border border-zinc-800 hover:border-amber-900/50 text-zinc-500 hover:text-amber-400 transition-colors rounded"
                    title="Regenerate key"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-8 px-2.5 flex items-center gap-2 text-[10px] border border-zinc-800 hover:border-red-900/50 text-zinc-500 hover:text-red-400 transition-colors rounded"
                    title="Delete key"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Key className="w-6 h-6 mx-auto text-zinc-700 mb-3" />
            <p className="text-xs text-zinc-400 mb-1">No API key yet</p>
            <p className="text-[10px] text-zinc-500 mb-4">
              Create your API key to start using Gemini Design MCP
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="h-9 px-5 inline-flex items-center gap-2 text-[10px] bg-zinc-100 hover:bg-white text-zinc-950 transition-colors uppercase tracking-widest rounded font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Create API Key
            </button>
          </div>
        )}
      </section>

      {/* Installation Instructions */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded">
        <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-5 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Installation
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-2 py-1 text-[8px] transition-colors uppercase tracking-[0.15em] rounded-sm ${
                !categoryFilter
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 text-[8px] transition-colors uppercase tracking-[0.15em] rounded-sm ${
                  categoryFilter === cat
                    ? "bg-zinc-100 text-zinc-950"
                    : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Tool Selector */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <button
                onClick={() => setShowToolDropdown(!showToolDropdown)}
                className="w-full h-10 px-3 flex items-center justify-between bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded"
              >
                <span className="text-xs text-zinc-100">{selectedTool.name}</span>
                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 text-[8px] bg-zinc-900 text-zinc-500 uppercase tracking-widest rounded">
                    {selectedTool.category}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-600 transition-transform ${showToolDropdown ? "rotate-180" : ""}`} />
                </div>
              </button>

              {showToolDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 overflow-hidden rounded">
                  <div className="p-2 border-b border-zinc-900">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input
                        type="text"
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                        placeholder="Search tools..."
                        className="w-full h-8 pl-8 pr-2 bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 rounded"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool);
                            setShowToolDropdown(false);
                            setToolSearch("");
                          }}
                          className={`w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-900 transition-colors border-b border-zinc-900/50 last:border-b-0 ${
                            selectedTool.id === tool.id ? "bg-zinc-900" : ""
                          }`}
                        >
                          <span className="text-xs text-zinc-100">{tool.name}</span>
                          <span className="px-1.5 py-0.5 text-[8px] bg-zinc-950 text-zinc-600 uppercase tracking-widest rounded">
                            {tool.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-[10px] text-zinc-600">
                        No tools found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <a
              href="https://docs.gemini-design.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 flex items-center gap-2 text-[10px] text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors uppercase tracking-widest rounded"
            >
              <ExternalLink className="w-3 h-3" />
              Docs
            </a>
          </div>

          {/* Configuration Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-zinc-600 uppercase tracking-[0.2em]">
                {currentConfig.language === "bash" ? "Terminal Command" : `${currentConfig.language.toUpperCase()} Configuration`}
              </span>
              <button
                onClick={handleCopyConfig}
                className="h-7 px-2.5 flex items-center gap-2 text-[9px] border border-zinc-800 hover:border-zinc-700 transition-colors uppercase tracking-widest rounded text-zinc-500 hover:text-zinc-200"
              >
                {configCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 border border-zinc-900 overflow-x-auto rounded">
              <code className="text-[11px] font-mono text-zinc-400 whitespace-pre">
                {currentConfig.code}
              </code>
            </pre>
          </div>

          {/* Mode Info */}
          <div className="flex items-start gap-3 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded">
            <Server className="w-3.5 h-3.5 text-zinc-600 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-zinc-400">Local Server</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                Runs the MCP server locally on your machine. Requires Node.js &gt;= 18.
              </p>
            </div>
          </div>

          {/* Info message */}
          {apiKey ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded">
              <Check className="w-3.5 h-3.5 text-emerald-500/70" />
              <p className="text-[11px] text-emerald-500/70">
                Your API key <code className="px-1 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded">{apiKey.keyPrefix}...</code> is pre-filled above.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500/70" />
              <p className="text-[11px] text-amber-500/70">
                Create an API key above to get your configuration ready to copy.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CLAUDE.md / AGENTS.md Instructions */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded">
        <div className="h-10 border-b border-zinc-800 flex items-center px-5 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Agent Instructions
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
              Add these instructions to your project&apos;s <code className="px-1 py-0.5 bg-zinc-900 text-zinc-300 rounded text-[10px]">CLAUDE.md</code> or <code className="px-1 py-0.5 bg-zinc-900 text-zinc-300 rounded text-[10px]">AGENTS.md</code> file to help your AI agent use the MCP effectively.
            </p>
            <div className="relative">
              <div className="p-4 bg-zinc-950 border border-zinc-900 overflow-x-auto rounded text-[11px] text-zinc-300 space-y-3">
                {/* Title */}
                <h1 className="text-sm font-bold text-zinc-100"># MCP Gemini Design</h1>

                {/* Intro */}
                <p>
                  <strong className="text-zinc-100">Gemini is your frontend developer.</strong> For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.
                </p>

                {/* Section: Before writing */}
                <h2 className="text-xs font-bold text-zinc-100 pt-2">## Before writing any UI code, ask yourself:</h2>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li>Is it a NEW visual component (popup, card, section, etc.)? → <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">snippet_frontend</code> or <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">create_frontend</code></li>
                  <li>Is it a REDESIGN of an existing element? → <code className="px-1 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">modify_frontend</code></li>
                  <li>Is it just text/logic, or a trivial change? → Do it yourself</li>
                </ul>

                {/* Section: Critical rules */}
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
                className="absolute top-2 right-2 h-7 px-2.5 flex items-center gap-2 text-[9px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors uppercase tracking-widest rounded text-zinc-500 hover:text-zinc-200"
              >
                {instructionsCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
