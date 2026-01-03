import React from 'react';
import Link from 'next/link';
import { Boxes, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900/50 transition-colors group-hover:border-zinc-700">
              <Boxes className="h-4 w-4 text-zinc-100" />
            </div>
            <span className="text-sm font-semibold tracking-tighter text-zinc-100">
              Gemini <span className="text-zinc-500 font-medium">Design MCP</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Legal</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: January 2025</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-sm leading-relaxed text-zinc-400">

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">1. Introduction</h2>
              <p>
                Gemini Design MCP ("we", "our", or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our Model Context Protocol (MCP) service and website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">2. Information We Collect</h2>
              <p className="mb-3">We collect information that you provide directly to us:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-zinc-300">Account Information:</strong> Email address and authentication data when you create an account.</li>
                <li><strong className="text-zinc-300">API Usage Data:</strong> Information about your API requests, including request counts and timestamps.</li>
                <li><strong className="text-zinc-300">Payment Information:</strong> Billing details processed securely through our payment provider (Stripe).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Send you technical notices and support messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">4. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide
                you services. We will retain and use your information as necessary to comply with our
                legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security
                of your personal information. However, no method of transmission over the Internet or
                electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">6. Third-Party Services</h2>
              <p className="mb-3">We may use third-party services that collect information, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-zinc-300">Convex:</strong> For backend infrastructure and data storage</li>
                <li><strong className="text-zinc-300">Stripe:</strong> For payment processing</li>
                <li><strong className="text-zinc-300">Google (Gemini API):</strong> For AI-powered design generation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:rayanenocode@gmail.com" className="text-zinc-100 hover:text-zinc-300 underline underline-offset-2">
                  rayanenocode@gmail.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-mono text-[9px] font-medium text-zinc-600">
              © {new Date().getFullYear()} GEMINI DESIGN MCP
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[10px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
