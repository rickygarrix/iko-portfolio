"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StoreRegisterThanksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-zinc-900 text-center mb-6">
          店舗情報のご登録ありがとうございます！
        </h1>
        <p className="text-center text-zinc-600 mb-8">
          ご入力いただいた内容を確認後、掲載の可否をご連絡いたします。
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-zinc-900 text-white rounded px-6 py-3 hover:bg-zinc-700 transition"
        >
          ホームに戻る
        </button>
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