import type { Store } from "@/types/store";
import { checkIfOpen } from "@/lib/utils";

type Props = {
  stores: Store[];
  activeStoreId: string | null;
  genreTranslations: Record<string, string>;
  areas: Record<string, string>; // 追加
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onClickCard: (store: Store, index: number) => void;
};

export default function StoreCardSlider({
  stores,
  activeStoreId,
  genreTranslations,
  areas,
  cardRefs,
  onClickCard,
}: Props) {
  return (
    <div
      id="cardSlider"
      className="absolute bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-4 overflow-x-auto flex gap-4 snap-x snap-mandatory transition-all duration-300"
    >
      {stores.map((store, i) => {
        const status = checkIfOpen(store.opening_hours || "");

        return (
          <div
            key={store.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            onClick={() => onClickCard(store, i)}
            className={`w-[260px] sm:w-[300px] md:w-[320px] lg:w-[360px] flex-shrink-0 bg-white border rounded-lg p-4 cursor-pointer snap-center shadow-md transition-transform ${store.id === activeStoreId ? "scale-105" : ""
              }`}
          >
            <h3 className="text-[16px] font-semibold text-[#1F1F21] mb-1">{store.name}</h3>
            <p className="text-[12px] font-light text-[#1F1F21] leading-[150%] mb-2 line-clamp-3">
              {store.description || "店舗紹介文はまだありません。"}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              {store.genre_ids?.map((id) => genreTranslations[id] || id).join(" / ") || "ジャンル不明"}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              {store.area_id ? areas[store.area_id] || store.area_id : "エリア不明"}
            </p>
            <p className="text-sm text-black">
              {status.isOpen ? (
                <>
                  <span className="text-green-600 font-semibold">営業中</span>
                  <br />
                  {status.closeTime && `${status.closeTime} まで営業`}
                </>
              ) : (
                <>
                  <span className="text-red-600 font-semibold">営業時間外</span>
                  <br />
                  {status.nextOpening && `次の営業：${status.nextOpening.day} ${status.nextOpening.time} から`}
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}