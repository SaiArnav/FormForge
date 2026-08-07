import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FormRenderer } from '@/components/public/form-renderer';
import { FloatingBackground } from '@/components/anim/floating-background';

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form = await db.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!form) {
    notFound();
  }

  if (form.status !== 'PUBLISHED' || !form.acceptingResponses) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 font-sans text-foreground">
        <FloatingBackground />
        <div className="glass-card max-w-md rounded-3xl border border-white/10 p-8 text-center shadow-2xl shadow-black/30">
          <h2 className="font-display text-2xl font-bold text-foreground">Form Not Accepting Responses</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            This form is currently closed or in draft mode. Please contact the form administrator for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 font-sans text-foreground selection:bg-brand-400/20">
      <FloatingBackground />
      <div className="relative z-10 mx-auto max-w-2xl">
        <FormRenderer
          form={{
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            acceptingResponses: form.acceptingResponses,
            questions: form.questions.map((q) => ({
              id: q.id,
              type: q.type,
              title: q.title,
              description: q.description,
              required: q.required,
              options: q.options,
            })),
          }}
        />
      </div>
    </div>
  );
}
