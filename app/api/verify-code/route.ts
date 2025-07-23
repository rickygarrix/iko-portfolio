import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: "メールと認証コードは必須です" },
      { status: 400 }
    );
  }

  // 認証コードの検証
  const now = new Date().toISOString();
  const { data: authCode, error } = await supabase
    .from("auth_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gte("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("DBエラー:", error);
    return NextResponse.json(
      { error: "データベースエラーが発生しました" },
      { status: 500 }
    );
  }

  if (!authCode) {
    return NextResponse.json(
      { error: "無効なコード、または期限切れです" },
      { status: 400 }
    );
  }

  // 認証コードを使用済みにする
  const { error: updateError } = await supabase
    .from("auth_codes")
    .update({ used: true })
    .eq("id", authCode.id);

  if (updateError) {
    console.error("認証コード使用済み更新エラー:", updateError);
    return NextResponse.json(
      { error: "認証コードの更新に失敗しました" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "認証成功" });
}