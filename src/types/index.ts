export type Role = 'OWNER' | 'EDITOR' | 'VIEWER';
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type QuestionType =
  | 'SHORT_ANSWER'
  | 'PARAGRAPH'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'DATE'
  | 'TIME'
  | 'DROPDOWN'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'RATING'
  | 'FILE_UPLOAD'
  | 'IMAGE_UPLOAD';

export interface QuestionValidation {
  regex?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  customErrorMsg?: string;
}

export interface QuestionOptionDTO {
  id?: string;
  value: string;
  order: number;
}

export interface QuestionDTO {
  id?: string;
  formId?: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: QuestionValidation;
  options?: QuestionOptionDTO[];
}

export interface FormDTO {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  acceptingResponses: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questions?: QuestionDTO[];
  _count?: {
    responses: number;
    questions: number;
  };
}

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLogin?: string | null;
}

export interface ResponseAnswerDTO {
  id?: string;
  questionId: string;
  questionTitle?: string;
  questionType?: QuestionType;
  value: string;
}

export interface UploadedFileDTO {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface FormResponseDTO {
  id: string;
  formId: string;
  formTitle?: string;
  submittedAt: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    completionTimeSeconds?: number;
  };
  answers: ResponseAnswerDTO[];
  files: UploadedFileDTO[];
}

export interface AnalyticsSummary {
  totalForms: number;
  totalResponses: number;
  avgCompletionTime: number; // in seconds
  completionRate: number; // percentage 0-100
  recentActivity: Array<{
    id: string;
    formId: string;
    formTitle: string;
    submittedAt: string;
    completionTimeSeconds: number;
    status: 'COMPLETED' | 'IN_PROGRESS';
    respondentInitials: string;
  }>;
  submissionTrends: Array<{
    date: string;
    count: number;
  }>;
  responsesByRoleOrCategory: Array<{
    category: string;
    count: number;
  }>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}
