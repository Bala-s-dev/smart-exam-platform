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

export type ExamInput = z.infer<typeof examSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
