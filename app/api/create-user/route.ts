import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Server-side 用の Supabase クライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      name,
      avatar_url,
      gender,
      birth_year,
      prefecture,
      city,
      occupation,
    } = await req.json();

    // 必須チェック
    if (
      !email || !password || !name || !avatar_url ||
      !gender || !birth_year || !prefecture || !city || !occupation
    ) {
      return NextResponse.json({ error: "全ての項目は必須です" }, { status: 400 });
    }

    // 認証ユーザー作成
    const { data: userData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    console.log("✅ ユーザー作成:", userData, authError);

    if (authError || !userData?.user?.id) {
      return NextResponse.json(
        { error: "ユーザー作成に失敗しました: " + authError?.message },
        { status: 500 }
      );
    }

    const userId = userData.user.id;

    // プロフィール作成
    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        id: userId,
        name,
        avatar_url,
      },
    ]);

    if (profileError) {
      console.error("🔥 Profile Insert Error:", profileError);
      return NextResponse.json({ error: "プロフィール作成に失敗しました" }, { status: 500 });
    }

    // アンケート作成
    const { error: surveyError } = await supabase.from("user_survey_answers").insert([
      {
        user_id: userId,
        gender,
        birth_year,
        prefecture,
        city,
        occupation,
      },
    ]);

    if (surveyError) {
      console.error("🔥 Survey Insert Error:", surveyError);
      return NextResponse.json({ error: "アンケート保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ message: "ユーザー登録が完了しました" }, { status: 200 });

  } catch (e) {
    console.error("❌ サーバー例外エラー:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}