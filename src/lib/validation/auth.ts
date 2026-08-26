import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(1024),
});

export const initialAdminSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(1024),
    passwordConfirmation: z.string(),
  })
  .refine((input) => input.password === input.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export const updateEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  currentPassword: z.string().min(1, "Enter your current password.").max(1024),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password.").max(1024),
    newPassword: z.string().min(12, "Use at least 12 characters.").max(1024),
    passwordConfirmation: z.string(),
  })
  .refine((input) => input.newPassword === input.passwordConfirmation, {
    message: "New passwords do not match.",
    path: ["passwordConfirmation"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type InitialAdminInput = z.infer<typeof initialAdminSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
