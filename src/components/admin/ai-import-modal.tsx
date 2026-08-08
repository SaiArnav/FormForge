'use client';

import React, { useRef, useState } from 'react';
import { X, Upload, Sparkles, FileText, Check, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ACCEPTED_EXTENSIONS = '.txt,.md,.csv,.tsv,.json,.log,.pdf,.docx,.xlsx,.pptx,.yml,.yaml,.xml,.html';

interface AiImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (formId: string) => void;
}

type Status = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export function AiImportModal({ open, onClose, onImported }: AiImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('IDLE');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [createdFormId, setCreatedFormId] = useState<string | null>(null);
  const [usedProvider, setUsedProvider] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setFile(null);
    setStatus('IDLE');
    setError('');
    setUsedProvider(null);
    setUsedModel(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelected = (selected: File | null) => {
    if (!selected) return;
    const ext = '.' + (selected.name.split('.').pop() || '').toLowerCase();
    const accepted = ACCEPTED_EXTENSIONS.split(',').map((e) => e.toLowerCase());
    if (!accepted.includes(ext)) {
      setError(`Unsupported file type "${ext}". Supported: ${ACCEPTED_EXTENSIONS}`);
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus('LOADING');
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/ai/import', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Import failed. Please try again.');
        setStatus('ERROR');
        return;
      }
      setStatus('SUCCESS');
      setCreatedFormId(json.form.id);
      setUsedProvider(json.provider || 'gemini');
      setUsedModel(json.model || (json.provider === 'groq' ? 'groq' : 'gemini'));
      onImported(json.form.id);
    } catch {
      setError('Network error while importing. Please try again.');
      setStatus('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md space-y-5 rounded-3xl border border-white/10 p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-md shadow-brand-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">AI Import Form</h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Gemini + Groq fallback extracts questions → builds a form
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'SUCCESS' ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 animate-scale-in">
              <Check className="h-7 w-7" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">Form created!</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              AI imported <span className="font-semibold text-foreground">{file?.name}</span> and built
              your form in draft. Review it in the builder, then publish to get the share link.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-[11px] font-mono font-semibold text-brand-300">
              <Sparkles className="h-3 w-3" />
              Generated with {usedModel || (usedProvider === 'groq' ? 'Groq' : 'Gemini')}
            </p>
            <div className="mt-5 flex gap-2">
              {createdFormId && (
                <Link
                  href={`/admin/forms/${createdFormId}/edit`}
                  className="flex-1 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open in Builder
                </Link>
              )}
              <button
                onClick={handleClose}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Done
              </button>
            </div>
          </div>
        ) : status === 'ERROR' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-xs leading-relaxed text-destructive">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus('IDLE')}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/25"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* File Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileSelected(e.dataTransfer.files?.[0] || null);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? 'border-brand-400 bg-brand-400/10'
                  : file
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border bg-card/40 hover:border-brand-400/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
              />
              {file ? (
                <>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground break-all">{file.name}</p>
                  <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB · click to change
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400/15 text-brand-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Drop your questions file here
                  </p>
                  <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                    or click to browse · TXT, PDF, DOCX, XLSX, CSV, MD
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-[11px] leading-relaxed text-destructive">{error}</p>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || status === 'LOADING'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'LOADING' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Form with AI</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
