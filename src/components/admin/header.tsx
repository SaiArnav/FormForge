'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, Bell, HelpCircle, Sun, Moon, LogOut, User, ShieldCheck, Menu } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export function Header({
  userName = 'Admin',
  userEmail = 'admin@formforge.io',
  userRole = 'OWNER',
  onSearch,
  onMenuClick,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-border bg-card/70 px-4 backdrop-blur-xl transition-colors md:px-6">
      {/* Mobile Menu + Search Input */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-all hover:scale-105 hover:bg-muted hover:text-foreground active:scale-95 lg:hidden"
          title="Open Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="relative flex w-full max-w-xs md:max-w-md lg:max-w-xs xl:max-w-md items-center rounded-full border border-border bg-muted/50 px-3.5 py-1.5 transition-all focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search forms, responses, data..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full bg-transparent text-xs font-sans text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-all hover:scale-105 hover:bg-muted hover:text-foreground active:scale-95"
          title="Toggle Theme"
        >
          {mounted ? (
            theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-all hover:scale-105 hover:bg-muted hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-400" />
        </button>

        {/* Help Center */}
        <button
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-all hover:scale-105 hover:bg-muted hover:text-foreground"
          title="Help & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="hidden sm:block h-5 w-px bg-border mx-1" />

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full border border-border bg-brand-400/10 p-1 pr-2 transition-all hover:bg-brand-400/20"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 font-display text-xs font-bold text-white shadow-sm">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden md:inline font-sans text-xs font-semibold text-foreground">
              {userName}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/30 z-50 animate-scale-in">
              <div className="border-b border-border p-2 pb-2.5">
                <p className="font-sans text-xs font-semibold text-foreground">{userName}</p>
                <p className="text-[11px] font-mono text-muted-foreground truncate">{userEmail}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-400/10 px-2 py-0.5 text-[10px] font-mono font-medium text-brand-300">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{userRole}</span>
                </div>
              </div>

              <div className="space-y-0.5 pt-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Account Settings</span>
                </Link>

                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/admin/login';
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
