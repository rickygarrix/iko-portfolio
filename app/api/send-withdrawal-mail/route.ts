// app/api/send-withdrawal-mail/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json(
      { error: "メールアドレスと名前が必要です" },
      { status: 400 }
    );
  }

  try {
    await resend.emails.send({
      from: "Otonavi <noreply@otonavi.com>",
      to: email,
      subject: "退会手続きが完了しました",
      html: `
        <div>
          <p>${name} 様</p>
          <p>Otonaviをご利用いただきありがとうございました。</p>
          <p>退会手続きが完了しました。</p>
          <p>またのご利用をお待ちしております。</p>
          <p style="font-size:12px; color:gray;">※このメールは送信専用です</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ メール送信エラー:", err);
    return NextResponse.json(
      { success: false, message: "メール送信に失敗しました" },
      { status: 500 }
    );
  }
}