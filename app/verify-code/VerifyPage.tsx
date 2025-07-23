"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header"; // ← ここを追加

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pwd = localStorage.getItem("signup_password");
    if (pwd) {
      setPassword(pwd);
    } else {
      alert("パスワードが見つかりません。もう一度登録してください。");
      router.push("/auth");
    }
  }, [router]);

  const handleVerify = async () => {
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });

    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data?.error || "認証に失敗しました");
      return;
    }

    router.push(`/onboarding?email=${encodeURIComponent(email)}`);
  };

  const handleResend = async () => {
    const res = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data?.error || "再送信に失敗しました");
    } else {
      alert("認証コードを再送信しました。");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-[48px]"> {/* ← Header分のpadding追加 */}
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[384px] px-4 py-10 bg-white flex flex-col items-center gap-10 rounded-xl">

          {/* タイトル */}
          <div className="text-lg font-semibold text-zinc-900 tracking-widest">
            認証コード
          </div>

          {/* 説明 */}
          <p className="text-sm text-zinc-900 leading-relaxed">
            確認メールを送信しました。認証コードを入力してください。
            メールが届かない場合、迷惑メールフォルダをご確認いただくか、
            <span
              onClick={handleResend}
              className="underline text-slate-500 cursor-pointer"
            >
              再送信
            </span>
            をお試しください。
          </p>

          {/* 入力フォーム */}
          <div className="w-full flex flex-col gap-1">
            <label className="text-sm text-zinc-900">認証コード</label>
            <div
              className={`w-full p-2 rounded outline outline-1 outline-offset-[-0.5px]
              ${error ? "outline-rose-700" : "outline-zinc-200"}`}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-base text-zinc-900 bg-transparent focus:outline-none tracking-[0.3em]"
                placeholder="123456"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-700">
                {error}
              </p>
            )}
          </div>

          {/* ボタン */}
          <button
            onClick={handleVerify}
            disabled={isLoading || code.length !== 6}
            className={`w-full h-12 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 text-white text-base
            ${code.length === 6 ? "opacity-100" : "opacity-50"}`}
          >
            {isLoading ? "認証中..." : "次へ"}
          </button>
        </div>
      </main>
    </div>
  );
}