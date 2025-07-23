"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function WithdrawalAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("メールアドレスかパスワードが正しくありません。");
      setIsLoading(false);
      return;
    }

    const user = data.user;
    localStorage.setItem("withdrawal_email", email);
    localStorage.setItem("withdrawal_userId", user.id);

    router.push("/withdrawal/survey");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md px-6 py-10 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h1 className="w-full text-center text-zinc-900 text-lg font-semibold tracking-widest">
              退会手続き
            </h1>
            <p className="w-full text-zinc-900 text-sm font-light leading-tight">
              退会手続きに進みます。登録しているメールアドレスとパスワードを入力してください。
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {/* メール */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-light text-zinc-900">
                メールアドレス
              </label>
              <input
                type="email"
                className="w-full p-2 bg-white rounded outline outline-1 outline-offset-[-0.5px] outline-zinc-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error.includes("メール") && (
                <p className="text-rose-700 text-xs">
                  有効なメールアドレスを入力してください
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-light text-zinc-900">
                パスワード
              </label>
              <div className="w-full p-2 bg-white rounded outline outline-1 outline-offset-[-0.5px] outline-zinc-200 flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent focus:outline-none text-base text-zinc-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                <p className="text-rose-700 text-xs">
                  パスワードが一致しません
                </p>
              )}
            </div>
          </div>

          {/* ボタン */}
          <div className="w-full flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-12 min-w-48 px-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <div className="px-1 flex justify-center items-center gap-2.5">
                <span className="text-center text-white text-base font-light">
                  {isLoading ? "確認中..." : "次へ"}
                </span>
                <Image src="/right.svg" alt="矢印" width={12} height={12} />
              </div>
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