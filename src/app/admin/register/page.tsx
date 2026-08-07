'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, User, Mail, Lock, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/users/check')
      .then((r) => r.json())
      .then((d) => {
        setHasUsers(d.hasUsers);
        if (d.hasUsers) {
          router.push('/admin/login');
        }
      })
      .catch(() => setHasUsers(true));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (hasUsers === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (hasUsers) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 font-sans text-foreground selection:bg-primary/20">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            Set Up FormForge
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create the first admin account. You will be the platform <strong className="text-foreground">Owner</strong>.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 font-sans text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 font-sans text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 font-sans text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-sans text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Create Owner Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/admin/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>First user is automatically assigned the Owner role</span>
        </div>
      </motion.div>
    </div>
  );
}
