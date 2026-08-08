import React from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { getAuthSession } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // Login/register pages or unauthenticated users get a bare layout (no sidebar/header)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <AdminShell
        userName={session.name}
        userEmail={session.email}
        userRole={session.role}
      >
        {children}
      </AdminShell>
    </div>
  );
}
