/**
 * Authentication Validation Schemas
 * Story 1.2: Authentication System - Core
 *
 * Zod schemas for input validation on all authentication endpoints.
 * Provides both client and server-side validation.
 */

import { z } from 'zod';
import {
  validatePasswordStrength,
} from './password';

/**
 * Base email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim();

/**
 * Password schema with minimum length requirement
 */
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long');

/**
 * Name validation schema
 */
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').trim().optional();

/**
 * Login form validation
 * - Email: required, valid format
 * - Password: required, no length check (existing users may have shorter passwords)
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form validation
 * - Email: required, valid format
 * - Password: required, min 12 chars, entropy check
 * - Name: optional but must be valid if provided
 * - ConfirmPassword: must match password
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema.refine(
      (pwd) => {
        const result = validatePasswordStrength(pwd, 40);
        return result.valid;
      },
      {
        message:
          'Password is too weak. Use a mix of letters, numbers, and symbols.',
      }
    ),
    name: nameSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Password validation for new passwords (e.g., password change)
 * Same rules as registration
 */
export const newPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema.refine(
      (pwd) => {
        const result = validatePasswordStrength(pwd, 40);
        return result.valid;
      },
      {
        message:
          'Password is too weak. Use a mix of letters, numbers, and symbols.',
      }
    ),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

/**
 * Auth response types (for API consistency)
 */
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    role: z.enum(['SUPERADMIN', 'ADMIN', 'USER', 'READONLY', 'API']),
  }),
  sessionToken: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/**
 * Error response schema
 */
export const authErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export type AuthError = z.infer<typeof authErrorSchema>;
