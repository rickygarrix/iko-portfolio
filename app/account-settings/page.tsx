"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ 追加
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AccountSettingsPage() {
  const router = useRouter(); // ✅ 追加

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordChange = async () => {
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("すべての項目を入力してください。");
    }

    if (newPassword !== confirmPassword) {
      return setError("新しいパスワードが一致しません。");
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      return setError("ユーザー情報の取得に失敗しました。再度ログインしてください。");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return setError("現在のパスワードが正しくありません。");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return setError("パスワードの変更に失敗しました：" + updateError.message);
    }

    setMessage("パスワードを変更しました。次回ログイン時から有効です。");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded shadow-md max-w-md w-full space-y-6">
          <h1 className="text-xl font-bold text-center">パスワード変更</h1>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <div className="space-y-2">
            <label className="block font-semibold">現在のパスワード</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label className="block font-semibold">新しいパスワード</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className="block font-semibold">確認用パスワード</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              onClick={handlePasswordChange}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              パスワードを変更
            </button>

            {/* ✅ 戻るボタン追加 */}
            <button
              onClick={() => router.back()}
              className="w-full text-blue-600 underline text-sm mt-4"
            >
              ← マイページに戻る
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