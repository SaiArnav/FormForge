'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Bell, Save, Check, Trash2, AlertTriangle, X } from 'lucide-react';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('Synapse Intelligence Private Org');
  const [saved, setSaved] = useState(false);

  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePurgeAllData = async () => {
    setPurging(true);
    try {
      const res = await fetch('/api/admin/reset-data', { method: 'POST' });
      if (res.ok) {
        setPurgeSuccess(true);
        setTimeout(() => {
          setShowPurgeModal(false);
          setPurgeSuccess(false);
          window.location.reload();
        }, 1500);
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to purge workspace data');
      }
    } catch (e) {
      console.error('Purge error:', e);
      alert('An error occurred during data purge.');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          System Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure private organization preferences, default form behaviors, and security protocols.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Preferences */}
        <div className="glass-card rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-foreground">Organization Details</h3>

          <div>
            <label className="mb-1 block text-xs font-mono font-semibold uppercase text-muted-foreground">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-sans text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Security & Data Retention */}
        <div className="glass-card rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-foreground">Security & Authorization</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-foreground">Strict Server-side Auth Check</p>
                <p className="text-[11px] text-muted-foreground">Verify JWT cookies on every admin endpoint</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary" />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-foreground">HTTPS-Only Cookies</p>
                <p className="text-[11px] text-muted-foreground">Enforce secure HTTP-only cookies in production</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary" />
            </label>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95"
        >
          {saved ? <Check className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          <span>{saved ? 'Settings Saved!' : 'Save System Settings'}</span>
        </motion.button>
      </form>

      {/* Danger Zone: Reset Workspace Data */}
      <div className="glass-card rounded-3xl p-6 shadow-xs border-destructive/30 bg-destructive/5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Danger Zone: Workspace Reset</span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently delete all forms, questions, options, responses, and submitted files. Your admin accounts will remain active so you can start completely fresh.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPurgeModal(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-xs font-semibold text-destructive-foreground shadow-md hover:opacity-90"
          >
            <Trash2 className="h-4 w-4" />
            <span>Purge All Workspace Data</span>
          </motion.button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showPurgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-lg font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Confirm Data Purge</span>
                </h3>
                <button
                  onClick={() => setShowPurgeModal(false)}
                  className="rounded-xl p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {purgeSuccess ? (
                <div className="py-6 text-center text-emerald-500 font-semibold text-sm">
                  <Check className="mx-auto h-10 w-10 mb-2" />
                  <p>All forms and responses purged successfully!</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to delete <strong className="text-foreground">all forms, questions, and submitted responses</strong>? This action cannot be undone.
                  </p>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handlePurgeAllData}
                      disabled={purging}
                      className="flex-1 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-destructive-foreground shadow-sm hover:opacity-95 disabled:opacity-50"
                    >
                      {purging ? 'Purging...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      onClick={() => setShowPurgeModal(false)}
                      className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
