'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle = 'vs last period',
  icon: Icon,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
      className="glass-card flex flex-col justify-between rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {value}
        </h3>

        {change && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center font-mono font-semibold ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="mr-1 h-3.5 w-3.5" />
              )}
              {change}
            </span>
            <span className="text-muted-foreground">{subtitle}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
