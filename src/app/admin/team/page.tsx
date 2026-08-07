'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ShieldCheck, Mail, Lock, UserPlus, X } from 'lucide-react';
import { Role } from '@/types';

export default function TeamManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (e) {
      console.error('Failed to fetch admin users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        setShowInviteModal(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchUsers();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to create admin user');
      }
    } catch (e) {
      console.error('Error inviting admin user:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Team & Role Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage platform administrators and role-based access permissions.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Admin</span>
        </motion.button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4">Admin Member</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </td>
              </tr>
            ) : (
              users.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-primary">
                      <ShieldCheck className="h-3 w-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-lg font-bold text-foreground">Invite New Admin</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-mono font-semibold uppercase text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-mono font-semibold uppercase text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@formforge.io"
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-mono font-semibold uppercase text-muted-foreground">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-mono font-semibold uppercase text-muted-foreground">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  >
                    <option value="EDITOR">EDITOR (Create & Edit Forms, Manage Responses)</option>
                    <option value="VIEWER">VIEWER (Read-only access to Analytics & Responses)</option>
                    <option value="OWNER">OWNER (Full administrative access & User management)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95"
                  >
                    {submitting ? 'Creating...' : 'Grant Admin Access'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
