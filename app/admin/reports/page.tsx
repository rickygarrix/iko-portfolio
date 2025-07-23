"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Report = {
  id: string;
  type: "post" | "user";
  target_id: string;
  reason: string;
  detail: string | null;
  created_at: string;
  status: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setReports(data);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", id);

    if (error) {
      alert("更新に失敗しました");
    } else {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この通報を削除しますか？")) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);

    if (error) {
      alert("削除に失敗しました");
    } else {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow pt-24 px-6 pb-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-center">通報管理</h1>

        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-white rounded-lg border shadow space-y-2"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      [{report.type === "post" ? "投稿" : "ユーザー"}] {report.target_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      理由: {report.reason} / {report.detail || "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      通報日時:{" "}
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p
                      className={`text-sm ${report.status === "resolved"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      {report.status === "resolved" ? "解決済み" : "未対応"}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {report.status !== "resolved" && (
                      <button
                        onClick={() => handleResolve(report.id)}
                        className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
                      >
                        解決済みにする
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-3 py-1 rounded border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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