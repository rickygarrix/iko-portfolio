import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "メールアドレスは必須です" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("🔥 Supabaseエラー:", error.message);
      return NextResponse.json({ error: "ユーザー確認に失敗しました" }, { status: 500 });
    }

    const exists = data.users.some((user) => user.email === email);

    return NextResponse.json({ exists });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("❌ サーバー例外:", e.message);
    } else {
      console.error("❌ サーバー例外（詳細不明）:", e);
    }
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}