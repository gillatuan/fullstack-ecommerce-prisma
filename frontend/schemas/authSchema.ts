// src/schemas/authSchema.ts
import { z } from "zod"

export const signUpFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
})

// Optional: Export TypeScript types
export type SignUpFormSchemaType = z.infer<typeof signUpFormSchema>

export const loginFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must be at most 20 characters" })
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "Password must contain at least one number",
    })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    }),
})

// Optional: Export TypeScript types
export type LoginFormSchemaType = z.infer<typeof loginFormSchema>
