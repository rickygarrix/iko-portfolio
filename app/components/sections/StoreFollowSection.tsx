"use client";

import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types/store";

type Props = {
  stores: Pick<Store, "id" | "name">[];
  fullStores: Store[];
  areasMap: Record<string, string>;
  onStoreClick: (storeId: string) => void;
};

export default function StoreFollowSection({
  stores,
  fullStores,
  areasMap,
  onStoreClick,
}: Props) {
  if (stores.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        フォロー中の店舗はありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4"> {/* ← ここを追加 */}
      {stores.map((store, index) => {
        const fullStore = fullStores.find((s) => s.id === store.id);
        if (!fullStore) return null;

        return (
          <StoreCard
            key={store.id}
            store={fullStore}
            locale="ja"
            index={index}
            genresMap={{
              pop: "ポップス",
              jazz: "ジャズ",
              edm: "EDM",
              hiphop: "ヒップホップ",
              house: "ハウス",
              techno: "テクノ",
            }}
            areasMap={areasMap}
            translatedDescription=""
            messages={{
              title: "店舗情報",
              subtitle: "お気に入り店舗",
              open: "営業中",
              closed: "営業時間外",
              close: "休み",
              openUntil: "{time}まで営業",
              nextOpen: "{day} {time}に営業開始",
              noDescription: "説明なし",
              days: {
                Monday: "月",
                Tuesday: "火",
                Wednesday: "水",
                Thursday: "木",
                Friday: "金",
                Saturday: "土",
                Sunday: "日",
              },
            }}
            onClick={() => onStoreClick(store.id)}
            onMapClick={() => { }}
          />
        );
      })}
    </div>
  );
}