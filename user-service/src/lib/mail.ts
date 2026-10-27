import { Resend } from "resend";

import { env } from "../config/env.js";
import { HttpErrors } from "./error.js";

const resend = new Resend(env.RESEND_API_KEY);

type SendMail = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: SendMail) {
  const { error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });

  if(error){
    throw new HttpErrors.InternalServerError(error.message);
  }
}
