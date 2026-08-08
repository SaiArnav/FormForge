'use client';

import React, { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Reveal } from '@/components/anim/reveal';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ date: string; count: number }>;
  range: '7D' | '30D';
  onRangeChange?: (range: '7D' | '30D') => void;
}

export function SubmissionTrendsChart({
  title,
  subtitle,
  data,
  range,
  onRangeChange,
}: ChartCardProps) {
  const [prevCounts, setPrevCounts] = useState<Record<string, number>>({});
  const [flashMap, setFlashMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      counts[d.date] = d.count;
    });

    const flashes: Record<string, boolean> = {};
    data.forEach((d) => {
      if ((prevCounts[d.date] ?? -1) >= 0 && prevCounts[d.date] !== d.count) {
        flashes[d.date] = true;
      }
    });
    setFlashMap(flashes);

    const t = setTimeout(() => setFlashMap({}), 1200);
    setPrevCounts(counts);
    return () => clearTimeout(t);
  }, [data]);

  const setRange = (r: '7D' | '30D') => {
    setFlashMap({});
    setPrevCounts({});
    onRangeChange?.(r);
  };

  return (
    <Reveal
      delay={0.15}
      distance={18}
      className="glass-card flex flex-col justify-between rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
          <button
            onClick={() => setRange('7D')}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              range === '7D'
                ? 'bg-brand-400 text-white font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setRange('30D')}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              range === '30D'
                ? 'bg-brand-400 text-white font-semibold shadow-xs'
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.12)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              interval={range === '30D' ? 'preserveStartEnd' : 0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(14, 165, 233, 0.08)' }}
            />
            <Bar
              dataKey="count"
              fill="url(#trendGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Live pulse indicator */}
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Auto-refreshes every 60s
        </span>
        {Object.values(flashMap).some(Boolean) && (
          <span className="text-[11px] font-mono font-semibold text-cyan-400 animate-fade-in">
            + new submission
          </span>
        )}
      </div>
    </Reveal>
  );
}

interface BreakdownProps {
  title: string;
  data: Array<{ category: string; count: number }>;
}

export function RoleBreakdownCard({ title, data }: BreakdownProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = barsRef.current;
    if (!container) return;

    const bars = Array.from(container.querySelectorAll<HTMLElement>('[data-progress]'));
    if (bars.length === 0) return;

    const anims = bars.map((bar, i) =>
      animate(bar, {
        width: `${bar.dataset.progress || '0'}%`,
        duration: 900,
        delay: 150 + i * 100,
        ease: 'outExpo',
      })
    );

    return () => {
      anims.forEach((a) => a.cancel());
    };
  }, [data]);

  return (
    <Reveal
      delay={0.25}
      distance={18}
      className="glass-card flex flex-col justify-between rounded-2xl p-6 shadow-sm"
    >
      <div className="mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">Distribution by respondent function</p>
      </div>

      <div ref={barsRef} className="space-y-4 pt-2">
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
                <div
                  data-progress={percentage}
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                  style={{ width: 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
