"use client";

import { useLayoutEffect, useEffect, useState, useRef, useMemo } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { translateText } from "@/lib/translateText";
import { Store } from "@/types/store";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import StoreCard from "@/components/StoreCard";
import type { Messages } from "@/types/messages";
import { sendGAEvent } from "@/lib/ga";

export type TranslatedStore = Store & {
  _postCount?: number;
  _followerCount?: number;
};

export type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
  messages: Messages["searchResults"] & { genres: Record<string, string> };
};

const fetchStores = async (
  selectedGenres: string[],
  selectedAreas: string[],
  selectedPayments: string[],
  showOnlyOpen: boolean,
  locale: string,
  sortBy: "posts" | "followers"
): Promise<{ stores: TranslatedStore[]; areaMap: Record<string, string> }> => {
  let query = supabase.from("stores").select("*").eq("is_published", true);

  if (selectedGenres.length) query = query.filter("genre_ids", "cs", JSON.stringify(selectedGenres));
  if (selectedAreas.length) query = query.in("area_id", selectedAreas);
  if (selectedPayments.length) query = query.overlaps("payment_method_ids", selectedPayments);

  const { data: stores, error } = await query;
  if (error || !stores) throw new Error(error?.message || "データ取得失敗");

  const storeIds = stores.map((s) => s.id);
  const postCounts: Record<string, number> = {};
  const followCounts: Record<string, number> = {};

  if (sortBy === "posts") {
    const { data: posts } = await supabase
      .from("posts")
      .select("store_id")
      .in("store_id", storeIds)
      .eq("is_active", true);
    posts?.forEach((p) => {
      postCounts[p.store_id] = (postCounts[p.store_id] || 0) + 1;
    });
  }

  if (sortBy === "followers") {
    const { data: follows } = await supabase
      .from("store_follows")
      .select("store_id")
      .in("store_id", storeIds);
    follows?.forEach((f) => {
      followCounts[f.store_id] = (followCounts[f.store_id] || 0) + 1;
    });
  }

  const { data: areaData } = await supabase
    .from("area_translations")
    .select("area_id, name")
    .eq("locale", locale);
  const areaMap = Object.fromEntries(areaData?.map((a) => [a.area_id, a.name]) || []);

  const enriched = stores.map((store) => ({
    ...store,
    _postCount: postCounts[store.id] || 0,
    _followerCount: followCounts[store.id] || 0,
  }));

  if (sortBy === "posts") enriched.sort((a, b) => b._postCount - a._postCount);
  if (sortBy === "followers") enriched.sort((a, b) => b._followerCount - a._followerCount);

  const filtered = showOnlyOpen ? enriched.filter((s) => checkIfOpen(s.opening_hours).isOpen) : enriched;

  return { stores: filtered, areaMap };
};

export default function SearchResults({
  selectedGenres,
  selectedAreas,
  selectedPayments,
  showOnlyOpen,
  isSearchTriggered,
  messages,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname()!;
  const queryParams = searchParams.toString();
  const locale = pathname.split("/")[1] || "ja";
  const [sortBy, setSortBy] = useState<"posts" | "followers">("followers");
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const clickedStoreIds = useRef<Set<string>>(new Set());

  const { data, error, isLoading } = useSWR<{
    stores: TranslatedStore[];
    areaMap: Record<string, string>;
  }>(
    isSearchTriggered ? ["search-stores", locale, sortBy] : null,
    () =>
      fetchStores(
        selectedGenres,
        selectedAreas,
        selectedPayments,
        showOnlyOpen,
        locale,
        sortBy
      ),
    { revalidateOnFocus: false }
  );

  const stores = useMemo(() => data?.stores ?? [], [data]);
  const areaMap = useMemo(() => data?.areaMap ?? {}, [data]);

  useLayoutEffect(() => {
    const savedY = sessionStorage.getItem("searchScrollY");
    if (savedY && pathname === `/${locale}/search`) {
      const y = parseInt(savedY, 10);
      setIsRestoring(true);
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
        setTimeout(() => {
          window.scrollTo(0, y);
          sessionStorage.removeItem("searchScrollY");
          setIsRestoring(false);
          setShouldRender(true);
        }, 0);
      });
    } else {
      setShouldRender(true);
    }
  }, [pathname, locale]);

  useEffect(() => {
    if (!stores || locale === "ja") return;
    const translateAll = async () => {
      const translations: Record<string, string> = {};
      for (const store of stores) {
        if (store.description) {
          try {
            const translated = await translateText(store.description, locale);
            translations[store.id] = translated;
          } catch {
            translations[store.id] = store.description;
          }
        }
      }
      setTranslatedDescriptions(translations);
    };
    translateAll();
  }, [stores, locale]);

  const handleStoreClick = async (storeId: string) => {
    if (clickedStoreIds.current.has(storeId)) return;
    clickedStoreIds.current.add(storeId);
    sessionStorage.setItem("searchScrollY", window.scrollY.toString());
    setIsOverlayVisible(true);
    try {
      await logAction("click_search_store", { store_id: storeId, query_params: queryParams, locale });
    } catch { }
    setTimeout(() => {
      router.push(`/stores/${storeId}?prev=/search&${queryParams}`);
    }, 100);
  };

  if (!isSearchTriggered) return <p className="text-center py-6">{messages.prompt}</p>;
  if (isLoading) return <p className="text-center py-6">{messages.loading}</p>;
  if (error) return <p className="text-red-500 text-center py-6">⚠️ {messages.error}: {(error as Error).message}</p>;
  if (!stores || stores.length === 0) return <p className="text-center py-6">{messages.notFound}</p>;

  return (
    <div
      className="relative w-full pb-8 pt-[64px]"
      style={{
        visibility: isRestoring ? "hidden" : "visible",
        minHeight: "100vh",
      }}
    >
      {isOverlayVisible && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      {shouldRender && (
        <div className="mx-auto w-full max-w-[600px] px-2 sm:px-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">
              {messages.resultLabel} <span className="text-[#4B5C9E]">{stores.length}</span> {messages.items}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "posts" | "followers")}
              className="border text-sm rounded px-2 py-1"
            >
              <option value="posts">投稿数順</option>
              <option value="followers">お気に入り多い順</option>
            </select>
          </div>

          <div className="flex flex-col divide-y divide-zinc-300">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                locale={locale}
                index={0}
                genresMap={messages.genres}
                areasMap={areaMap}
                translatedDescription={translatedDescriptions[store.id]}
                onClick={handleStoreClick}
                onMapClick={(e) => {
                  e.stopPropagation();
                  sendGAEvent("click_searchresult_map", {
                    store_id: store.id,
                    store_name: store.name,
                    latitude: store.latitude ?? undefined,
                    longitude: store.longitude ?? undefined,
                  });
                }}
                messages={messages}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}