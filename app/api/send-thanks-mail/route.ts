// app/api/send-thanks-mail/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "有効なメールアドレスが必要です" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Otonavi <noreply@otonavi.com>", // 👈 形式推奨
      to: email,
      subject: "ご利用ありがとうございました",
      html: `
        <p>この度は「オトナビ」をご利用いただきありがとうございました。</p>
        <p>またのご利用を心よりお待ちしております。</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("メール送信失敗", err);
    return NextResponse.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }
}