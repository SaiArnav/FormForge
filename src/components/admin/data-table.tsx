'use client';

import React from 'react';
import { MoreVertical, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function StatusChip({ status }: { status: 'VERIFIED' | 'PENDING' | 'FLAGGED' | 'COMPLETED' | 'DRAFT' | 'PUBLISHED' }) {
  const styles = {
    VERIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FLAGGED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const icons = {
    VERIFIED: CheckCircle2,
    COMPLETED: CheckCircle2,
    PUBLISHED: CheckCircle2,
    PENDING: Clock,
    DRAFT: Clock,
    FLAGGED: AlertTriangle,
  };

  const Icon = icons[status] || CheckCircle2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono tracking-tight ${styles[status] || styles.VERIFIED}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{status}</span>
    </span>
  );
}

interface ActivityRow {
  id: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  completionTimeSeconds: number;
  status: 'COMPLETED' | 'PENDING';
  respondentName?: string;
  respondentInitials: string;
}

export function RecentActivityTable({ items }: { items: ActivityRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Respondent</th>
            <th className="px-6 py-4">Form Title</th>
            <th className="px-6 py-4">Submission Date</th>
            <th className="px-6 py-4">Duration</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border font-sans text-sm">
          {items.map((row, idx) => (
            <tr
              key={row.id}
              className="group animate-fade-in transition-colors hover:bg-muted/30"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-400/15 font-display text-xs font-bold text-brand-300">
                    {row.respondentInitials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{row.respondentName}</p>
                    <p className="text-xs font-mono text-muted-foreground">{row.id.substring(0, 10)}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-foreground">
                <Link href={`/admin/forms/${row.formId}/edit`} className="hover:text-brand-300 transition-colors">
                  {row.formTitle}
                </Link>
              </td>
              <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                {new Date(row.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                {Math.floor(row.completionTimeSeconds / 60)}m {row.completionTimeSeconds % 60}s
              </td>
              <td className="px-6 py-4">
                <StatusChip status="COMPLETED" />
              </td>
              <td className="px-6 py-4 text-right">
                <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
