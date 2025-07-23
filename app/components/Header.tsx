"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Overlay from "@/components/Overlay";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "chloerickyb@gmail.com";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [showOverlay, setShowOverlay] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ ユーザー情報取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setUserId(user?.id ?? null);
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    };
    fetchUser();
  }, []);

  // ✅ 外クリックでメニュー閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleHomeClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleMapClick = useCallback(async () => {
    sessionStorage.removeItem("mapCenter");
    sessionStorage.removeItem("mapZoom");
    sessionStorage.removeItem("activeStoreId");
    sessionStorage.removeItem("cardScrollLeft");

    const targetPath = "/map";
    if (pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowOverlay(true);
      await router.push(targetPath);
      setShowOverlay(false);
    }
  }, [pathname, router]);

  return (
    <>
      {showOverlay && <Overlay />}
      <header className="fixed top-0 left-0 h-[48px] z-[1000] w-full bg-white shadow flex justify-center">
        <div className="w-full max-w-[600px] px-4 h-[48px] flex justify-between items-center relative">
          {/* ロゴ（logo4に統一） */}
          <div
            onClick={handleHomeClick}
            className="w-28 h-8 relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src="/header/logo4.svg"
              alt="オトナビ ロゴ"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-4">
            {/* タイムライン */}
            <Link href="/posts" className="w-6 h-6 relative hover:scale-105 active:scale-95">
              <Image src="/header/timeline.svg" alt="timeline" fill className="object-contain" />
            </Link>

            {/* リスト検索 */}
            <Link href="/search" className="w-6 h-6 relative hover:scale-105 active:scale-95">
              <Image src="/header/search.svg" alt="search" fill className="object-contain" />
            </Link>

            {/* 地図 */}
            <button
              onClick={handleMapClick}
              className="w-6 h-6 relative hover:scale-105 active:scale-95"
            >
              <Image src="/header/pin.svg" alt="map" fill className="object-contain" />
            </button>

            {/* ハンバーガーメニューとドロップダウン */}
            <div className="relative">
              <button
                className="w-6 h-6 relative hover:scale-105 active:scale-95"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <Image
                  src="/header/menu.svg"
                  alt="menu"
                  fill
                  className="object-contain translate-y-[4px]"
                />
              </button>

              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow z-50"
                >
                  {/* Adminリンク（管理者のみ表示） */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm font-bold text-red-600 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  {/* ログイン済みユーザー用メニュー */}
                  {userId && (
                    <Link
                      href="/mypage"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      マイページ
                    </Link>
                  )}

                  {/* お問い合わせ共通リンク */}
                  <Link
                    href="/contact"
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    お問い合わせ
                  </Link>

                  {/* ログイン/ログアウトリンク */}
                  {userId ? (
                    <Link
                      href="/logout"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ログアウト
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ログイン
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}