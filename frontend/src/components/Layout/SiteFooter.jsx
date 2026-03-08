import React from 'react';
import { Link } from 'react-router-dom';
import { Languages, Mail, Globe2 } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-accent-100 mt-16 bg-white/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-700 text-white flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <p className="font-bold text-ink-950 text-lg">PolyChat</p>
          </div>
          <p className="text-sm text-ink-600 max-w-md leading-relaxed">
            Real-time multilingual team communication with translation and cultural nuance support.
            Built for global teams collaborating across language and timezone boundaries.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              hello@polychat.app
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              Global Hybrid Teams
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-ink-950 mb-3">Product</h4>
          <div className="space-y-2 text-sm text-ink-600">
            <Link to="/features" className="block hover:text-accent-700">Features</Link>
            <Link to="/pricing" className="block hover:text-accent-700">Pricing</Link>
            <Link to="/dashboard" className="block hover:text-accent-700">Workspace</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-ink-950 mb-3">Company</h4>
          <div className="space-y-2 text-sm text-ink-600">
            <Link to="/about" className="block hover:text-accent-700">About</Link>
            <Link to="/signup" className="block hover:text-accent-700">Get Started</Link>
            <Link to="/login" className="block hover:text-accent-700">Sign In</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-ink-500 flex flex-wrap gap-2 justify-between">
          <span>(c) {new Date().getFullYear()} PolyChat. All rights reserved.</span>
          <span>Realtime multilingual communication for modern teams.</span>
        </div>
      </div>
    </footer>
  );
}
