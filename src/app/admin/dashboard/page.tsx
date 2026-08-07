'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatsCard } from '@/components/admin/stats-card';
import { SubmissionTrendsChart, RoleBreakdownCard } from '@/components/admin/chart-card';
import { RecentActivityTable } from '@/components/admin/data-table';
import { FileText, MessageSquare, CheckCircle2, Clock, RefreshCw, Download, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const formatSeconds = (sec: number) => {
    if (!sec || sec === 0) return '0s';
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    return `${mins}m ${remainingSec}s`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Synapse Intelligence Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global performance metrics and real-time response insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <a href="/api/admin/export?format=csv" download>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </a>

          <Link href="/admin/forms/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Form</span>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row (Real-time computed data) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Submissions"
          value={(data?.totalResponses ?? 0).toLocaleString()}
          subtitle="live total in database"
          icon={MessageSquare}
          delay={0.05}
        />
        <StatsCard
          title="Completion Rate"
          value={`${data?.completionRate ?? 0}%`}
          subtitle="submitted vs total"
          icon={CheckCircle2}
          delay={0.1}
        />
        <StatsCard
          title="Avg. Time to Complete"
          value={formatSeconds(data?.avgCompletionTime ?? 0)}
          subtitle="average fill time"
          icon={Clock}
          delay={0.15}
        />
        <StatsCard
          title="Active Forms"
          value={data?.totalForms ?? 0}
          subtitle="total forms created"
          icon={FileText}
          delay={0.2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SubmissionTrendsChart
            title="Submission Trends"
            subtitle="Global submission volume over recent periods"
            data={data?.submissionTrends || []}
          />
        </div>
        <RoleBreakdownCard
          title="Responses by Role"
          data={data?.responsesByRoleOrCategory || []}
        />
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Recent Submissions</h2>
            <p className="text-xs text-muted-foreground">Live incoming response stream</p>
          </div>
          <Link
            href="/admin/responses"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all responses →
          </Link>
        </div>

        <RecentActivityTable items={data?.recentActivity || []} />
      </div>
    </div>
  );
}
