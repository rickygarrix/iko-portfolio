// /app/api/send-code/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "メールアドレスは必須です" }, { status: 400 });
  }

  // ✅ すでにそのメールで登録済みのユーザーがいるかチェック
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("🔥 ユーザー一覧取得エラー:", listError);
    return NextResponse.json({ error: "ユーザー確認に失敗しました" }, { status: 500 });
  }

  const alreadyExists = usersData.users.some((user) => user.email === email);
  if (alreadyExists) {
    return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
  }

  // ✅ 認証コード生成
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // ✅ Supabaseに保存
  const { error: insertError } = await supabaseAdmin.from("auth_codes").insert({
    email,
    code,
    expires_at: expiresAt,
    used: false,
  });

  if (insertError) {
    console.error("🔥 Supabase insert error:", insertError);
    return NextResponse.json({ error: "コード保存に失敗しました" }, { status: 500 });
  }

  // ✅ Resendでメール送信
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Otonavi <noreply@send.otnv.jp>",
      to: [email],
      subject: "【オトナビ】6桁の認証コード",
      html: `
        <p>以下の6桁コードを入力してください：</p>
        <h2>${code}</h2>
        <p>5分以内にご入力ください。</p>
      `,
    }),
  });

  if (!emailRes.ok) {
    const text = await emailRes.text();
    console.error("🔥 メール送信エラー:", text);
    return NextResponse.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ message: "認証コードを送信しました" });
}