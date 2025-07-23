"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signup" | "login">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));
    setIsLoading(false);

    if (!res.ok) {
      if (data?.error?.includes("登録されています")) {
        setError("このメールアドレスはすでに登録されています");
      } else {
        setError(data?.error || "認証コードの送信に失敗しました");
      }
      return;
    }

    localStorage.setItem("signup_password", password);
    router.push(`/verify-code?email=${encodeURIComponent(email)}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError("ログイン失敗：" + error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-[384px] py-10 bg-white flex flex-col items-center gap-8 rounded-lg">

          {/* タブ */}
          <div className="w-full flex">
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 p-2 border-b ${tab === "signup"
                ? "border-slate-500 border-b-2 text-slate-500 font-semibold"
                : "border-zinc-200 text-zinc-900"
                } text-sm`}
            >
              新規登録
            </button>
            <button
              onClick={() => setTab("login")}
              className={`flex-1 p-2 border-b ${tab === "login"
                ? "border-slate-500 border-b-2 text-slate-500 font-semibold"
                : "border-zinc-200 text-zinc-900"
                } text-sm`}
            >
              ログイン
            </button>
          </div>

          {/* フォーム */}
          <form
            onSubmit={tab === "signup" ? handleSignup : handleLogin}
            className="w-full px-4 flex flex-col gap-8"
          >
            {/* メール */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm text-zinc-900">メールアドレス</label>
              <div
                className={`w-full p-2 rounded outline outline-1 outline-offset-[-0.5px]
                ${error.includes("メール") ? "outline-rose-700" : "outline-zinc-200"}`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-base text-zinc-900 bg-transparent focus:outline-none"
                  required
                />
              </div>
              {error.includes("メール") && (
                <p className="text-xs text-rose-700">
                  有効なメールアドレスを入力してください
                </p>
              )}
            </div>

            {/* パスワード */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm text-zinc-900">パスワード</label>
              {tab === "signup" && (
                <p className="text-xs text-zinc-600">
                  半角英数字を含む8文字以上
                </p>
              )}
              <div
                className={`w-full p-2 rounded outline outline-1 outline-offset-[-0.5px]
                ${error.includes("パスワード") ? "outline-rose-700" : "outline-zinc-200"}
                flex items-center`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-base text-zinc-900 bg-transparent focus:outline-none"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="ml-2"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-zinc-500" />
                  ) : (
                    <Eye size={20} className="text-zinc-500" />
                  )}
                </button>
              </div>
              {error.includes("パスワード") && (
                <p className="text-xs text-rose-700">
                  {tab === "signup"
                    ? "半角英字を含めてください。8文字以上にしてください"
                    : "有効なパスワードを入力してください"}
                </p>
              )}
            </div>

            {/* エラー */}
            {error && !error.includes("メール") && !error.includes("パスワード") && (
              <p className="text-xs text-rose-700">{error}</p>
            )}

            {/* 注意文・リンク */}
            {tab === "signup" ? (
              <p className="text-sm text-zinc-900">
                新規登録の完了をもって、
                <a href="/terms" className="underline text-slate-500">
                  利用規約
                </a>
                および
                <a href="/privacy" className="underline text-slate-500">
                  プライバシーポリシー
                </a>
                に同意したものとみなします。
              </p>
            ) : (
              <div className="text-sm text-zinc-900">
                メールアドレスを忘れた場合は
                <span
                  className="underline text-slate-500 cursor-pointer"
                  onClick={() => router.push("/contact")}
                >
                  こちら
                </span>
                <br />
                パスワードを忘れた場合は
                <span
                  className="underline text-slate-500 cursor-pointer"
                  onClick={() => router.push("/forgot-password")}
                >
                  こちら
                </span>
              </div>
            )}

            {/* ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 text-white text-base"
            >
              {isLoading
                ? "処理中..."
                : tab === "signup"
                  ? "次へ"
                  : "ログイン"}
            </button>
          </form>
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