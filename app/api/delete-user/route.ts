import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response("ユーザーIDが指定されていません", { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("❌ Supabaseユーザー削除エラー:", error.message);
      return new Response("ユーザー削除失敗", { status: 500 });
    }

    return new Response("削除完了", { status: 200 });
  } catch (err) {
    console.error("❌ 予期せぬエラー:", err);
    return new Response("サーバーエラー", { status: 500 });
  }
}