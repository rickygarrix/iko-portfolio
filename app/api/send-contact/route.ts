import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import { ContactEmail } from "@/emails/ContactEmail";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 🔥 1. DBに保存
  const { error: dbError } = await supabase.from("contacts").insert({
    name,
    email,
    subject,
    message,
  });

  if (dbError) {
    console.error("DB error:", dbError);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }

  // 🔥 2. メール送信（Resend）
  try {
    await resend.emails.send({
      from: "Otonavi <info@otonavi.com>",
      to: ["chloerickyb@gmail.com"], // ← 自分の管理メール
      subject: `【お問い合わせ】${subject}`,
      react: ContactEmail({ name, email, subject, message }),
    });
  } catch (mailError) {
    console.error("Mail error:", mailError);
    return NextResponse.json({ error: "Mail Error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}