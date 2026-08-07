'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Star,
  AlertCircle,
  Send,
  Lock,
} from 'lucide-react';
import { Reveal } from '@/components/anim/reveal';

interface FormRendererProps {
  form: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    acceptingResponses: boolean;
    questions: any[];
  };
  isPreview?: boolean;
}

export function FormRenderer({ form, isPreview = false }: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[questionId];
        return newErr;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    form.questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.id] = 'This field is required';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      alert('This is a preview mode. Submissions are disabled in preview.');
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    const durationSec = Math.round((Date.now() - startTime) / 1000);

    const fileIds: string[] = [];
    Object.entries(answers).forEach(([qId, val]) => {
      if (val && typeof val === 'object' && val._fileId) {
        fileIds.push(val._fileId);
      }
    });

    try {
      const res = await fetch(`/api/public/forms/${form.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          completionTimeSeconds: durationSec,
          fileIds,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const json = await res.json();
        alert(json.error || 'Submission failed');
      }
    } catch (e) {
      console.error('Submission error:', e);
      alert('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card rounded-3xl border-t-4 border-t-emerald-500 p-8 text-center shadow-xl animate-scale-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 animate-fade-in">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Response Submitted!</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Thank you for completing &quot;{form.title}&quot;. Your response has been securely recorded.
        </p>
        <button
          onClick={() => {
            setAnswers({});
            setSubmitted(false);
          }}
          className="mt-6 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  const fieldClass =
    'w-full rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 font-sans text-xs text-foreground outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header Card */}
      <div className="glass-card rounded-3xl border-t-4 border-t-brand-400 p-6 shadow-sm md:p-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>FormForge Respondent Gateway</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-500">
            <Lock className="h-3 w-3" /> Anonymous & Secure
          </span>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">
          {form.title}
        </h1>
        {form.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {form.description}
          </p>
        )}
      </div>

      {/* Questions Field Cards */}
      <div className="space-y-4">
        {form.questions.map((q, idx) => {
          const hasError = Boolean(errors[q.id]);
          return (
            <Reveal
              key={q.id || idx}
              delay={idx * 60}
              distance={16}
              className={`glass-card rounded-2xl p-6 shadow-xs transition-all ${
                hasError ? 'border-destructive/60 bg-destructive/5' : ''
              }`}
            >
              <div className="mb-3">
                <label className="font-display flex items-center gap-1 text-sm font-bold text-foreground">
                  <span>{q.title}</span>
                  {q.required && <span className="text-destructive">*</span>}
                </label>
                {q.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{q.description}</p>
                )}
              </div>

              {/* Field Input Renderers by Question Type */}
              <div className="mt-2">
                {q.type === 'SHORT_ANSWER' && (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="Your answer..."
                    className={fieldClass}
                  />
                )}

                {q.type === 'PARAGRAPH' && (
                  <textarea
                    rows={3}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="Your detailed response..."
                    className={`${fieldClass} resize-none`}
                  />
                )}

                {q.type === 'EMAIL' && (
                  <input
                    type="email"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="name@organization.com"
                    className={fieldClass}
                  />
                )}

                {q.type === 'PHONE' && (
                  <input
                    type="tel"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={fieldClass}
                  />
                )}

                {q.type === 'NUMBER' && (
                  <input
                    type="number"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="0"
                    className={fieldClass}
                  />
                )}

                {q.type === 'DATE' && (
                  <input
                    type="date"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    className={fieldClass}
                  />
                )}

                {q.type === 'TIME' && (
                  <input
                    type="time"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    className={fieldClass}
                  />
                )}

                {q.type === 'DROPDOWN' && (
                  <select
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2.5 font-sans text-xs text-foreground outline-none transition-all focus:border-brand-400"
                  >
                    <option value="">Select an option...</option>
                    {(q.options || []).map((opt: any, optIdx: number) => (
                      <option key={optIdx} value={opt.value}>
                        {opt.value}
                      </option>
                    ))}
                  </select>
                )}

                {q.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    {(q.options || []).map((opt: any, optIdx: number) => (
                      <label
                        key={optIdx}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-xs text-foreground transition-colors hover:bg-muted/40"
                      >
                        <input
                          type="radio"
                          name={`radio-${q.id}`}
                          value={opt.value}
                          checked={answers[q.id] === opt.value}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="h-4 w-4 border-border accent-brand-400"
                        />
                        <span>{opt.value}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'CHECKBOXES' && (
                  <div className="space-y-2">
                    {(q.options || []).map((opt: any, optIdx: number) => {
                      const currentVals: string[] = Array.isArray(answers[q.id])
                        ? answers[q.id]
                        : [];
                      const isChecked = currentVals.includes(opt.value);

                      const toggleCheckbox = () => {
                        let nextVals;
                        if (isChecked) {
                          nextVals = currentVals.filter((v) => v !== opt.value);
                        } else {
                          nextVals = [...currentVals, opt.value];
                        }
                        handleInputChange(q.id, nextVals);
                      };

                      return (
                        <label
                          key={optIdx}
                          className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-xs text-foreground transition-colors hover:bg-muted/40"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={toggleCheckbox}
                            className="h-4 w-4 rounded border-border accent-brand-400"
                          />
                          <span>{opt.value}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === 'RATING' && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = Number(answers[q.id]) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange(q.id, star)}
                          className="p-1 text-muted-foreground transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              active ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {(q.type === 'FILE_UPLOAD' || q.type === 'IMAGE_UPLOAD') && (
                  <label
                    htmlFor={`file-upload-${q.id}`}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/40 p-6 text-center transition-colors hover:border-brand-400/50"
                  >
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground/60" />
                    <p className="text-xs font-semibold text-foreground">
                      {answers[q.id]?._filename
                        ? `Uploaded: ${answers[q.id]._filename}`
                        : `Click to upload ${q.type === 'IMAGE_UPLOAD' ? 'image' : 'file'}`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                    <input
                      id={`file-upload-${q.id}`}
                      type="file"
                      disabled={uploadingFiles[q.id]}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setUploadingFiles((prev) => ({ ...prev, [q.id]: true }));
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('sessionId', sessionId);

                          const res = await fetch('/api/public/upload', {
                            method: 'POST',
                            body: formData,
                          });

                          if (res.ok) {
                            const data = await res.json();
                            handleInputChange(q.id, { _fileId: data.id, _filename: data.filename });
                            e.target.value = '';
                          } else {
                            const err = await res.json();
                            alert(err.error || 'Upload failed');
                          }
                        } catch {
                          alert('Upload failed. Please try again.');
                        } finally {
                          setUploadingFiles((prev) => ({ ...prev, [q.id]: false }));
                        }
                      }}
                      className="sr-only"
                    />
                    {uploadingFiles[q.id] && (
                      <div className="mt-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
                    )}
                    {answers[q.id]?._fileId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange(q.id, null);
                          const input = document.getElementById(`file-upload-${q.id}`) as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        className="mt-2 text-xs text-destructive hover:underline"
                      >
                        Remove file
                      </button>
                    )}
                  </label>
                )}
              </div>

              {hasError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-destructive animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors[q.id]}</span>
                </div>
              )}
            </Reveal>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        disabled={submitting}
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 py-3.5 font-sans text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Submit Response</span>
          </>
        )}
      </button>
    </form>
  );
}
