'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Reveal } from '@/components/anim/reveal';
import { FloatingBackground } from '@/components/anim/floating-background';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-border bg-card/60 py-2.5 pl-10 pr-10 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 font-sans text-foreground selection:bg-brand-400/20">
      <FloatingBackground />

      <Reveal className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Brand Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            FormForge Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your organization&apos;s private form workspace.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/30">
          {error && (
            <Reveal className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </Reveal>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@formforge.io"
                  className={inputClass}
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 py-3 font-sans text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Authenticate Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Secured with HTTP-only Cookies & Role Authorization</span>
        </div>
      </Reveal>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
