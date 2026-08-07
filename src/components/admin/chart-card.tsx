'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ date: string; count: number }>;
}

export function SubmissionTrendsChart({ title, subtitle, data }: ChartCardProps) {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card flex flex-col justify-between rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
          <button
            onClick={() => setTimeRange('7D')}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              timeRange === '7D'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange('30D')}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              timeRange === '30D'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30D
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(140,140,160,0.15)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'gray' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'gray' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(0, 82, 204, 0.08)' }}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface BreakdownProps {
  title: string;
  data: Array<{ category: string; count: number }>;
}

export function RoleBreakdownCard({ title, data }: BreakdownProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card flex flex-col justify-between rounded-2xl p-6 shadow-sm"
    >
      <div className="mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">Distribution by respondent function</p>
      </div>

      <div className="space-y-4 pt-2">
        {data.map((item, idx) => {
          const percentage = Math.round((item.count / maxCount) * 100);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">{item.category}</span>
                <span className="font-mono text-muted-foreground">
                  {item.count.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
