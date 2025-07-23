"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import type { Messages } from "@/types/messages";
import { checkIfOpen } from "@/lib/utils";

const convertToAMPM = (time24: string): string => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
};

const formatCloseTime = (
  time: string,
  locale: string,
  messages: Messages["recommend"] | Messages["searchResults"]
) => {
  const formatted = locale === "en" ? convertToAMPM(time) : time;
  return messages.openUntil.replace("{time}", formatted);
};

const formatNextOpening = (
  nextOpening: { day: string; time: string },
  locale: string,
  messages: Messages["recommend"] | Messages["searchResults"]
) => {
  const formatted = locale === "en" ? convertToAMPM(nextOpening.time) : nextOpening.time;
  const day = messages.days[nextOpening.day as keyof typeof messages.days] || nextOpening.day;
  return messages.nextOpen.replace("{day}", day).replace("{time}", formatted);
};

export type StoreCardProps = {
  store: {
    id: string;
    name: string;
    description?: string;
    genre_ids: string[];
    areaTranslated?: string;
    area_id?: string;
    opening_hours?: string;
    image_url?: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  locale: string;
  index: number;
  genresMap: Record<string, string>;
  areasMap: Record<string, string>;
  translatedDescription?: string;
  messages: Messages["recommend"] | Messages["searchResults"];
  onClick: (storeId: string) => void;
  onMapClick: (e: MouseEvent, storeId: string) => void;
};

export default function StoreCard({
  store,
  locale,
  genresMap,
  areasMap,
  translatedDescription,
  messages,
  onClick,
  onMapClick,
}: StoreCardProps) {
  const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours ?? "");

  const staticMapUrl =
    store.latitude !== null && store.longitude !== null
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${store.latitude},${store.longitude}&zoom=16&size=100x165&scale=2&maptype=roadmap&markers=color:red%7C${store.latitude},${store.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      : null;

  return (
    <div
      onClick={() => onClick(store.id)}
      className="w-full py-5 flex flex-row gap-4 sm:gap-6 transition-colors duration-200 cursor-pointer hover:bg-zinc-50"
    >
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-zinc-900">{store.name}</h3>

          {store.description && (
            <p className="text-sm text-zinc-800 leading-snug line-clamp-2">
              {locale === "ja"
                ? store.description
                : translatedDescription || store.description}
            </p>
          )}

          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {(store.area_id ? areasMap[store.area_id] : "エリア不明") + "\n" +
              store.genre_ids.map((gid) => genresMap[gid] ?? gid).join(" / ")}
          </p>

          <div className="flex flex-col text-sm">
            <span className={`font-bold ${isOpen ? "text-green-700" : "text-rose-700"}`}>
              {isOpen ? messages.open : messages.closed}
            </span>
            <span className="text-zinc-700">
              {isOpen && closeTime
                ? formatCloseTime(closeTime, locale, messages)
                : nextOpening
                  ? formatNextOpening(nextOpening, locale, messages)
                  : ""}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMapClick(e, store.id);
          if (store.latitude && store.longitude) {
            window.open(
              `https://www.google.com/maps?q=${store.latitude},${store.longitude}`,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }}
        className="relative w-[100px] h-[150px] rounded-md overflow-hidden border border-[#1F1F21]"
      >
        <Image
          src={staticMapUrl || store.image_url || "/default-image.jpg"}
          alt={store.name || "店舗画像"}
          width={100}
          height={150}
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </button>
    </div>
  );
}