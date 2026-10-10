import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать заглавную букву, строчную букву и цифру'
    ),
  displayName: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Profile Schema
export const profileSchema = z.object({
  displayName: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
  bio: z.string().max(500, 'Описание не должно превышать 500 символов').optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Booking Schema
export const bookingSchema = z.object({
  startDate: z.string().min(1, 'Выберите дату начала'),
  endDate: z.string().min(1, 'Выберите дату окончания'),
  contentBrief: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'Дата начала должна быть раньше даты окончания',
  path: ['endDate'],
});

export type BookingInput = z.infer<typeof bookingSchema>;

// Task Proof Schema
export const taskProofSchema = z.object({
  links: z.array(z.string().url('Неверный формат URL')).optional(),
  screenshots: z.array(z.string()).optional(),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),
});

export type TaskProofInput = z.infer<typeof taskProofSchema>;

// Ad Slot Schema
export const adSlotSchema = z.object({
  platformId: z.string().min(1, 'Выберите платформу'),
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  pricePerDay: z.number().min(1, 'Цена должна быть больше 0'),
  format: z.string().min(1, 'Выберите формат'),
  duration: z.number().min(1, 'Длительность должна быть больше 0'),
});

export type AdSlotInput = z.infer<typeof adSlotSchema>;
