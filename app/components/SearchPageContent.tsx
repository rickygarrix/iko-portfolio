"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchResults from "@/components/SearchResults";
import SearchFloatingButton from "@/components/SearchFloatingButton";
import type { Messages } from "@/types/messages";

export default function SearchPageContent({ messages }: { messages: Messages }) {
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ?? "";

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  useEffect(() => {
    const genres = searchParams?.get("genre")?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterGenres") || "[]");
    const areas = searchParams?.get("area")?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterAreas") || "[]");
    const payments = searchParams?.get("payment")?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterPayments") || "[]");
    const open = searchParams?.get("open") === "true" ||
      JSON.parse(sessionStorage.getItem("filterOpen") || "false");

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);
    setIsSearchTriggered(true);
  }, [queryString, searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <main className="flex-grow flex justify-center pt-8">
        <div className="w-full max-w-[1024px] px-4 min-h-[200px]">
          {isSearchTriggered && (
            <Suspense fallback={<div className="text-center py-10">検索結果を読み込み中...</div>}>
              <SearchResults
                key={queryString}
                selectedGenres={selectedGenres}
                selectedAreas={selectedAreas}
                selectedPayments={selectedPayments}
                showOnlyOpen={showOnlyOpen}
                isSearchTriggered={isSearchTriggered}
                messages={{
                  ...messages.searchResults,
                  genres: messages.genres,
                }}
              />
            </Suspense>
          )}

          {/* 画面右下に常時表示される検索ボタン */}
          <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div className="w-full max-w-[600px] flex justify-end pr-6 pointer-events-auto">
              <SearchFloatingButton
                messages={messages.searchFilter}
                genres={messages.genres}
                areas={messages.areas}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}