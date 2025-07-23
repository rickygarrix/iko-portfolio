"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function OnboardingComplete() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex flex-col items-center justify-start flex-1 px-4 pt-24">
        <h1 className="text-zinc-900 text-lg font-semibold tracking-widest text-center mb-6">
          ユーザー情報 保存完了
        </h1>

        <p className="text-zinc-900 text-sm font-light text-center leading-relaxed mb-10">
          ユーザー情報を保存しました。<br />
          さあ、オトナビと一緒に音楽を楽しみましょう！
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full max-w-xs h-12 px-4 bg-zinc-900 rounded-lg text-white text-base font-light hover:opacity-90"
        >
          トップへ
        </button>
      </main>
    </div>
  );
}