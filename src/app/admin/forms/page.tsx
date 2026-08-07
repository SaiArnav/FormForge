'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  QrCode as QrIcon,
  Check,
  Copy,
  Globe,
  Lock,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { StatusChip } from '@/components/admin/data-table';
import QRCode from 'qrcode';

export default function FormsListPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrImageData, setQrImageData] = useState<string | null>(null);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/admin/forms');
      if (res.ok) {
        const json = await res.json();
        setForms(json.forms || []);
      }
    } catch (e) {
      console.error('Failed to fetch forms:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenQR = async (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}`;
    setQrModalUrl(url);
    try {
      const qrData = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      setQrImageData(qrData);
    } catch (e) {
      console.error('Failed to generate QR code:', e);
    }
  };

  const handleTogglePublish = async (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/forms/${formId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchForms();
      }
    } catch (e) {
      console.error('Failed to toggle publish status:', e);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form and all its responses?')) return;
    try {
      const res = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchForms();
      }
    } catch (e) {
      console.error('Failed to delete form:', e);
    }
  };

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Forms Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, configure, and publish dynamic forms for your respondents.
          </p>
        </div>

        <Link href="/admin/forms/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Form</span>
          </motion.button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative flex w-full max-w-md items-center rounded-xl border border-border bg-muted/40 px-3.5 py-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms by title or description..."
            className="w-full bg-transparent text-xs font-sans text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <p className="text-xs font-mono text-muted-foreground hidden sm:block">
          Total Forms: <span className="font-bold text-foreground">{forms.length}</span>
        </p>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground">No forms found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {search ? 'Try adjusting your search query.' : 'Get started by building your first dynamic form.'}
          </p>
          {!search && (
            <Link href="/admin/forms/new" className="mt-4">
              <button className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Create First Form
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form, idx) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="glass-card flex flex-col justify-between rounded-2xl p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <StatusChip status={form.status} />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {new Date(form.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground line-clamp-1">
                  {form.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                  {form.description || 'No description provided.'}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs font-mono text-muted-foreground border-t border-border/60 pt-3">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>{form._count?.responses || 0} responses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{form._count?.questions || 0} fields</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 pt-2">
                <Link href={`/admin/forms/${form.id}/edit`} className="flex-1">
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </Link>

                <button
                  onClick={() => handleCopyLink(form.id)}
                  title="Copy Public Link"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  {copiedId === form.id ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => handleOpenQR(form.id)}
                  title="Generate QR Code"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  <QrIcon className="h-4 w-4" />
                </button>

                <a
                  href={`/forms/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Live Form"
                >
                  <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </a>

                <button
                  onClick={() => handleDeleteForm(form.id)}
                  title="Delete Form"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Code Dialog Modal */}
      <AnimatePresence>
        {qrModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center"
            >
              <h3 className="font-display text-lg font-bold text-foreground">Form QR Code</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan to open public form link directly on mobile devices.
              </p>

              {qrImageData && (
                <div className="my-5 flex justify-center p-3 bg-white rounded-2xl border border-border">
                  <img src={qrImageData} alt="Form QR Code" className="h-48 w-48 object-contain" />
                </div>
              )}

              <p className="text-[11px] font-mono text-muted-foreground truncate mb-4">
                {qrModalUrl}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrModalUrl);
                    alert('Copied URL to clipboard!');
                  }}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setQrModalUrl(null)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
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
