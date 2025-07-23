"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");

  useEffect(() => {
    const hash = window.location.hash;
    const accessToken = new URLSearchParams(hash.replace("#", "")).get("access_token");

    if (!accessToken) {
      setStatus("error");
      return;
    }

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "", // Magic Link は refresh_token 不要
    }).then(({ error }) => {
      if (error) {
        console.error("セッション設定エラー:", error.message);
        setStatus("error");
      } else {
        setStatus("success");
        router.push("/set-password/form"); // 任意のページへ遷移
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 text-center">
        {status === "loading" && <p>ログイン処理中です...</p>}
        {status === "error" && <p className="text-red-500">ログインに失敗しました。リンクが無効です。</p>}
      </main>
      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}