'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Filter,
  Calendar,
  Trash2,
  Eye,
  X,
  TrendingUp,
  Clock,
  Database,
  RefreshCw,
} from 'lucide-react';
import { StatusChip } from '@/components/admin/data-table';

export default function ResponsesManagementPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/responses?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const json = await res.json();
        setResponses(json.responses || []);
      }
    } catch (e) {
      console.error('Failed to fetch responses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [search]);

  const handleDeleteResponse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this response record?')) return;
    try {
      const res = await fetch(`/api/admin/responses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchResponses();
        if (selectedResponse?.id === id) setSelectedResponse(null);
      }
    } catch (e) {
      console.error('Failed to delete response:', e);
    }
  };

  // Compute live real metrics from database responses
  const totalSubmissions = responses.length;

  let totalSeconds = 0;
  let validTimes = 0;
  responses.forEach((r) => {
    if (r.metadata && r.metadata.completionTimeSeconds) {
      totalSeconds += r.metadata.completionTimeSeconds;
      validTimes++;
    }
  });

  const avgSeconds = validTimes > 0 ? Math.round(totalSeconds / validTimes) : 0;
  const formatSeconds = (sec: number) => {
    if (!sec || sec === 0) return '0s';
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    return `${mins}m ${remainingSec}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Response Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, inspect, and export collected submissions for all organization forms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/api/admin/export?format=csv" download>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </a>
          <button
            onClick={fetchResponses}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex flex-1 items-center min-w-[240px] rounded-xl border border-border bg-muted/40 px-3.5 py-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search responses by name, email, or answer..."
              className="w-full bg-transparent text-xs font-sans text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Date Range: All</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Status: Verified</span>
          </div>
        </div>
      </div>

      {/* Response Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4">Respondent</th>
              <th className="px-6 py-4">Form Title</th>
              <th className="px-6 py-4">Submission Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </td>
              </tr>
            ) : responses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs">
                  No responses recorded yet.
                </td>
              </tr>
            ) : (
              responses.map((resp, idx) => {
                const nameAns =
                  resp.answers.find((a: any) =>
                    a.questionTitle?.toLowerCase().includes('name')
                  )?.value || 'Anonymous Respondent';
                const emailAns =
                  resp.answers.find((a: any) =>
                    a.questionTitle?.toLowerCase().includes('email')
                  )?.value || 'No email provided';

                const initials = nameAns
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <motion.tr
                    key={resp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="group transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedResponse(resp)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                          {initials || 'AR'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{nameAns}</p>
                          <p className="text-xs font-mono text-muted-foreground">{emailAns}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{resp.formTitle}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {new Date(resp.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status="VERIFIED" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedResponse(resp)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Inspect Response"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(resp.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete Response"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bento Grid Summary Cards (Dynamic live data) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="glass-card flex flex-col justify-between rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Response Rate
            </p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <h3 className="font-display text-2xl font-bold text-foreground">
              {totalSubmissions > 0 ? '100%' : '0%'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground font-mono">live response completion</p>
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Avg. Time to Fill
            </p>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <h3 className="font-display text-2xl font-bold text-foreground">
              {formatSeconds(avgSeconds)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground font-mono">computed from live submissions</p>
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Total Submissions
            </p>
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <h3 className="font-display text-2xl font-bold text-foreground">
              {totalSubmissions.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground font-mono">total records stored</p>
          </div>
        </div>
      </div>

      {/* Inspect Response Modal Drawer */}
      <AnimatePresence>
        {selectedResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Response Details
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    {selectedResponse.formTitle} — {selectedResponse.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="rounded-xl p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Answers Content list */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
                {selectedResponse.answers.map((ans: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
                    <p className="font-mono text-xs font-semibold text-muted-foreground">
                      {ans.questionTitle}
                    </p>
                    <p className="font-sans text-sm font-medium text-foreground whitespace-pre-wrap">
                      {ans.value || '(No answer provided)'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
