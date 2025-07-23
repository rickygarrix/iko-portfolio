"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContactStore } from "@/lib/store/contactStore";
import Image from "next/image";

export default function ContactPage() {
  const router = useRouter();
  const {
    general,
    store,
    setContact,
    setSubject,
  } = useContactStore();

  const [tab, setTab] = useState<"general" | "store">("general");

  const current = tab === "general" ? general : store;

  const [email, setEmail] = useState(current.email);
  const [name, setName] = useState(current.name);
  const [message, setMessage] = useState(current.message);
  const [error, setError] = useState("");

  useEffect(() => {
    const target = tab === "general" ? general : store;
    setEmail(target.email);
    setName(target.name);
    if (tab === "store" && !target.message) {
      setMessage(
        `◆ 店舗名：\n◆ 公式サイト：\n◆ Instagram：\n◆ 営業時間：\n◆ 住所：\n◆ 電話番号：\n◆ その他：`
      );
    } else {
      setMessage(target.message);
    }
  }, [tab, general, store]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError("お名前とメールアドレスは必須です。");
      return;
    }

    setError("");
    setContact(tab, { email, name, message });
    setSubject(tab === "general" ? "一般お問い合わせ" : "店舗情報について");
    router.push("/contact/confirm");
  };

  const presetMessage = `◆ 店舗名：\n◆ 公式サイト：\n◆ Instagram：\n◆ 営業時間：\n◆ 住所：\n◆ 電話番号：\n◆ その他：`;

  return (
    <div className="min-h-screen bg-white pt-[80px] px-4 pb-10">
      <div className="max-w-[600px] mx-auto flex flex-col gap-5">
        <h1 className="text-xl font-semibold tracking-widest text-center text-zinc-900">
          お問い合わせ
        </h1>
        <p className="text-sm text-zinc-900 font-light leading-tight text-center">
          オトナビについてのご質問や店舗情報に関するご相談など、<br />
          お気軽にお問い合わせください。3営業日以内にメールにてお返事いたします。
        </p>

        {/* タブ */}
        <div className="flex w-full">
          {["general", "store"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as "general" | "store")}
              className={`flex-1 p-2 ${tab === t
                ? "border-b-2 border-slate-500 font-semibold text-slate-500"
                : "border-b border-zinc-200 font-light text-zinc-900"
                }`}
            >
              {t === "general" ? "一般" : "店舗情報"}
            </button>
          ))}
        </div>

        {/* フォーム */}
        <form onSubmit={handleConfirm} className="w-full flex flex-col gap-4">
          {error && (
            <div className="text-rose-700 text-sm font-semibold">{error}</div>
          )}

          {/* 名前 */}
          <div className="w-full flex flex-col gap-1">
            <label className="flex gap-1 text-sm font-medium text-zinc-800">
              お名前 <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-zinc-200 rounded text-zinc-800"
              placeholder="田中一郎"
              required
            />
          </div>

          {/* メール */}
          <div className="w-full flex flex-col gap-1">
            <label className="flex gap-1 text-sm font-medium text-zinc-800">
              メールアドレス <span className="text-rose-700">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-zinc-200 rounded text-zinc-800"
              placeholder="otonavi@example.jp"
              required
            />
          </div>

          {/* お問い合わせ内容 */}
          <div className="w-full flex flex-col gap-1">
            <div>
              <label className="flex gap-1 text-sm font-medium text-zinc-800">
                お問い合わせ内容 <span className="text-rose-700">*</span>
              </label>
              <p className="text-zinc-600 text-xs">概要をご記入ください。</p>
            </div>
            <textarea
              rows={tab === "store" ? 10 : 6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                tab === "store"
                  ? presetMessage
                  : "お問い合わせ内容を入力してください"
              }
              className="w-full p-2 border border-zinc-200 rounded h-96 text-zinc-800 placeholder:text-zinc-600"
              required
            />
          </div>

          {/* ボタン */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full h-12 px-4 bg-zinc-900 rounded-lg text-white text-base font-light hover:bg-zinc-800 flex justify-center items-center gap-2"
            >
              <span className="text-center leading-normal">内容確認</span>
              <Image
                src="/right.svg"
                alt="右矢印"
                width={14}
                height={10}
                className="ml-1"
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}