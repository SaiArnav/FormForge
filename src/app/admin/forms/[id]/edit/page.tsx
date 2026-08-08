import { FormBuilder } from '@/components/forms/form-builder';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditFormPage({
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

  const formattedQuestions = form.questions.map((q) => {
    let validationObj;
    if (q.validation) {
      try {
        validationObj = JSON.parse(q.validation);
      } catch {}
    }
    return {
      id: q.id,
      formId: q.formId,
      type: q.type,
      title: q.title,
      description: q.description || undefined,
      required: q.required,
      order: q.order,
      validation: validationObj,
      options: q.options.map((o) => ({
        id: o.id,
        value: o.value,
        order: o.order,
        kind: o.kind,
      })),
    };
  });

  return (
    <FormBuilder
      initialForm={{
        id: form.id,
        title: form.title,
        description: form.description || '',
        status: form.status,
        acceptingResponses: form.acceptingResponses,
        questions: formattedQuestions,
      }}
    />
  );
}
