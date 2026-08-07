import React from 'react';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
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
      <Sidebar
        userRole={session.role}
        userName={session.name}
      />

      <div className="flex flex-1 flex-col ml-64 min-w-0">
        <Header
          userName={session.name}
          userEmail={session.email}
          userRole={session.role}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
