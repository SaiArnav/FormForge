'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  Plus,
  Sparkles,
  LogOut,
  HelpCircle,
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
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-border bg-card p-4 transition-all duration-300">
      {/* Top Header Logo */}
      <div>
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
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
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* CTA Button & User Details */}
      <div className="space-y-4">
        <Link href="/admin/forms/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-sans text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Form</span>
          </motion.button>
        </Link>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-bold text-primary">
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
