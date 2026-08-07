import { NextResponse } from 'next/server';
import { getAuthSession, checkRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { QuestionType } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.csv', '.tsv', '.json', '.log', '.yml', '.yaml', '.xml', '.html']);

const VALID_TYPES: QuestionType[] = [
  'SHORT_ANSWER',
  'PARAGRAPH',
  'EMAIL',
  'PHONE',
  'NUMBER',
  'DATE',
  'TIME',
  'DROPDOWN',
  'MULTIPLE_CHOICE',
  'CHECKBOXES',
  'RATING',
  'FILE_UPLOAD',
  'IMAGE_UPLOAD',
];

const CHOICE_TYPES: QuestionType[] = ['DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOXES'];

interface ParsedQuestion {
  title: string;
  type: QuestionType;
  description?: string;
  required: boolean;
  options?: string[];
}

const PROMPT = `You are a form builder assistant. Read the attached document and extract every question from it.

For each question, return an object with:
- "title": the question text (clean and human-readable)
- "type": one of SHORT_ANSWER, PARAGRAPH, EMAIL, PHONE, NUMBER, DATE, TIME, DROPDOWN, MULTIPLE_CHOICE, CHECKBOXES, RATING, FILE_UPLOAD, IMAGE_UPLOAD. Choose the best match based on the question content. Use MULTIPLE_CHOICE for single-select choice questions, CHECKBOXES for multi-select ones.
- "description": optional help text if present, else omit
- "required": true/false if the source indicates it, default false
- "options": array of choice strings, ONLY when type is DROPDOWN, MULTIPLE_CHOICE, or CHECKBOXES

Rules:
- Do not include document headings, instructions, or unrelated prose as questions.
- Preserve the order of questions.
- If the document contains a title/heading for the whole form, set the top-level "title" and "description" fields; otherwise use "Untitled Form".
- Strip answer keys / correct-answer markers from question text.

Respond with ONLY a single valid JSON object shaped like:
{"title": "...", "description": "...", "questions": [{"title": "...", "type": "MULTIPLE_CHOICE", "description": "...", "required": false, "options": ["A", "B"]}]}`;

function extractJson(text: string): { title?: string; description?: string; questions: unknown } {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in AI response');
  return JSON.parse(candidate.slice(start, end + 1));
}

function sanitizeQuestions(raw: unknown): ParsedQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (q): q is Record<string, unknown> =>
        !!q && typeof q === 'object' && typeof (q as Record<string, unknown>).title === 'string'
    )
    .slice(0, 50)
    .map((q) => {
      const qType = q.type;
      const type = VALID_TYPES.includes(qType as QuestionType) ? (qType as QuestionType) : 'SHORT_ANSWER';
      const qOptions = Array.isArray(q.options) ? q.options : [];
      const options = qOptions
        .map((o) => (typeof o === 'string' ? o : (o as Record<string, unknown>)?.value))
        .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
        .slice(0, 50);
      return {
        title: String(q.title).trim().slice(0, 500),
        type,
        description: typeof q.description === 'string' ? q.description.trim().slice(0, 500) : undefined,
        required: Boolean(q.required),
        options: CHOICE_TYPES.includes(type) && options.length > 0 ? options : undefined,
      };
    });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured. Add it to your .env file.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const extWithDot = `.${extension}`;

    let parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }>;
    if (TEXT_EXTENSIONS.has(extWithDot)) {
      parts = [{ text: `${PROMPT}\n\nDocument filename: ${file.name}\n\n${buffer.toString('utf-8')}` }];
    } else {
      parts = [
        { text: `${PROMPT}\n\nDocument filename: ${file.name}` },
        { inline_data: { mime_type: file.type || 'application/octet-stream', data: buffer.toString('base64') } },
      ];
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return NextResponse.json(
        { error: `AI provider error (${geminiRes.status}). Check your GEMINI_API_KEY.` },
        { status: 502 }
      );
    }

    const geminiJson = await geminiRes.json();
    const aiText =
      geminiJson?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text)
        .filter(Boolean)
        .join('') || '';
    if (!aiText.trim()) {
      return NextResponse.json({ error: 'AI returned an empty response' }, { status: 502 });
    }

    const parsed = extractJson(aiText);
    const questions = sanitizeQuestions(parsed.questions);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions could be extracted from the file.' },
        { status: 422 }
      );
    }

    const title = (typeof parsed.title === 'string' && parsed.title.trim()
      ? parsed.title.trim()
      : file.name.replace(/\.[^.]+$/, '')).slice(0, 200);

    const newForm = await db.form.create({
      data: {
        title,
        description: typeof parsed.description === 'string' ? parsed.description.trim().slice(0, 2000) : null,
        status: 'DRAFT',
        createdBy: session.userId,
        questions: {
          create: questions.map((q, idx) => ({
            type: q.type,
            title: q.title,
            description: q.description ?? null,
            required: q.required,
            order: idx,
            options: q.options
              ? {
                  create: q.options.map((opt, optIdx) => ({ value: opt, order: optIdx })),
                }
              : undefined,
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return NextResponse.json({ form: newForm, questionCount: questions.length }, { status: 201 });
  } catch (error) {
    console.error('AI import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import form from file' },
      { status: 500 }
    );
  }
}
