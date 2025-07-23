import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!
  );

  try {
    const {
      userId,
      usageFrequency,
      reasons,
      improvement,
      preservePosts,
    } = await req.json();

    if (!userId || !usageFrequency || !reasons || !improvement) {
      return Response.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // ① アンケート保存
    const { error: surveyError } = await supabase
      .from("withdrawal_surveys")
      .insert({
        user_id: userId,
        usage_frequency: usageFrequency,
        reasons: Array.isArray(reasons) ? reasons : [reasons],
        improvement,
        preserve_posts: preservePosts ?? true,
      });

    if (surveyError) {
      console.error("❌ アンケート保存エラー:", surveyError);
      return Response.json({ error: "アンケートの保存に失敗しました" }, { status: 500 });
    }

    // ② 投稿を非アクティブ化
    const { error: postUpdateError } = await supabase
      .from("posts")
      .update({ is_active: false })
      .eq("user_id", userId);

    if (postUpdateError) {
      console.error("❌ 投稿の非アクティブ化エラー:", postUpdateError);
      return Response.json({ error: "投稿の非アクティブ化に失敗しました" }, { status: 500 });
    }

    // ③ user_profilesを削除
    const { error: profileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("❌ プロフィール削除エラー:", profileError);
      return Response.json({ error: "プロフィール削除に失敗しました" }, { status: 500 });
    }

    // ④ Supabase Authユーザーを削除
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("❌ 認証ユーザー削除エラー:", authError);
      return Response.json({ error: "認証ユーザー削除に失敗しました" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ サーバーエラー:", err);
    return Response.json({ error: "サーバーエラー" }, { status: 500 });
  }
}