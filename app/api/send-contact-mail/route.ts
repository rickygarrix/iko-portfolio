import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, subject, message } = body;

  if (!email || !name || !message) {
    return NextResponse.json(
      { error: "必須項目が不足しています" },
      { status: 400 }
    );
  }

  try {
    await resend.emails.send({
      from: "Otonavi <noreply@send.otnv.jp>",
      to: email,
      subject: subject || "お問い合わせを受け付けました",
      html: `
        <p>${name} 様</p>
        <p>お問い合わせいただきありがとうございます。</p>
        <p>以下の内容で受け付けました：</p>
        <hr/>
        <p><strong>お名前：</strong> ${name}</p>
        <p><strong>メール：</strong> ${email}</p>
        <p><strong>件名：</strong> ${subject || "(なし)"}</p>
        <p><strong>内容：</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p>内容を確認の上、必要に応じて担当者よりご連絡いたします。</p>
        <p>―― Otonavi 運営チーム</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("Resend送信エラー:", e);
    return NextResponse.json(
      { error: "メール送信に失敗しました" },
      { status: 500 }
    );
  }
}