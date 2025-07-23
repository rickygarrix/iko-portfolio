"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WithdrawalCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージのクリア
    localStorage.removeItem("withdrawal_userId");
    localStorage.removeItem("withdrawal_email");

    // セッション削除（403が出ても握りつぶす）
    supabase.auth.signOut().catch((e) => {
      console.warn("退会済みのため signOut はスキップ:", e);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start px-4 pt-12">
        <div className="w-full max-w-[384px] space-y-6 py-6 text-zinc-900">
          <h1 className="text-center text-lg font-semibold tracking-widest leading-relaxed">
            退会完了
          </h1>
          <p className="text-center text-sm font-light leading-tight">
            退会手続が完了しました。ご利用誠にありがとうございました。
          </p>
          <div className="w-full flex justify-center pt-2">
            <button
              onClick={() => router.push("/")}
              className="w-full h-12 min-w-[192px] bg-zinc-900 rounded-lg text-white text-base font-light hover:opacity-90 transition"
            >
              トップへ
            </button>
          </div>
        </div>
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