import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FormRenderer } from '@/components/public/form-renderer';

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
      <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans text-foreground">
        <div className="glass-card max-w-md rounded-3xl p-8 text-center shadow-xl">
          <h2 className="font-display text-2xl font-bold text-foreground">Form Not Accepting Responses</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            This form is currently closed or in draft mode. Please contact the form administrator for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 font-sans text-foreground selection:bg-primary/20">
      <div className="mx-auto max-w-2xl">
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
