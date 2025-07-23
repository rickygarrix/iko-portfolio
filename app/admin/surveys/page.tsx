"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Survey = {
  id: string;
  user_id: string | null;
  type: string; // "onboarding" | "withdrawal" など
  answers: string;
  created_at: string;
};

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      const { data, error } = await supabase
        .from("user_survey_answers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setSurveys(data);
      }
      setLoading(false);
    };

    fetchSurveys();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("このアンケートを削除しますか？")) return;
    const { error } = await supabase
      .from("user_survey_answers")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除に失敗しました");
    } else {
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow pt-24 px-6 pb-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-center">アンケート管理</h1>

        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="p-4 bg-white rounded-lg border shadow space-y-2"
              >
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      種別: {survey.type === "onboarding" ? "登録時" : "退会時"}
                    </p>
                    <p className="text-sm text-gray-500">
                      ユーザーID: {survey.user_id ?? "未ログイン"}
                    </p>
                    <p className="whitespace-pre-wrap">{survey.answers}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(survey.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDelete(survey.id)}
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