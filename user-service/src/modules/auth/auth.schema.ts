import { z } from "zod";

const emailSchema = z.email({ error: "Please enter a valid email." }).trim();

const passwordSchema = z
  .string()
  .min(8, { error: "Must be at least 8 characters long." })
  .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
  .regex(/[0-9]/, { error: "Contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Contain at least one special character.",
  })
  .trim();

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { error: "Please enter your first name." })
      .trim(),
    lastName: z
      .string()
      .min(2, { error: "Please enter your last name." })
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { error: "Password is required." })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

const verifySchema = z.object({
  otp: z.string().length(6, { error: "Invalid OTP." }),
});

export type VerifyInput = {
  otpSessionId: string;
  otp: string;
};

export const AuthSchema = {
  registerSchema,
  verifySchema,
};
