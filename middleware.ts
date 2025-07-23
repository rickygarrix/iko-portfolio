import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

const LOCALES = ["ja", "en", "zh", "ko"] as const;
const DEFAULT_LOCALE = "ja";

// ✅ 言語判定
function detectLocale(req: NextRequest): string {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  return matchLocale(languages, LOCALES, DEFAULT_LOCALE);
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ✅ 静的リソース等は除外
  const publicPaths = [
    "/_next",
    "/api",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/opengraph-image",
    "/twitter-image",
  ];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ✅ Supabaseのrecoveryリンク: /auth/callback → /reset-password に変換（access_tokenはquery）
  if (
    pathname === "/auth/callback" &&
    searchParams.get("type") === "recovery" &&
    searchParams.get("access_token")
  ) {
    const token = searchParams.get("access_token")!;
    const url = request.nextUrl.clone();
    url.pathname = "/reset-password";
    url.search = `?token=${token}`;
    return NextResponse.redirect(url);
  }

  // ✅ ルート（/）アクセス時 → 言語付きにリダイレクト
  if (pathname === "/") {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // ✅ /search を強制的に /ja/search に
  if (pathname === "/search") {
    const url = request.nextUrl.clone();
    url.pathname = `/ja/search`;
    return NextResponse.redirect(url);
  }

  // ✅ /verify-code には email パラメータが必要
  if (pathname.startsWith("/verify-code") && !searchParams.get("email")) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    return NextResponse.redirect(url);
  }

  // ✅ ↓ これ削除！ハッシュにはmiddlewareからアクセスできない
  // if (
  //   (pathname.startsWith("/reset-password") || pathname.startsWith("/set-password")) &&
  //   !searchParams.get("token") &&
  //   !searchParams.get("access_token")
  // ) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  // ✅ 通常の処理へ
  return NextResponse.next();
}

// ✅ 適用パスの設定
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};