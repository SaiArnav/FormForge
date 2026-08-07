'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  Plus,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Role } from '@/types';

interface SidebarProps {
  userRole?: Role;
  userName?: string;
}

export function Sidebar({ userRole = 'EDITOR', userName = 'Admin' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Forms', href: '/admin/forms', icon: FileText },
    { label: 'Responses', href: '/admin/responses', icon: MessageSquare },
    { label: 'Team', href: '/admin/team', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-border bg-card/70 p-4 backdrop-blur-xl transition-all duration-300">
      {/* Top Header Logo */}
      <div>
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-md shadow-brand-500/25">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight tracking-tight text-foreground">
              FormForge
            </h1>
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              Enterprise Admin
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-sm font-medium transition-all duration-150 hover:translate-x-1 ${
                    isActive
                      ? 'bg-brand-400/15 text-brand-300 font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* CTA Button & User Details */}
      <div className="space-y-4">
        <Link href="/admin/forms/new">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 px-4 py-3 font-sans text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-transform hover:scale-[1.02] active:scale-[0.97]">
            <Plus className="h-4 w-4" />
            <span>Create New Form</span>
          </button>
        </Link>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400/20 font-display text-xs font-bold text-brand-300">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-foreground">{userName}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
