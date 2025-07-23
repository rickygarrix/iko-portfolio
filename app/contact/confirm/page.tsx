"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useContactStore } from "@/lib/store/contactStore";

export default function ConfirmPage() {
  const router = useRouter();
  const { general, store, subject, resetContact } = useContactStore();

  const tab = subject === "店舗情報について" ? "store" : "general";
  const data = tab === "store" ? store : general;

  const handleBack = () => {
    router.push("/contact");
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject,
          message: data.message,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("送信失敗");
      }

      resetContact();
      router.push("/contact/thanks");
    } catch (err) {
      console.error(err);
      alert("送信に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-[80px]">
      <div className="max-w-[600px] w-full flex flex-col gap-6">
        <h1 className="text-xl font-semibold tracking-widest text-center text-zinc-900">
          内容確認
        </h1>
        <p className="text-sm text-zinc-900 font-light leading-tight">
          入力した内容に間違いがないかご確認ください。
        </p>

        <div className="flex flex-col gap-4">
          <Item label="お名前" value={data.name} />
          <Item label="メールアドレス" value={data.email} />
          <Item label="種別" value={subject} />
          <Item label="お問い合わせ内容" value={data.message} isMultiline />
        </div>

        <div className="flex flex-col gap-4">
          {/* 書き直すボタン */}
          <button
            onClick={handleBack}
            className="h-12 px-4 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 bg-white text-zinc-900 text-base font-light hover:bg-zinc-50 flex justify-center items-center gap-2"
          >
            <span>書き直す</span>
            <Image
              src="/left.svg"
              alt="戻る"
              width={14}
              height={10}
            />
          </button>

          {/* 送信ボタン */}
          <button
            onClick={handleSubmit}
            className="h-12 px-4 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 bg-zinc-900 text-white text-base font-light hover:bg-zinc-800 flex justify-center items-center gap-2"
          >
            <span>送信</span>
            <Image
              src="/contact/contact.svg"
              alt="送信アイコン"
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  isMultiline = false,
}: {
  label: string;
  value: string;
  isMultiline?: boolean;
}) {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="flex gap-[2px] text-sm font-light">
        {label}
        <span className="text-rose-700">*</span>
      </label>
      <div
        className={`w-full p-2 bg-neutral-50 rounded outline outline-1 outline-offset-[-0.5px] outline-zinc-200 ${isMultiline ? "h-96" : ""
          }`}
      >
        <p
          className={`text-zinc-900 text-base font-light ${isMultiline ? "whitespace-pre-wrap" : ""
            }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}