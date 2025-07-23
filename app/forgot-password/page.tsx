"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header"; // ← ヘッダー追加（必要に応じてパス修正）

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/send-reset-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error || "メール送信に失敗しました。");
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white"> {/* ← 背景色を白に */}
      <Header /> {/* ← 必要なpropsに変更 */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-[384px] px-4 py-10 bg-white rounded-2xl shadow flex flex-col items-center gap-10">
          {/* タイトルと説明 */}
          <div className="w-full flex flex-col items-center gap-2">
            <h1 className="text-lg font-semibold tracking-widest text-zinc-900">
              パスワード再設定
            </h1>
            <p className="text-sm font-light text-zinc-900 w-full">
              登録済みのメールアドレスにパスワード再設定用のメールを送ります。
            </p>
          </div>

          {/* 入力エリア */}
          <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-zinc-900 font-light">
                メールアドレス
              </label>
              <div
                className={`w-full p-2 rounded outline outline-1 outline-offset-[-0.5px] ${error ? "outline-rose-700" : "outline-zinc-200"
                  }`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="otonavi@example.jp"
                  className="w-full bg-transparent focus:outline-none text-base text-zinc-900"
                />
              </div>
              {error && (
                <p className="text-rose-700 text-xs font-light">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-600 text-xs font-light">
                  メールを送信しました。ご確認ください。
                </p>
              )}
            </div>
          </div>

          {/* ボタン */}
          <div className="w-full">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !email}
              className="w-full h-12 min-w-[192px] px-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <span className="text-white text-base font-light">
                {isLoading ? "送信中..." : "次へ"}
              </span>
            </button>
          </div>

          {/* 戻るリンク */}
          <p
            className="text-sm text-zinc-900 underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            ログイン画面に戻る
          </p>
        </div>
      </main>
    </div>
  );
}