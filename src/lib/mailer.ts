import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST!;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER!;
const pass = process.env.SMTP_PASS!;
const from = process.env.MAIL_FROM || "no-reply@example.com";

if (!host || !user || !pass) {
  // Don’t throw at import time in case you run locally without mail
  console.warn("[mailer] Missing SMTP env; email sending will fail.");
}

export async function sendMail(opts: { to: string; subject: string; html?: string; text?: string }) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
