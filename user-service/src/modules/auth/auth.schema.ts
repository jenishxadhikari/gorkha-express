import { z } from "zod";

const emailSchema = z.email({ error: "Please enter a valid email." }).trim();

const passwordSchema = z
  .string()
  .trim()
  .min(8, { error: "Must be at least 8 characters long." })
  .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
  .regex(/[0-9]/, { error: "Contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Contain at least one special character.",
  });

const registerSchema = z
  .object({
    firstName: z
      .string()
      .nonempty({ error: "Please enter your full name." })
      .trim(),
    lastName: z
      .string()
      .nonempty({ error: "Please enter your full name." })
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(1, { error: "Password is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

const verifySchema = z.object({
  otp: z.string().length(6, { error: "Valid otp is required." }),
});

export type VerifyInput = {
  otp: string;
  otpSessionId: string;
};

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1, { error: "Password is required." }),
});

export type LoginInput = {
  email: string
  password: string
  deviceId: string
}

export type RefreshInput = {
  refreshToken: string
  deviceId: string
}

export const AuthSchema = {
  registerSchema,
  verifySchema,
  loginSchema,
};
