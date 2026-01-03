"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Boxes, 
  Code2, 
  Layers, 
  MousePointer2, 
  Palette, 
  Zap, 
  ChevronRight, 
  Terminal, 
  Cpu, 
  Globe, 
  Layout, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ChevronDown,
  Search,
  Menu,
  X,
  FileCode,
  Sparkles,
  ArrowRight,
  Workflow,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

// --- Types ---
type ToolConfig = {
  id: string;
  name: string;
  config: string;
  path?: string;
};

// --- Documentation Data ---
const CONFIG_OPTIONS: ToolConfig[] = [
  { 
    id: 'claude-desktop', 
    name: 'Claude Desktop', 
    path: '~/Library/Application Support/Claude/claude_desktop_config.json',
    config: `{
  "mcpServers": {
    "gemini-design": {
      "command": "npx",
      "args": ["-y", "@gemini-design/mcp-server"],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here"
      }
    }
  }
}` 
  },
  { 
    id: 'cursor', 
    name: 'Cursor', 
    config: `Settings > Features > MCP
    
1. Add New MCP Server
2. Name: Gemini Design
3. Type: command
4. Command: npx -y @gemini-design/mcp-server
5. Env: GEMINI_API_KEY=your_api_key_here` 
  },
  { 
    id: 'vscode', 
    name: 'VS Code', 
    config: `// Requires "Continue" or "Cline" Extension
// In extension settings:
{
  "mcp": {
    "gemini-design": {
      "command": "npx",
      "args": ["-y", "@gemini-design/mcp-server"],
      "env": { "GEMINI_API_KEY": "..." }
    }
  }
}` 
  },
  {
    id: 'claude-code',
    name: 'Claude Code (CLI)',
    config: `claude mcp add gemini-design npx -y @gemini-design/mcp-server --env GEMINI_API_KEY=your_api_key_here`
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    config: `// Edit .windsurf/mcp_config.json
{
  "mcpServers": {
    "gemini-design": {
      "command": "npx",
      "args": ["-y", "@gemini-design/mcp-server"],
      "env": { "GEMINI_API_KEY": "..." }
    }
  }
}`
  },
  {
    id: 'zed',
    name: 'Zed',
    config: `// settings.json
{
  "context_providers": {
    "mcp": {
      "servers": [
        {
          "name": "gemini-design",
          "command": "npx",
          "args": ["-y", "@gemini-design/mcp-server"],
          "env": { "GEMINI_API_KEY": "..." }
        }
      ]
    }
  }
}`
  }
];

// --- Components ---

const CodeBlock = ({ code, language = 'json', label }: { code: string, language?: string, label?: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {label && (
        <div className="absolute top-0 left-0 bg-zinc-800/80 px-2 py-0.5 border-r border-b border-zinc-700 text-[9px] uppercase tracking-widest text-zinc-400 font-semibold rounded-tl-lg z-10">
          {label}
        </div>
      )}
      <button 
        onClick={copy}
        className="absolute top-3 right-3 p-1.5 rounded bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-600 transition-all z-10"
      >
        {copied ? <CheckCircle2 size={14} className="text-zinc-100" /> : <Copy size={14} />}
      </button>
      <pre className="p-5 pt-8 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const SectionHeader = ({ id, label, title, description }: { id: string, label: string, title: string, description?: string }) => (
  <header id={id} className="mb-12 scroll-mt-24">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-[1px] w-8 bg-zinc-900/500"></div>
      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-100">{label}</span>
    </div>
    <h2 className="text-4xl font-light tracking-tighter text-zinc-100 mb-4">{title}</h2>
    {description && <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">{description}</p>}
  </header>
);

const ToolCard = ({ 
  name, 
  description, 
  whenToUse, 
  whenNotToUse, 
  params, 
  example 
}: { 
  name: string, 
  description: string, 
  whenToUse: string, 
  whenNotToUse: string,
  params: { name: string, type: string, desc: string }[],
  example: string 
}) => (
  <div className="mb-20 p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
        <Code2 size={20} className="text-zinc-100" />
      </div>
      <h3 className="text-2xl font-mono text-zinc-100 font-medium tracking-tight">{name}</h3>
    </div>
    
    <p className="text-zinc-300 mb-8 leading-relaxed">{description}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest text-zinc-100 font-bold">
          <CheckCircle2 size={14} /> When to use
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{whenToUse}</p>
      </div>
      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest text-amber-400 font-bold">
          <X size={14} /> When NOT to use
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{whenNotToUse}</p>
      </div>
    </div>

    <div className="mb-8">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Parameters</div>
      <div className="overflow-hidden border border-zinc-800 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/50 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold border-b border-zinc-800">Param</th>
              <th className="px-4 py-3 font-semibold border-b border-zinc-800">Type</th>
              <th className="px-4 py-3 font-semibold border-b border-zinc-800">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-zinc-300">
            {params.map((p, i) => (
              <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-4 py-3 font-mono text-zinc-100/80">{p.name}</td>
                <td className="px-4 py-3 text-zinc-500">{p.type}</td>
                <td className="px-4 py-3 text-zinc-400">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Example Request</div>
      <CodeBlock code={example} label="JSON Request" />
    </div>
  </div>
);

// --- Main Page Component ---

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [selectedTool, setSelectedTool] = useState(CONFIG_OPTIONS[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'introduction', label: '01', title: 'Introduction' },
    { id: 'quickstart', label: '02', title: 'Quick Start' },
    { id: 'core-tools', label: '03', title: 'Core Tools' },
    { id: 'best-practices', label: '04', title: 'Best Practices' },
    { id: 'examples', label: '05', title: 'Examples' },
    { id: 'claude-md', label: '06', title: 'Claude.md' },
    { id: 'faq', label: '07', title: 'FAQ' },
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
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* --- Sidebar (Desktop) --- */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-xl hidden lg:flex flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="size-8 bg-zinc-100 rounded flex items-center justify-center">
            <Boxes className="text-zinc-950" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tighter">GEMINI DESIGN</h1>
            <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">MCP Server</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-6">Documentation</div>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-all duration-200 group rounded-md ${
                activeSection === section.id 
                  ? 'text-zinc-100 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
              }`}
            >
              <span className={`text-[10px] font-mono opacity-50 ${activeSection === section.id ? 'text-zinc-100' : ''}`}>
                {section.label}
              </span>
              <span className="font-medium tracking-tight">{section.title}</span>
              {activeSection === section.id && (
                <div className="ml-auto size-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-zinc-900/50">
          <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg group hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Community</span>
              <ExternalLink size={12} className="text-zinc-600 group-hover:text-zinc-100" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">Join the Discord to share your generated vibes.</p>
          </div>
        </div>
      </aside>

      {/* --- Mobile Header --- */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-900 flex items-center justify-between px-6 z-[60]">
        <div className="flex items-center gap-2">
          <Boxes className="text-zinc-400" size={20} />
          <span className="text-sm font-bold tracking-tight">GEMINI DESIGN</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* --- Mobile Nav Overlay --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[55] bg-zinc-950 pt-24 px-8">
          <nav className="space-y-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className="w-full text-left py-4 border-b border-zinc-900 flex items-center justify-between"
              >
                <span className="text-lg font-light tracking-tight text-zinc-300">{section.title}</span>
                <ChevronRight size={18} className="text-zinc-600" />
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-24 pb-32 px-6 lg:px-16 max-w-6xl mx-auto">
        
        {/* SECTION 1: INTRODUCTION */}
        <section id="introduction" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="introduction" 
            label="01 / Overview" 
            title="The Design Super-Intelligence" 
            description="Gemini Design MCP is a bridge between your preferred AI Agent and Google's Gemini design models, purpose-built for high-end React development."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: <Zap className="text-amber-400" />, 
                title: "The Power Combo", 
                desc: "Your Agent handles logic; Gemini Design handles the visual soul. High-precision styling with zero effort.",
                border: "border-amber-900/30"
              },
              { 
                icon: <Layout className="text-zinc-100" />, 
                title: "Context Preservation", 
                desc: "Smart diffing and context-aware injection means your existing design system rules are never broken.",
                border: "border-zinc-800"
              },
              { 
                icon: <ShieldCheck className="text-zinc-100" />, 
                title: "Production Ready", 
                desc: "Outputs Tailwind 4 + React 19 code that is optimized, accessible, and ready for deployment.",
                border: "border-zinc-800"
              }
            ].map((feature, i) => (
              <div key={i} className={`p-6 bg-zinc-900/30 border ${feature.border} rounded-xl hover:bg-zinc-900/50 transition-all group`}>
                <div className="mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-zinc-100 font-semibold mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-zinc-100 font-bold mb-2">Architect Philosophy</div>
              <h4 className="text-xl font-light tracking-tight text-zinc-100 mb-4">Why use Gemini for Design?</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Most LLMs struggle with visual spatial awareness and modern aesthetics. Gemini models are uniquely fine-tuned on millions of high-end dribbble-style interactions and minimalist design patterns, making them the superior choice for frontend engineering.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="size-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-zinc-500 italic">Used by 2,400+ lead designers</span>
              </div>
            </div>
            <div className="w-full md:w-64 aspect-square bg-zinc-950 rounded-lg border border-zinc-800 p-4 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex flex-col gap-2">
                  <div className="h-2 w-full bg-zinc-900 rounded animate-pulse" />
                  <div className="h-2 w-3/4 bg-zinc-900 rounded animate-pulse delay-75" />
                  <div className="h-2 w-1/2 bg-zinc-900 rounded animate-pulse delay-150" />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="h-12 bg-zinc-800/50 border border-zinc-700 rounded-md" />
                    <div className="h-12 bg-zinc-800/50 border border-zinc-700 rounded-md" />
                  </div>
                  <div className="mt-4 h-20 bg-zinc-800 border border-zinc-700 rounded-md flex items-center justify-center">
                    <Palette className="text-zinc-100/50" size={32} />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: QUICK START */}
        <section id="quickstart" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="quickstart" 
            label="02 / Setup" 
            title="Zero to Design" 
            description="Install the MCP server and connect it to your favorite coding assistant in seconds."
          />

          <div className="space-y-8">
            <div className="flex flex-col gap-6">
               <div className="flex items-start gap-4">
                 <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-xs font-mono text-zinc-100">1</div>
                 <div className="pt-1">
                    <h5 className="text-zinc-100 font-medium mb-1">Acquire Gemini API Key</h5>
                    <p className="text-xs text-zinc-400 mb-3">Get your key from Google AI Studio (Flash models are currently free-tier friendly).</p>
                    <a href="https://aistudio.google.com/" target="_blank" className="text-[10px] uppercase font-bold text-zinc-100 hover:text-zinc-100 flex items-center gap-1 transition-colors">
                      Go to AI Studio <ExternalLink size={10} />
                    </a>
                 </div>
               </div>

               <div className="flex items-start gap-4">
                 <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-xs font-mono text-zinc-100">2</div>
                 <div className="pt-1 flex-1">
                    <h5 className="text-zinc-100 font-medium mb-4">Configure Tool</h5>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {CONFIG_OPTIONS.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setSelectedTool(tool)}
                          className={`px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-bold transition-all ${
                            selectedTool.id === tool.id 
                              ? 'bg-zinc-800 border-zinc-600 text-zinc-100' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          {tool.name}
                        </button>
                      ))}
                    </div>
                    {selectedTool.path && (
                      <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500">
                        <Terminal size={12} />
                        Config path: {selectedTool.path}
                      </div>
                    )}
                    <CodeBlock code={selectedTool.config} label={`${selectedTool.name} Configuration`} />
                 </div>
               </div>

               <div className="flex items-start gap-4">
                 <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-xs font-mono text-zinc-100">3</div>
                 <div className="pt-1">
                    <h5 className="text-zinc-100 font-medium mb-1">Verify Connection</h5>
                    <p className="text-xs text-zinc-400 mb-4">Restart your agent and type the following in the chat:</p>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-300">
                      "Help me design a modern dashboard vibe using the Gemini Design tools."
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CORE TOOLS */}
        <section id="core-tools" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="core-tools" 
            label="03 / Reference" 
            title="Surgical Precision Tools" 
            description="The server exposes 4 primary tools. Each is optimized for a specific stage of the design engineering lifecycle."
          />

          <ToolCard 
            name="generate_vibes"
            description="Explores the aesthetic space for a new project. It generates 5 distinct 'Design Vibes' including color palettes, typography choices, and layout philosophies."
            whenToUse="At the start of a project when you have a description but no clear visual direction."
            whenNotToUse="When you already have a design system or existing UI files."
            params={[
              { name: "projectDescription", type: "string", desc: "A high-level overview of what the app does." },
              { name: "projectType", type: "enum", desc: "Options: dashboard, landing, saas, ecom, docs." },
              { name: "targetAudience", type: "string", desc: "Optional hint about who will use the app." }
            ]}
            example={`{
  "projectDescription": "A minimalist task manager for elite engineers",
  "projectType": "dashboard",
  "targetAudience": "Developers"
}`}
          />

          <ToolCard 
            name="create_frontend"
            description="Generates a complete, production-ready frontend file from scratch. It understands complex layouts and creates dense, feature-rich interfaces."
            whenToUse="Creating a new page, a complex dashboard view, or an entire landing page."
            whenNotToUse="Adding a single button or small element to an existing file."
            params={[
              { name: "request", type: "string", desc: "Detailed UI requirements." },
              { name: "filePath", type: "string", desc: "The intended destination (e.g., app/dashboard/page.tsx)." },
              { name: "techStack", type: "string", desc: "Specific technologies (e.g., 'Tailwind 4, React 19')." },
              { name: "context", type: "string", desc: "Existing code references for style matching." }
            ]}
            example={`{
  "request": "A settings page with user profile, API keys, and notification toggles.",
  "filePath": "app/settings/page.tsx",
  "techStack": "Next.js 14, Lucide Icons, Framer Motion",
  "writeFile": true
}`}
          />

          <ToolCard 
            name="modify_frontend"
            description="Redesigns a specific, isolated UI element within a file. It performs surgical updates without affecting the surrounding logic or layout."
            whenToUse="Redesigning a table to look more 'pro', changing a navigation bar, or updating a card style."
            whenNotToUse="Changing large-scale layout architecture or writing logic."
            params={[
              { name: "modification", type: "string", desc: "Instructions for the visual change." },
              { name: "targetCode", type: "string", desc: "The specific snippet to be modified." },
              { name: "filePath", type: "string", desc: "The file being edited." },
              { name: "scale", type: "enum", desc: "small | medium | large (complexity hint)" }
            ]}
            example={`{
  "modification": "Make this table look like a high-end Bloomberg terminal with tighter padding and mono fonts.",
  "targetCode": "<table>...</table>",
  "scale": "medium"
}`}
          />

          <ToolCard 
            name="snippet_frontend"
            description="Generates a JSX/TSX fragment intended to be inserted at a specific location. Perfect for incremental building."
            whenToUse="Adding a new chart to a dashboard or a testimonial section to a landing page."
            whenNotToUse="Building whole pages or changing existing code."
            params={[
              { name: "request", type: "string", desc: "What the snippet should represent." },
              { name: "targetFile", type: "string", desc: "Context of where this lives." },
              { name: "insertAfterPattern", type: "string", desc: "RegEx or string to find the insertion point." }
            ]}
            example={`{
  "request": "A glassmorphism statistics card showing Monthly Active Users.",
  "targetFile": "components/stats-grid.tsx",
  "insertAfterPattern": "<!-- STATS_END -->"
}`}
          />
        </section>

        {/* SECTION 4: BEST PRACTICES */}
        <section id="best-practices" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="best-practices" 
            label="04 / Workflow" 
            title="The Architect's Protocol" 
            description="Maximizing the quality of Gemini-generated design requires a structured approach to prompting and context."
          />

          <div className="space-y-12">
            <div className="p-8 border border-zinc-800 bg-zinc-900/30 rounded-xl">
               <div className="flex items-center gap-2 mb-6">
                 <Workflow size={20} className="text-zinc-100" />
                 <h4 className="text-lg font-semibold tracking-tight">The Three-Step Loop</h4>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { step: "01", title: "Vibe Discovery", text: "Always start with generate_vibes. It builds the 'mental model' for Gemini before you write a single line of code." },
                   { step: "02", title: "Global Draft", text: "Use create_frontend for the skeleton. Provide a vibe description in the context parameter for consistency." },
                   { step: "03", title: "Iterative Polish", text: "Use modify_frontend to polish specific components until they feel premium. Small, focused changes win." }
                 ].map((s, i) => (
                   <div key={i} className="relative">
                      <div className="text-[40px] font-black text-zinc-800/50 absolute -top-6 -left-2 -z-10">{s.step}</div>
                      <h5 className="text-sm font-bold text-zinc-100 mb-2">{s.title}</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed">{s.text}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-6 border border-zinc-800 bg-zinc-900/10 rounded-xl">
                 <div className="flex items-center gap-2 mb-4 text-zinc-100">
                    <Info size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">The "Context" Rule</span>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed">
                   When using <code className="text-zinc-100/80">modify_frontend</code>, always include the imports and theme configuration of your project in the <code className="text-zinc-300">context</code> field. Gemini uses this to ensure it doesn't invent new Tailwind colors or component libraries that aren't already in your stack.
                 </p>
               </div>
               <div className="p-6 border border-zinc-800 bg-zinc-900/10 rounded-xl">
                 <div className="flex items-center gap-2 mb-4 text-amber-400">
                    <Cpu size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Scale Parameter</span>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed">
                   Set <code className="text-amber-400/80">scale: "large"</code> only for complex, multi-element changes. For simple color or font tweaks, use <code className="text-zinc-300">"small"</code>. This prevents the model from over-engineering the solution and keeps latency low.
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: EXAMPLES */}
        <section id="examples" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="examples" 
            label="05 / Showcase" 
            title="Real-World Implementation" 
            description="See how complex prompts transform into surgical tool calls."
          />

          <div className="space-y-12">
            {[
              {
                title: "Premium Analytics Card",
                prompt: "Create a dense, high-end analytics card for 'Total Revenue'. It should have a micro-chart, a percentage change badge, and a refined border-glow effect.",
                tool: "snippet_frontend",
                outcome: "Generated a 40-line component using Lucide, Tailwind 4, and a subtle Framer Motion entry animation."
              },
              {
                title: "Bento-Grid Dashboard",
                prompt: "I need a full dashboard layout for a crypto platform. Use a 'Dark Architect' vibe: monochromatic, zinc colors, and emerald accents. Dense information but breathable spacing.",
                tool: "create_frontend",
                outcome: "Produced a complete page.tsx with 12 grid items, realistic data, and responsive sidebar."
              }
            ].map((ex, i) => (
              <div key={i} className="group p-1 border border-zinc-800 bg-zinc-900/20 rounded-2xl hover:border-zinc-600/30 transition-colors">
                <div className="p-6 bg-zinc-950 rounded-xl">
                   <div className="flex items-center justify-between mb-4">
                     <h5 className="text-sm font-bold text-zinc-100">{ex.title}</h5>
                     <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-100 uppercase tracking-widest">{ex.tool}</div>
                   </div>
                   <div className="flex flex-col gap-4">
                     <div className="p-4 bg-zinc-900/50 rounded-lg border-l-2 border-zinc-600">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Prompt</div>
                        <p className="text-xs text-zinc-300 italic">"{ex.prompt}"</p>
                     </div>
                     <div className="p-4 bg-zinc-900/50 rounded-lg border-l-2 border-zinc-700">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Result</div>
                        <p className="text-xs text-zinc-400">{ex.outcome}</p>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CLAUDE.MD INTEGRATION */}
        <section id="claude-md" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="claude-md" 
            label="06 / Advanced" 
            title="The Agent's Instruction Manual" 
            description="For high-performance agents (like Claude Code or Cursor), copy this into your project instructions or .cursorrules file."
          />

          <div className="relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <FileCode size={16} className="text-zinc-100" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">CLAUDE_DESIGN.md</span>
            </div>
            <CodeBlock 
              code={`# Gemini Design Protocol
You are an expert Frontend Architect. Use the Gemini Design MCP tools for ALL visual development tasks.

## Protocol:
1. DESIGN FIRST: If starting a new UI, run 'generate_vibes' first.
2. COMPONENT ARCHITECTURE: Use 'create_frontend' for new files. Do not write raw code manually if complex UI is needed.
3. SURGICAL UPDATES: Use 'modify_frontend' for visual changes to existing code.
4. TAILWIND 4: Always use Tailwind 4 conventions (e.g. bg-zinc-950, tracking-tighter).
5. MINIMALISM: Stick to the "Architect" aesthetic: monochromatic with specific accent highlights.

## Tool Context:
- Always pass existing imports to the 'context' parameter.
- Use 'writeFile: true' to save results immediately.`} 
            />
          </div>
        </section>

        {/* SECTION 7: FAQ */}
        <section id="faq" className="mb-32 scroll-mt-24">
          <SectionHeader 
            id="faq" 
            label="07 / Support" 
            title="Common Questions" 
            description="Everything else you might need to know about the Gemini Design MCP Server."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Is it really free to use?",
                a: "The MCP server is open-source. Gemini Flash 2.0 (the recommended model) currently has a generous free tier on Google AI Studio."
              },
              {
                q: "Can I use it with Shadcn/UI?",
                a: "Absolutely. Just mention Shadcn in your 'techStack' parameter or project context, and Gemini will use those components correctly."
              },
              {
                q: "Does it support Vue or Svelte?",
                a: "While optimized for React/Next.js, you can specify other frameworks in the parameters. The model handles most modern frontend stacks."
              },
              {
                q: "How do I update the server?",
                a: "Simply run 'npm install -g @gemini-design/mcp-server@latest' or clear your npx cache."
              },
              {
                q: "What if the output is too large?",
                a: "Use the 'snippet_frontend' tool instead of 'create_frontend' to build your page piece by piece."
              },
              {
                q: "Can it see my local images?",
                a: "No, the model only sees the text context you provide. For images, use descriptive placeholders or public URLs."
              }
            ].map((item, i) => (
              <div key={i} className="p-6 border border-zinc-900 bg-zinc-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <HelpCircle className="text-zinc-100 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="text-sm font-semibold text-zinc-100 mb-2">{item.q}</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="border-t border-zinc-900 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
          <div className="flex items-center gap-2">
            <Boxes size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Gemini Design MCP © 2025</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[10px] uppercase font-bold hover:text-white transition-colors">Twitter / X</a>
            <a href="#" className="text-[10px] uppercase font-bold hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-[10px] uppercase font-bold hover:text-white transition-colors">npm</a>
          </div>
        </footer>

      </main>

      {/* --- Floating Action: Back to top --- */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 size-12 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 lg:hidden"
      >
        <ChevronDown className="rotate-180" size={24} />
      </button>
    </div>
  );
}