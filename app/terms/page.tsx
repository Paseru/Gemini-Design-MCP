import React from 'react';
import Link from 'next/link';
import { Boxes, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: January 2025</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-sm leading-relaxed text-zinc-400">

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Gemini Design MCP ("Service"), you agree to be bound by these
                Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">2. Description of Service</h2>
              <p>
                Gemini Design MCP is a Model Context Protocol (MCP) server that provides AI-powered
                frontend design generation capabilities. The Service integrates with various AI agents
                and IDEs to generate premium UI components and designs.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">3. Account Registration</h2>
              <p className="mb-3">To use certain features of the Service, you must:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create an account with accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized use of your account</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">4. API Usage</h2>
              <p className="mb-3">When using our API, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use the API only for lawful purposes</li>
                <li>Not exceed your plan's rate limits or quotas</li>
                <li>Keep your API keys secure and confidential</li>
                <li>Not share API keys or attempt to circumvent usage limits</li>
                <li>Not use the API to generate harmful, illegal, or inappropriate content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">5. Pricing and Payment</h2>
              <p className="mb-3">Regarding billing:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Free tier includes limited API calls per month</li>
                <li>Paid plans are billed monthly or annually</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>Refunds are handled on a case-by-case basis</li>
                <li>You are responsible for any applicable taxes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">6. Intellectual Property</h2>
              <p className="mb-3">Ownership rights:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-zinc-300">Your Content:</strong> You retain ownership of content you create using the Service.</li>
                <li><strong className="text-zinc-300">Generated Code:</strong> Code generated by the Service is provided for your use without restrictions.</li>
                <li><strong className="text-zinc-300">Our Service:</strong> The Service, including its design and technology, remains our property.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">7. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, GEMINI DESIGN MCP SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">8. Service Availability</h2>
              <p>
                We strive to maintain high availability but do not guarantee uninterrupted service.
                We may modify, suspend, or discontinue the Service at any time with reasonable notice.
                Scheduled maintenance will be communicated in advance when possible.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">9. Termination</h2>
              <p>
                We may terminate or suspend your account at any time for violations of these Terms.
                Upon termination, your right to use the Service will immediately cease.
                You may cancel your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of
                significant changes via email or through the Service. Continued use of the Service
                after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">11. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{' '}
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
              <Link href="/privacy" className="text-[10px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
