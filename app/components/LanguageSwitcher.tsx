"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { ChevronDown } from "lucide-react";

type Props = {
  locale: Locale;
};

export default function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // pathname が null の可能性があるため対策（TypeScriptエラー回避）
  const isDisabled =
    !pathname || pathname === "/map" || pathname.startsWith("/stores/");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    setIsLoading(true);

    if (!pathname) return;

    const segments = pathname.split("/");

    // 先頭が空文字なので segments[1] がロケールに相当する
    if (segments.length > 1) {
      segments[1] = newLocale;
    }

    const newPath = segments.join("/") || `/${newLocale}`;

    setTimeout(() => {
      router.push(newPath);
    }, 150);
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/70 pointer-events-none transition-opacity duration-300" />
      )}
      <div className="relative w-[80px] h-[32px]">
        <select
          onChange={handleChange}
          value={locale}
          disabled={isLoading || isDisabled}
          className="w-full h-[32px] text-xs text-gray-800 border border-gray-300 rounded-md pl-2 pr-8 bg-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4B5C9E] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="ja">日本語</option>
          <option value="en">EN</option>
          <option value="zh">中文</option>
          <option value="ko">한국어</option>
        </select>
        <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
          <ChevronDown size={12} className="text-gray-400" />
        </div>
      </div>
    </>
  );
}