"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setContacts(data);
      }
      setLoading(false);
    };

    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この問い合わせを削除しますか？")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      alert("削除に失敗しました");
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow pt-24 px-6 pb-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-center">問い合わせ管理</h1>

        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 bg-white rounded-lg border shadow space-y-2"
              >
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{contact.subject}</p>
                    <p className="text-sm text-gray-500">
                      {contact.name}（{contact.email}）
                    </p>
                    <p className="whitespace-pre-wrap">{contact.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(contact.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDelete(contact.id)}
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