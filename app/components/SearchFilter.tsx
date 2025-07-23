"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { logAction } from "@/lib/utils";
import type { Messages } from "@/types/messages";

type Option = { id: string; name: string };

type Props = {
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAreas: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPayments: string[];
  setSelectedPayments: React.Dispatch<React.SetStateAction<string[]>>;
  showOnlyOpen: boolean;
  setShowOnlyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: () => void;
  previewCount: number;
  showTitle?: boolean;
  messages: Messages["searchFilter"] & {
    payments: { [key: string]: string };
    genres: { [key: string]: string };
    areas: { [key: string]: string };
  };
};

export default function SearchFilter({
  selectedGenres,
  setSelectedGenres,
  selectedAreas,
  setSelectedAreas,
  setSelectedPayments,
  showOnlyOpen,
  setShowOnlyOpen,
  handleSearch,
  previewCount,
  showTitle = true,
  messages,
}: Props) {
  const [genres, setGenres] = useState<Option[]>([]);
  const [areas, setAreas] = useState<Option[]>([]);

  useEffect(() => {
    const fetch = async () => {
      // ジャンル・エリア・店舗情報
      const [{ data: genreData }, { data: areaData }, { data: storeData }] = await Promise.all([
        supabase.from("genre_translations").select("genre_id, name").eq("locale", "ja"),
        supabase.from("area_translations").select("area_id, name").eq("locale", "ja"),
        supabase.from("stores").select("id, area_id, genre_ids, store_follows(count)").eq("is_published", true),
      ]);

      if (!storeData) return;

      const areaCountMap: Record<string, number> = {};
      const genreCountMap: Record<string, number> = {};

      storeData.forEach((store) => {
        // エリア
        const areaId = store.area_id;
        if (areaId) {
          areaCountMap[areaId] = (areaCountMap[areaId] || 0) + (store.store_follows?.length || 0);
        }

        // ジャンル
        const genreIds: string[] = store.genre_ids ?? [];
        genreIds.forEach((g) => {
          genreCountMap[g] = (genreCountMap[g] || 0) + (store.store_follows?.length || 0);
        });
      });

      const areaSorted = (areaData ?? [])
        .map((a) => ({ id: a.area_id, name: a.name }))
        .sort((a, b) => (areaCountMap[b.id] || 0) - (areaCountMap[a.id] || 0));

      const genreSorted = (genreData ?? [])
        .map((g) => ({ id: g.genre_id, name: g.name }))
        .filter((g) => g.id !== "other")
        .sort((a, b) => (genreCountMap[b.id] || 0) - (genreCountMap[a.id] || 0));

      setGenres(genreSorted);
      setAreas(areaSorted);
    };

    fetch();
  }, []);

  const logSearchAction = async (action: "search" | "reset_search") => {
    await logAction(action, {
      locale: "ja",
      search_conditions: {
        genres: selectedGenres,
        areas: selectedAreas,
        payments: [],
        openOnly: showOnlyOpen,
      },
    });
  };

  return (
    <div className="w-full flex justify-center bg-[#F7F5EF] pt-[48px] pb-12">
      <div className="w-full max-w-[600px] px-6 text-[#1F1F21] text-[14px] space-y-10">
        {showTitle && (
          <div className="text-center">
            <h2 className="text-[18px] font-bold mb-1">{messages.title}</h2>
          </div>
        )}

        <div className="space-y-8">
          {/* 営業時間 */}
          <div>
            <p className="text-[16px] font-bold mb-2">{messages.open}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[{ label: messages.open_all, value: false }, { label: messages.open_now, value: true }]
                .map(({ label, value }) => (
                  <label key={String(value)} className="flex items-center gap-2 cursor-pointer">
                    <div className="relative w-[20px] h-[20px]">
                      <input
                        type="radio"
                        name="openingHours"
                        checked={showOnlyOpen === value}
                        onChange={() => setShowOnlyOpen(value)}
                        className="peer appearance-none w-full h-full border border-[#1F1F21] rounded-full bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21]"
                      />
                      <span className="absolute top-1/2 left-1/2 w-[8px] h-[8px] rounded-full bg-white hidden peer-checked:block transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    {label}
                  </label>
                ))}
            </div>
          </div>

          {/* ジャンル */}
          <div>
            <p className="text-[16px] font-bold mb-2">{messages.genre}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.id)}
                    onChange={() =>
                      setSelectedGenres(
                        selectedGenres.includes(genre.id)
                          ? selectedGenres.filter((g) => g !== genre.id)
                          : [...selectedGenres, genre.id]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-[url('/icons/check.svg')] bg-center bg-no-repeat"
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          </div>

          {/* エリア */}
          <div>
            <p className="text-[16px] font-bold mb-2">{messages.area}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {areas.map((area) => (
                <label key={area.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area.id)}
                    onChange={() =>
                      setSelectedAreas(
                        selectedAreas.includes(area.id)
                          ? selectedAreas.filter((a) => a !== area.id)
                          : [...selectedAreas, area.id]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-[url('/icons/check.svg')] bg-center bg-no-repeat"
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={async () => {
              await logSearchAction("reset_search");
              setSelectedGenres([]);
              setSelectedAreas([]);
              setSelectedPayments([]);
              setShowOnlyOpen(false);
            }}
            className="w-[100px] h-[48px] rounded-[8px] border border-[#1F1F21] bg-white text-[#1F1F21] active:scale-95 transition-transform"
          >
            {messages.reset}
          </button>

          <button
            onClick={async (e) => {
              e.preventDefault();
              await logSearchAction("search");
              handleSearch();
            }}
            className="w-[270px] h-[48px] bg-[#1F1F21] text-[#FEFCF6] rounded-[8px] border border-[#1F1F21] px-4 flex items-center justify-center gap-2"
          >
            <div className="relative w-[14px] h-[14px]">
              <Image src="/icons/search.svg" alt="検索" fill className="object-contain" />
            </div>
            {messages.search}（{previewCount}{messages.items}）
          </button>
        </div>
      </div>
    </div>
  );
}