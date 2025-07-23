"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header"; // ✅ 追加

export default function ChangePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("すべての項目を入力してください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      return;
    }
    if (newPassword.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }

    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push("/settings");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header /> {/* ✅ ヘッダー追加 */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-[384px] px-4 py-10 bg-white rounded-2xl shadow flex flex-col items-center gap-10">
          {/* タイトル */}
          <div className="w-full flex flex-col items-center gap-2">
            <h1 className="text-lg font-semibold tracking-widest text-zinc-900">
              パスワード変更
            </h1>
            <p className="text-sm font-light text-zinc-900 w-full">
              新しいパスワードを入力してください。
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
            />
            <PasswordInput
              label="新しいパスワード（確認）"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
            />
            {error && <p className="text-rose-700 text-xs font-light">{error}</p>}
          </div>

          {/* ボタン */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full h-12 min-w-[192px] px-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <span className="text-white text-base font-light">
                {isLoading ? "変更中..." : "変更する"}
              </span>
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="w-full h-12 min-w-[192px] px-4 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-200 flex justify-center items-center gap-2 hover:opacity-80"
            >
              <span className="text-zinc-700 text-base font-light">キャンセル</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ✅ 共通のパスワード入力
const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="text-sm text-zinc-900 font-light">{label}</label>
      <div className="w-full p-2 rounded outline outline-1 outline-offset-[-0.5px] outline-zinc-200 flex items-center">
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