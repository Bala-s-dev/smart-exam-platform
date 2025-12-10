import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const examSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters'),
  description: z.string().optional(),
  durationMinutes: z.coerce
    .number()
    .min(5, 'Duration must be at least 5 minutes'),
  passingScore: z.coerce
    .number()
    .min(1)
    .max(100, 'Passing score must be between 1-100%'),
  isPublished: z.boolean().default(false),
  topicIds: z.array(z.string()).min(1, 'Select at least one topic'),
});

const optionSchema = z.object({
  text: z.string().min(1, 'Option text required'),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().min(5, 'Question text must be meaningful'),
  type: z.enum(['MCQ', 'TRUE_FALSE']).default('MCQ'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  explanation: z.string().optional(),
  options: z
    .array(optionSchema)
    .refine((opts) => opts.some((o) => o.isCorrect), {
      message: 'At least one option must be correct',
    }),
});

export const aiGenerateSchema = z.object({
  topic: z.string().min(1),
  count: z.number().min(1).max(20).default(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
