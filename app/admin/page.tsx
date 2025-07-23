"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ADMIN_EMAIL = "chloerickyb@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/not-found"); // 認証失敗は404に飛ばす
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return null; // 認証チェック中は何も表示しない
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow pt-24 px-6 pb-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-center">管理画面トップ</h1>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminCard
            href="/admin/stores"
            title="店舗管理"
            description="店舗の承認・非公開・削除を行います"
          />
          <AdminCard
            href="/admin/users"
            title="ユーザー管理"
            description="ユーザーの編集・BAN・削除を行います"
          />
          <AdminCard
            href="/admin/posts"
            title="投稿管理"
            description="投稿の非表示・削除を行います"
          />
          <AdminCard
            href="/admin/reports"
            title="通報管理"
            description="通報された投稿やユーザーの確認・対応"
          />
          <AdminCard
            href="/admin/contacts"
            title="問い合わせ管理"
            description="問い合わせ内容を確認・対応します"
          />
          <AdminCard
            href="/admin/surveys"
            title="アンケート確認"
            description="ユーザー登録時・退会時のアンケート確認"
          />
          <AdminCard
            href="/admin/master"
            title="ジャンル・エリア管理"
            description="ジャンル・エリア・支払い方法の編集"
          />
          <AdminCard
            href="/admin/logs"
            title="行動ログ確認"
            description="操作履歴の確認（必要に応じて）"
          />
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

function AdminCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg hover:scale-[1.02] transition-all space-y-2 cursor-pointer">
        <p className="text-lg font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}