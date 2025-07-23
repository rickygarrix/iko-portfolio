"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ URLハッシュからトークンを取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const access = hashParams.get("access_token");
      const refresh = hashParams.get("refresh_token");
      if (access && refresh) {
        setAccessToken(access);
        setRefreshToken(refresh);
        supabase.auth.setSession({ access_token: access, refresh_token: refresh }).catch(() => {
          setError("リンクが無効か期限切れの可能性があります。");
        });
      } else {
        setError("無効なリセットリンクです。");
      }
    }
  }, []);

  const handleReset = async () => {
    setError("");

    if (!accessToken || !refreshToken) {
      setError("認証情報が不足しています。");
      return;
    }

    if (newPassword.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }

    if (
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setError("英字と数字を含めてください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("確認用パスワードが一致しません。");
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsLoading(false);

    if (updateError) {
      setError("パスワードの更新に失敗しました: " + updateError.message);
      return;
    }

    router.push("/reset-password/complete");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-[384px] px-4 py-10 bg-white rounded-2xl shadow flex flex-col items-center gap-10">
          {/* タイトル */}
          <div className="w-full flex flex-col items-center gap-2">
            <h1 className="text-lg font-semibold tracking-widest text-zinc-900">パスワード再設定</h1>
            <p className="text-sm font-light text-zinc-900 w-full">
              新しいパスワードを設定してください。
            </p>
          </div>

          {/* 入力 */}
          <div className="w-full flex flex-col gap-8">
            <PasswordInput
              label="新しいパスワード"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              setShow={setShowNew}
              hint="半角英数字と記号を含む8文字以上"
              error={error.includes("英字") || error.includes("数字") || error.includes("8")}
            />
            <PasswordInput
              label="新しいパスワード（確認用）"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
              hint="確認のため、もう一度パスワードを入力してください"
              error={error.includes("一致")}
            />
            {error && <p className="text-rose-700 text-xs font-light">{error}</p>}
          </div>

          {/* ボタン */}
          <div className="w-full">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full h-12 min-w-[192px] px-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <span className="text-white text-base font-light">
                {isLoading ? "更新中..." : "次へ"}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ✅ 共通パスワード入力コンポーネント
const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  setShow,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  hint: string;
  error: boolean;
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="text-sm text-zinc-900 font-light">{label}</label>
      <span className="text-xs text-zinc-600 font-light">{hint}</span>
      <div
        className={`w-full p-2 rounded outline outline-1 outline-offset-[-0.5px] ${error ? "outline-rose-700" : "outline-zinc-200"
          } flex items-center`}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊"
          className="w-full bg-transparent focus:outline-none text-base text-zinc-900"
        />
        <button
          type="button"
          onMouseDown={() => setShow(true)}
          onMouseUp={() => setShow(false)}
          onMouseLeave={() => setShow(false)}
          className="ml-2"
        >
          {show ? (
            <EyeOff size={20} className="text-zinc-500" />
          ) : (
            <Eye size={20} className="text-zinc-500" />
          )}
        </button>
      </div>
    </div>
  );
};