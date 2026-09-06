import React, { useState } from 'react';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, Layers, Compass, BrainCircuit, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenDemo: (mode?: 'get-started' | 'how-it-works' | 'sign-in') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 border border-white/15">
            <span className="text-xl font-black tracking-tight">P</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                PrepPilot
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded uppercase tracking-wider">
                AI Copilot
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Student Career Intelligence
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#"
            className="hover:text-white transition-colors duration-150"
          >
            Home
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors duration-150"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#mockup"
            className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
          >
            <span>Live Preview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => onOpenDemo('sign-in')}
            className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            id="nav-signin-cta"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenDemo('get-started')}
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20"
            id="nav-primary-cta"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => onOpenDemo('get-started')}
            className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full"
          >
            Get Started
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/10"
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950/95 backdrop-blur-2xl px-6 py-5 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Features
            </a>
            <a
              href="#mockup"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white flex items-center justify-between"
            >
              <span>Live AI Preview</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">LIVE</span>
            </a>
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo('sign-in');
              }}
              className="w-full py-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-semibold text-white"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo('get-started');
              }}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
