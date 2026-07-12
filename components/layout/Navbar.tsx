"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navLinks } from "@/lib/data";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 glass border-b border-border-custom transition-all duration-300 ease-in-out ${isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      style={{ backgroundColor: "var(--nav-bg)" }}
      id="navbar"
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            id="nav-logo"
          >
            <svg
              className="w-9 h-9 shrink-0"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="0" width="512" height="512" rx="112" ry="112" fill="#0F172A" />
              <path
                d="M 243.6 182.3 A 90 90 0 1 0 243.6 329.7"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="44"
                strokeLinecap="round"
              />
              <path
                d="M 318 346 L 318 166 L 348 166 A 48 48 0 0 1 348 262 L 318 262"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="44"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 352 266 L 402 346"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="44"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline text-lg font-bold text-text-primary tracking-tight">
              Chandrasekhar
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg hover:bg-primary-light"
                id={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side: Theme Toggle + Mobile Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border-custom flex items-center justify-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              id="mobile-menu-toggle"
            >
              <svg
                className="w-5 h-5 text-text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-border-custom">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary-light rounded-lg transition-colors duration-200"
                onClick={() => setMobileOpen(false)}
                id={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
