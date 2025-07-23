"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 即トップへ遷移
    router.push("/");

    // サインアウト処理は非同期で裏側でやる
    supabase.auth.signOut().catch((err) => {
      console.error("❌ ログアウトエラー:", err);
    });
  }, [router]);

  return null;
}