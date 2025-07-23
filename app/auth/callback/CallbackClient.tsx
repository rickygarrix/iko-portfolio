"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CallbackClient() {
  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const searchParams = rawSearchParams ?? new URLSearchParams();
  const mode = (searchParams.get("mode") ?? "login") as "login" | "signup";

  useEffect(() => {
    const handleAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        alert("ログイン情報が取得できませんでした");
        router.push("/login");
        return;
      }

      const userId = user.id;

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116: no rows found
        console.error("プロフィール取得エラー:", error.message);
        alert("サーバーエラーが発生しました");
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      if (mode === "login") {
        if (profile) {
          router.push("/mypage");
        } else {
          alert("このアカウントは存在しません。");
          await supabase.auth.signOut();
          router.push("/login");
        }
      }

      if (mode === "signup") {
        if (profile) {
          alert("すでにアカウントがあります。ログインしてください。");
          await supabase.auth.signOut();
          router.push("/login");
        } else {
          // ✅ 新規登録時：user_profiles を自動作成
          const { error: insertError } = await supabase.from("user_profiles").insert({
            id: userId,
            name: "", // 初期値（必要に応じて onboarding で更新）
          });

          if (insertError) {
            console.error("プロフィール作成失敗:", insertError.message);
            alert("プロフィールの作成に失敗しました");
            await supabase.auth.signOut();
            router.push("/signup");
            return;
          }

          router.push("/onboarding");
        }
      }
    };

    handleAuth();
  }, [router, mode]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-800">ログイン処理中...</p>
    </div>
  );
}