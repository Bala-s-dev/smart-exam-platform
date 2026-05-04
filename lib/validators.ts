import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const examSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters').max(200),
  description: z.string().max(2000).optional(),
  durationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes').max(300),
  passingScore: z.coerce.number().min(1).max(100, 'Passing score must be between 1-100%'),
  isPublished: z.boolean().default(false),
  topicIds: z.array(z.string()).min(1, 'Select at least one topic'),
});

const optionSchema = z.object({
  text: z.string().min(1, 'Option text required').max(500),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().min(5, 'Question text must be meaningful').max(2000),
  type: z.enum(['MCQ', 'TRUE_FALSE']).default('MCQ'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  explanation: z.string().max(1000).optional(),
  options: z
    .array(optionSchema)
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options allowed')
    .refine((opts) => opts.some((o) => o.isCorrect), {
      message: 'At least one option must be correct',
    }),
});

export const aiGenerateSchema = z.object({
  topic: z.string().min(1).max(200),
  syllabus: z.string().max(2000).optional(),
  count: z.number().min(1).max(20).default(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
