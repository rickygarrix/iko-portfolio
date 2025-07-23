"use client";

import Link from "next/link";
import Image from "next/image";
import type { Messages } from "@/types/messages";

type Props = {
  locale: "ja" | "en" | "zh" | "ko";
  messages: Messages["footer"];
};

export default function Footer({ locale, messages }: Props) {
  return (
    <footer className="w-full bg-[#1F1F21] border-t border-b border-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] px-4 py-8 flex flex-col justify-start items-center gap-4">
        {/* ロゴ */}
        <Link href={`/${locale}`} passHref>
          <div className="w-32 h-10 relative">
            <Image
              src="/footer/logo4.svg"
              alt="オトナビ ロゴ"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* ナビリンク */}
        <div className="w-full flex justify-center items-start flex-wrap gap-2">
          <Link href={`/${locale}/search`} className="px-4 py-2">
            <div className="text-white text-sm font-light leading-tight">
              {messages.search}
            </div>
          </Link>

          {/* ← 修正ここ */}
          <Link href={`/map`} className="px-4 py-2">
            <div className="text-white text-sm font-light leading-tight">
              {messages.map}
            </div>
          </Link>

          <Link href={`/contact`} className="px-4 py-2">
            <div className="text-white text-sm font-light leading-tight">
              {messages.contact}
            </div>
          </Link>
        </div>

        {/* 利用規約・プライバシーポリシー */}
        <div className="w-full flex justify-center items-start flex-wrap gap-2">
          <Link href="/terms" className="px-4 py-2">
            <div className="text-white text-xs font-light leading-none">
              {messages.terms}
            </div>
          </Link>
          <Link href="/privacy" className="px-4 py-2">
            <div className="text-white text-xs font-light leading-none">
              {messages.privacy}
            </div>
          </Link>
        </div>

        {/* コピーライト */}
        <div className="text-white text-xs font-light leading-none">
          {messages.copyright}
        </div>
      </div>
    </footer>
  );
}