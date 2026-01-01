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
} from "lucide-react";

// Tool configurations
const TOOLS = [
  { id: "claude-code", name: "Claude Code", category: "CLI", hasLocal: true },
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
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-extralight tracking-tighter text-zinc-100 mb-2">API Key</h1>
        <p className="text-zinc-500 font-light">
          Your unique API key for accessing Gemini Design MCP
        </p>
      </header>

      {/* Created Key Alert */}
      {createdKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 relative rounded-lg">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-emerald-300 font-medium mb-1">Key Created Successfully</h3>
              <p className="text-emerald-400/70 text-sm mb-4">
                Copy this key now. You won&apos;t be able to see it again.
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-zinc-950 border border-emerald-500/20 text-sm font-mono text-emerald-300 rounded">
                  {createdKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="h-11 px-4 flex items-center gap-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors rounded font-medium"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setCreatedKey(null)}
                className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-widest"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && !createdKey && !apiKey && (
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg">
          <h2 className="text-sm font-medium text-zinc-100 uppercase tracking-widest mb-6">
            Create Your API Key
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., My API Key)"
              className="flex-1 h-11 px-4 bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 rounded"
            />
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim() || isCreating}
              className="h-11 px-6 text-xs bg-zinc-100 hover:bg-white disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 transition-colors uppercase tracking-widest rounded font-medium"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="h-11 px-4 text-xs text-zinc-500 hover:text-zinc-100 uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* API Key Card */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="h-12 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/50">
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            Your API Key
          </span>
        </div>

        {apiKey ? (
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 flex items-center justify-center rounded-lg">
                  <Key className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-medium text-zinc-100">{apiKey.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-sm font-mono text-zinc-500">{apiKey.keyPrefix}••••••••</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Created</p>
                  <p className="text-sm text-zinc-400">{formatDate(apiKey.createdAt)}</p>
                </div>
                {apiKey.lastUsedAt && (
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Last Used</p>
                    <p className="text-sm text-zinc-400">{formatDate(apiKey.lastUsedAt)}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pl-6 border-l border-zinc-800">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(apiKey.keyRaw);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-9 px-3 flex items-center gap-2 text-[11px] border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 transition-colors uppercase tracking-widest rounded"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="h-9 px-3 flex items-center gap-2 text-[11px] border border-zinc-700 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 transition-colors rounded"
                    title="Regenerate key"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-9 px-3 flex items-center gap-2 text-[11px] border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition-colors rounded"
                    title="Delete key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Key className="w-8 h-8 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 mb-2">No API key yet</p>
            <p className="text-sm text-zinc-500 mb-6">
              Create your API key to start using Gemini Design MCP
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="h-11 px-6 inline-flex items-center gap-2 text-xs bg-zinc-100 hover:bg-white text-zinc-950 transition-colors uppercase tracking-widest rounded font-medium"
            >
              <Plus className="w-4 h-4" />
              Create API Key
            </button>
          </div>
        )}
      </section>

      {/* Installation Instructions */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              Installation
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 text-[10px] transition-colors uppercase tracking-widest rounded ${
                !categoryFilter
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-zinc-800 text-zinc-500 hover:text-zinc-100"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-[10px] transition-colors uppercase tracking-widest rounded ${
                  categoryFilter === cat
                    ? "bg-zinc-100 text-zinc-950"
                    : "bg-zinc-800 text-zinc-500 hover:text-zinc-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Tool Selector */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <button
                onClick={() => setShowToolDropdown(!showToolDropdown)}
                className="w-full h-12 px-4 flex items-center justify-between bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors rounded"
              >
                <span className="text-sm text-zinc-100">{selectedTool.name}</span>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 uppercase tracking-widest rounded">
                    {selectedTool.category}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showToolDropdown ? "rotate-180" : ""}`} />
                </div>
              </button>

              {showToolDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/50 z-50 overflow-hidden rounded-lg">
                  <div className="p-3 border-b border-zinc-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                        placeholder="Search tools..."
                        className="w-full h-10 pl-10 pr-3 bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 rounded"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool);
                            setShowToolDropdown(false);
                            setToolSearch("");
                          }}
                          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-b-0 ${
                            selectedTool.id === tool.id ? "bg-zinc-800" : ""
                          }`}
                        >
                          <span className="text-sm text-zinc-100">{tool.name}</span>
                          <span className="px-2 py-0.5 text-[10px] bg-zinc-950 text-zinc-500 uppercase tracking-widest rounded">
                            {tool.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-zinc-500">
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
              className="h-12 px-4 flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-500 transition-colors uppercase tracking-widest rounded"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Docs
            </a>
          </div>

          {/* Configuration Code */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {currentConfig.language === "bash" ? "Terminal Command" : `${currentConfig.language.toUpperCase()} Configuration`}
              </span>
              <button
                onClick={handleCopyConfig}
                className="h-8 px-3 flex items-center gap-2 text-[10px] border border-zinc-700 hover:border-zinc-500 transition-colors uppercase tracking-widest rounded text-zinc-400 hover:text-zinc-100"
              >
                {configCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-6 bg-zinc-950 border border-zinc-800 overflow-x-auto rounded">
              <code className="text-sm font-mono text-zinc-300 whitespace-pre">
                {currentConfig.code}
              </code>
            </pre>
          </div>

          {/* Mode Info */}
          <div className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded">
            <Server className="w-4 h-4 text-zinc-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-300">Local Server</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Runs the MCP server locally on your machine. Requires Node.js &gt;= 18.
              </p>
            </div>
          </div>

          {/* Info message */}
          {apiKey ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded">
              <Check className="w-4 h-4 text-emerald-400" />
              <p className="text-sm text-emerald-300">
                Your API key <code className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded">{apiKey.keyPrefix}...</code> is pre-filled above.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <p className="text-sm text-amber-300">
                Create an API key above to get your configuration ready to copy.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
