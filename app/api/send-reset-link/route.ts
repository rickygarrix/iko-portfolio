import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "メールアドレスが必要です。" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("リンク生成エラー:", error);
      return NextResponse.json({ error: "リセットリンクの生成に失敗しました。" }, { status: 500 });
    }

    const actionLink = data.properties.action_link;

    await resend.emails.send({
      from: "noreply@send.otnv.jp",
      to: email,
      subject: "【オトナビ】パスワード再設定リンク",
      html: `
        <p>パスワード再設定のリクエストを受け付けました。</p>
        <p>以下のリンクから新しいパスワードを設定してください：</p>
        <p><a href="${actionLink}">${actionLink}</a></p>
        <p>このリンクは60分間有効です。</p>
        <p>心当たりがない場合はこのメールを無視してください。</p>
      `,
    });

    return NextResponse.json({ message: "送信成功" }, { status: 200 });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json({ error: "メール送信に失敗しました。" }, { status: 500 });
  }
}