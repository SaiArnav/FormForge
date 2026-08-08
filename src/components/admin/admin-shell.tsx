'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
import { Role } from '@/types';

interface AdminShellProps {
  userName: string;
  userEmail: string;
  userRole: Role;
  children: React.ReactNode;
}

export function AdminShell({ userName, userEmail, userRole, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Sidebar
        userRole={userRole}
        userName={userName}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 lg:ml-64">
        <Header
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
