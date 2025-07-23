// lib/mailer.ts
import nodemailer from "nodemailer";


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: `"Otonavi" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};