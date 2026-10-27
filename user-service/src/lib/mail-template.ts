type VerificationMail = {
  otp: string;
  expiresIn: number;
};

export function verificationEmail({ otp, expiresIn }: VerificationMail) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;padding:32px;color:#111827;">
      <h2 style="font-size:20px;margin:0 0 32px;">Gorkha Express</h2>

      <h1 style="font-size:24px;margin:0 0 16px;">Verify your email</h1>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;">
        Use the verification code below to verify your email address.
      </p>

      <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin:28px 0;">
        <span style="font-size:32px;font-weight:700;letter-spacing:6px;">
          ${otp}
        </span>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;">
        This code expires in ${expiresIn} minutes. If you didn't request this,
        you can safely ignore this email.
      </p>

      <hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0 20px;">

      <p style="font-size:12px;color:#9ca3af;">
        &copy; Gorkha Express
      </p>
    </div>
  `;
}

export function accountCreatedEmail(): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;padding:32px;color:#111827;">
      <h2 style="font-size:20px;margin:0 0 32px;">Gorkha Express</h2>

      <div style="width:48px;height:48px;background:#ecfdf5;border-radius:50%;text-align:center;line-height:48px;margin-bottom:24px;">
        <span style="color:#059669;font-size:24px;">&#10003;</span>
      </div>

      <h1 style="font-size:24px;margin:0 0 16px;">Account created successfully!</h1>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;">
        Your email has been verified and your Gorkha Express
        account has been created successfully.
      </p>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;">
        Welcome aboard! You're all set to get started.
      </p>

      <hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0 20px;">

      <p style="font-size:12px;color:#9ca3af;">
        &copy; Gorkha Express
      </p>
    </div>
  `;
}

export const EmailTemplate = {
  verificationEmail,
  accountCreatedEmail
}