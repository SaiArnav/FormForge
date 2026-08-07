'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Eye,
  Save,
  CheckCircle,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Star,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { QuestionDTO, QuestionType, FormStatus } from '@/types';
import { FormRenderer } from '@/components/public/form-renderer';

const QUESTION_TYPE_OPTIONS: Array<{ label: string; type: QuestionType; icon: any }> = [
  { label: 'Short Answer', type: 'SHORT_ANSWER', icon: Type },
  { label: 'Paragraph', type: 'PARAGRAPH', icon: AlignLeft },
  { label: 'Email Address', type: 'EMAIL', icon: Mail },
  { label: 'Phone Number', type: 'PHONE', icon: Phone },
  { label: 'Number', type: 'NUMBER', icon: Hash },
  { label: 'Date', type: 'DATE', icon: Calendar },
  { label: 'Time', type: 'TIME', icon: Clock },
  { label: 'Dropdown', type: 'DROPDOWN', icon: ChevronDown },
  { label: 'Multiple Choice', type: 'MULTIPLE_CHOICE', icon: CircleDot },
  { label: 'Checkboxes', type: 'CHECKBOXES', icon: CheckSquare },
  { label: 'Rating (1-5)', type: 'RATING', icon: Star },
  { label: 'File Upload', type: 'FILE_UPLOAD', icon: Upload },
  { label: 'Image Upload', type: 'IMAGE_UPLOAD', icon: ImageIcon },
];

interface FormBuilderProps {
  initialForm?: {
    id: string;
    title: string;
    description?: string;
    status: FormStatus;
    acceptingResponses: boolean;
    questions?: QuestionDTO[];
  };
  isNew?: boolean;
}

export function FormBuilder({ initialForm, isNew = false }: FormBuilderProps) {
  const [formId, setFormId] = useState<string | null>(initialForm?.id || null);
  const [title, setTitle] = useState(initialForm?.title || 'Untitled Form');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [status, setStatus] = useState<FormStatus>(initialForm?.status || 'DRAFT');
  const [questions, setQuestions] = useState<QuestionDTO[]>(
    initialForm?.questions || [
      {
        id: 'q-1',
        type: 'SHORT_ANSWER',
        title: 'Untitled Question',
        required: false,
        order: 0,
        options: [],
      },
    ]
  );

  const [activeTab, setActiveTab] = useState<'BUILD' | 'PREVIEW'>('BUILD');
  const [savingStatus, setSavingStatus] = useState<'SAVED' | 'SAVING' | 'DIRTY'>('SAVED');
  const [showTypePicker, setShowTypePicker] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Autosave simulation & triggers
  useEffect(() => {
    if (savingStatus === 'DIRTY' && formId) {
      const timer = setTimeout(() => {
        saveForm();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [questions, title, description, savingStatus, formId]);

  const markDirty = () => {
    setSavingStatus('DIRTY');
  };

  const saveForm = async () => {
    setSavingStatus('SAVING');
    try {
      if (isNew && !formId) {
        // Create new form via POST
        const res = await fetch('/api/admin/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const json = await res.json();
        if (json.form) {
          setFormId(json.form.id);
          window.history.replaceState(null, '', `/admin/forms/${json.form.id}/edit`);
        }
      } else if (formId) {
        // Update existing form via PUT
        await fetch(`/api/admin/forms/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, status, questions }),
        });
      }
      setSavingStatus('SAVED');
    } catch (e) {
      console.error('Failed to save form:', e);
      setSavingStatus('DIRTY');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item.order.toString()) === active.id);
        const newIndex = items.findIndex((item) => (item.id || item.order.toString()) === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex).map((q, idx) => ({ ...q, order: idx }));
        return newItems;
      });
      markDirty();
    }
  };

  const addQuestion = (type: QuestionType = 'SHORT_ANSWER') => {
    const newQ: QuestionDTO = {
      id: `q-${Date.now()}`,
      type,
      title: 'Untitled Question',
      required: false,
      order: questions.length,
      options:
        type === 'MULTIPLE_CHOICE' || type === 'CHECKBOXES' || type === 'DROPDOWN'
          ? [
              { value: 'Option 1', order: 0 },
              { value: 'Option 2', order: 1 },
            ]
          : [],
    };
    setQuestions([...questions, newQ]);
    markDirty();
  };

  const updateQuestion = (index: number, updatedFields: Partial<QuestionDTO>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updatedFields };
    setQuestions(newQs);
    markDirty();
  };

  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const newQs = questions.filter((_, i) => i !== index).map((q, idx) => ({ ...q, order: idx }));
    setQuestions(newQs);
    markDirty();
  };

  const duplicateQuestion = (index: number) => {
    const target = questions[index];
    const dup: QuestionDTO = {
      ...target,
      id: `q-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: index + 1,
    };
    const newQs = [...questions];
    newQs.splice(index + 1, 0, dup);
    setQuestions(newQs.map((q, idx) => ({ ...q, order: idx })));
    markDirty();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Controls Bar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/admin/forms">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h2 className="font-display text-base font-bold text-foreground line-clamp-1">{title}</h2>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle
                  className={`h-3 w-3 ${
                    savingStatus === 'SAVED' ? 'text-emerald-500' : 'text-amber-500 animate-spin'
                  }`}
                />
                <span>{savingStatus === 'SAVED' ? 'Autosaved' : 'Saving changes...'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher & Publish toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
            <button
              onClick={() => setActiveTab('BUILD')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'BUILD'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Form Builder
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'PREVIEW'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            onClick={() => {
              const nextStatus = status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
              setStatus(nextStatus);
              markDirty();
            }}
            className={`rounded-xl px-4 py-2 text-xs font-semibold font-mono tracking-tight transition-all ${
              status === 'PUBLISHED'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}
          >
            {status === 'PUBLISHED' ? 'STATUS: PUBLISHED' : 'STATUS: DRAFT'}
          </button>

          <button
            onClick={saveForm}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {activeTab === 'PREVIEW' ? (
        <div className="mx-auto max-w-2xl">
          <div className="glass-card mb-4 rounded-2xl p-4 text-center text-xs font-mono text-muted-foreground">
            👉 Live Preview Mode — Interactive demonstration of what respondents will see.
          </div>
          <FormRenderer
            form={{
              id: formId || 'preview',
              title,
              description,
              status: 'PUBLISHED',
              acceptingResponses: true,
              questions,
            }}
            isPreview={true}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Header Card (Title & Description) */}
          <div className="glass-card rounded-3xl p-6 md:p-8 shadow-sm border-t-4 border-t-primary">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              placeholder="Form Title"
              className="w-full bg-transparent font-display text-2xl font-extrabold text-foreground placeholder:text-muted-foreground/50 outline-none md:text-3xl"
            />
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
              placeholder="Form description or instructions for respondents..."
              rows={2}
              className="mt-3 w-full resize-none bg-transparent font-sans text-sm text-muted-foreground placeholder:text-muted-foreground/40 outline-none"
            />
          </div>

          {/* DND Context for Reordering Question Cards */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={questions.map((q, i) => q.id || i.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <SortableQuestionCard
                    key={q.id || idx}
                    id={q.id || idx.toString()}
                    question={q}
                    index={idx}
                    onUpdate={(fields) => updateQuestion(idx, fields)}
                    onDelete={() => deleteQuestion(idx)}
                    onDuplicate={() => duplicateQuestion(idx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Floating Add Question Bar */}
          <div className="sticky bottom-6 z-20 flex items-center justify-center gap-2">
            <button
              onClick={() => addQuestion('SHORT_ANSWER')}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 px-5 py-3 font-sans text-xs font-semibold text-white shadow-xl shadow-brand-500/25 transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SortableQuestionCardProps {
  id: string;
  question: QuestionDTO;
  index: number;
  onUpdate: (fields: Partial<QuestionDTO>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableQuestionCard({
  id,
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
}: SortableQuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentTypeObj =
    QUESTION_TYPE_OPTIONS.find((t) => t.type === question.type) || QUESTION_TYPE_OPTIONS[0];
  const TypeIcon = currentTypeObj.icon;

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOptions = [
      ...currentOptions,
      { value: `Option ${currentOptions.length + 1}`, order: currentOptions.length },
    ];
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (optIndex: number, val: string) => {
    const currentOptions = [...(question.options || [])];
    currentOptions[optIndex] = { ...currentOptions[optIndex], value: val };
    onUpdate({ options: currentOptions });
  };

  const handleDeleteOption = (optIndex: number) => {
    const currentOptions = (question.options || []).filter((_, i) => i !== optIndex);
    onUpdate({ options: currentOptions });
  };

  return (
    <div ref={setNodeRef} style={style} className="glass-card rounded-2xl p-6 shadow-xs">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 space-y-4">
          {/* Question Title & Type Select Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Question title"
              className="flex-1 rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2 font-sans text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            {/* Type Picker Dropdown */}
            <div className="relative">
              <select
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
                className="appearance-none rounded-xl border border-border bg-card py-2 pl-9 pr-8 font-sans text-xs font-semibold text-foreground outline-none focus:border-primary"
              >
                {QUESTION_TYPE_OPTIONS.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
              <TypeIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Description Input */}
          <input
            type="text"
            value={question.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Help text or instructions for this question (optional)..."
            className="w-full rounded-xl border border-border/50 bg-muted/20 px-3.5 py-1.5 text-xs text-muted-foreground outline-none focus:border-primary"
          />

          {/* Type-Specific Options Editor */}
          {(question.type === 'MULTIPLE_CHOICE' ||
            question.type === 'CHECKBOXES' ||
            question.type === 'DROPDOWN') && (
            <div className="space-y-2 pl-2 pt-1">
              {(question.options || []).map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                    className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-1 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleDeleteOption(optIdx)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Option</span>
              </button>
            </div>
          )}

          {/* Bottom Card Controls */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Required Question</span>
            </label>

            <div className="flex items-center gap-1">
              <button
                onClick={onDuplicate}
                title="Duplicate Question"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                title="Delete Question"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
