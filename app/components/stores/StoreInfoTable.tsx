// components/stores/StoreInfoTable.tsx
import type { Store } from "@/types/schema";

const genreLabels: Record<string, string> = {
  jazz: "ジャズ", house: "ハウス", techno: "テクノ", edm: "EDM",
  hiphop: "ヒップホップ", pop: "ポップス", rock: "ロック",
  reggae: "レゲエ", other: "その他",
};

export default function StoreInfoTable({ store }: { store: Store }) {
  return (
    <div className="my-10 px-4">
      <p className="text-base mb-2 flex items-center gap-2 text-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px]" />
        店舗情報
      </p>
      <table className="w-full border border-[#E7E7EF] text-sm text-black">
        <tbody>
          <tr><th className="bg-[#FDFBF7] px-4 py-4 text-left font-normal w-[90px]">店舗名</th><td className="border px-4 py-4">{store.name}</td></tr>
          <tr><th className="bg-[#FDFBF7] px-4 py-4 text-left font-normal">ジャンル</th><td className="border px-4 py-4">{store.genre_ids?.map((gid) => genreLabels[gid] || gid).join(" / ")}</td></tr>
          <tr><th className="bg-[#FDFBF7] px-4 py-4 text-left font-normal">所在地</th><td className="border px-4 py-4">{store.address}</td></tr>
          <tr><th className="bg-[#FDFBF7] px-4 py-4 text-left font-normal">アクセス</th><td className="border px-4 py-4">{store.access}</td></tr>
          <tr><th className="bg-[#FDFBF7] px-4 py-4 text-left font-normal">営業時間</th><td className="border px-4 py-4">{store.opening_hours}<p className="text-[10px] text-gray-500 mt-1">※日により変更する可能性があります。</p></td></tr>
        </tbody>
      </table>
    </div>
  );
}