/* eslint-disable prefer-const */
import dayjs from "dayjs";
import "dayjs/locale/ja";
import isBetween from "dayjs/plugin/isBetween";
import { supabase } from "@/lib/supabase";

dayjs.extend(isBetween);

// ✅ 日本語曜日名へ変換（マッチング用）
export const convertToJapaneseDay = (day: string) => {
  return day
    .replace("Sunday", "日曜日")
    .replace("Monday", "月曜日")
    .replace("Tuesday", "火曜日")
    .replace("Wednesday", "水曜日")
    .replace("Thursday", "木曜日")
    .replace("Friday", "金曜日")
    .replace("Saturday", "土曜日")
    .replace("曜日", "");
};

// ✅ 本日の営業時間だけを抜き出して表示（吹き出し用）
export const getTodayHoursText = (opening_hours: string): string => {
  const now = new Date();
  const jpDay = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
  const todayLine = opening_hours
    .split("\n")
    .find((line) => line.startsWith(jpDay));
  if (!todayLine || todayLine.includes("休み")) return "休み";
  return todayLine.replace(/^.+曜\s*/, "").trim();
};

// ✅ 現在営業中かどうかの判定と次回営業情報
export const checkIfOpen = (opening_hours: string): {
  isOpen: boolean;
  closeTime?: string;
  nextOpening: { day: string; time: string } | null;
  unknown?: boolean;
} => {
  const nowRaw = dayjs();
  let now = nowRaw;
  if (nowRaw.hour() < 6) now = nowRaw.subtract(1, "day");

  const today = now.format("dddd");
  const tomorrow = now.add(1, "day").format("dddd");

  const jpToday = convertToJapaneseDay(today);
  const jpTomorrow = convertToJapaneseDay(tomorrow);

  const hoursMap: { [key: string]: { open: string; close: string }[] } = {};

  if (!opening_hours || opening_hours.trim() === "") {
    return {
      isOpen: false,
      closeTime: undefined,
      nextOpening: null,
      unknown: true,
    };
  }

  opening_hours.split("\n").forEach((line) => {
    const match = line.match(/^(.+?曜)\s*(.+)$/);
    if (match && match[1] && match[2]) {
      const day = match[1].trim();
      const hoursText = match[2].trim();

      if (hoursText === "休み") {
        hoursMap[day] = [];
      } else {
        const hoursList = hoursText.split(", ");
        hoursMap[day] = hoursList.map((hours) => {
          const [openTime, closeTime] = hours.split("〜").map((t) => t.trim());
          return { open: openTime, close: closeTime };
        });
      }
    }
  });

  const foundKey = Object.keys(hoursMap).find((key) => key.startsWith(jpToday));
  if (!foundKey || !hoursMap[foundKey]?.length) {
    const nextDayKey = Object.keys(hoursMap).find((key) => key.startsWith(jpTomorrow));
    if (!nextDayKey || !hoursMap[nextDayKey]?.length) {
      return { isOpen: false, nextOpening: null };
    }
    return {
      isOpen: false,
      nextOpening: {
        day: tomorrow,
        time: hoursMap[nextDayKey][0].open,
      },
    };
  }

  const todayHours = hoursMap[foundKey] || [];
  let isOpen = false;
  let closeTime: string | undefined = undefined;
  let nextOpening: { day: string; time: string } | null = null;

  for (const period of todayHours) {
    const [openHourStr, openMinuteStr] = period.open.split(":");
    const [closeHourStr, closeMinuteStr] = period.close.split(":");

    let open = now.set("hour", parseInt(openHourStr)).set("minute", parseInt(openMinuteStr));
    let close = now.set("hour", parseInt(closeHourStr)).set("minute", parseInt(closeMinuteStr));
    if (parseInt(closeHourStr) >= 24) {
      close = now.add(1, "day").set("hour", parseInt(closeHourStr) - 24).set("minute", parseInt(closeMinuteStr));
    }

    if (nowRaw.isBetween(open, close, null, "[)")) {
      isOpen = true;
      closeTime = close.format("HH:mm");
      break;
    }
  }

  if (!isOpen) {
    const currentHour = nowRaw.hour();
    if (currentHour < 6) return { isOpen: false, nextOpening: null };

    const futureHours = todayHours.filter((period) =>
      dayjs(`${now.format("YYYY-MM-DD")} ${period.open}`).isAfter(now)
    );
    if (futureHours.length > 0) {
      nextOpening = { day: today, time: futureHours[0].open };
    } else {
      const nextDayKey = Object.keys(hoursMap).find((key) => key.startsWith(jpTomorrow));
      if (nextDayKey && hoursMap[nextDayKey].length > 0) {
        nextOpening = {
          day: tomorrow,
          time: hoursMap[nextDayKey][0].open,
        };
      }
    }
  }

  return { isOpen, closeTime, nextOpening };
};

// ✅ デバイス判定
export const getDeviceType = (): "pc" | "mobile" => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("iphone") || ua.includes("android") ? "mobile" : "pc";
};

// ✅ アクションログ送信（確認付き）
export const logAction = async (
  action: string,
  data: Record<string, unknown>
): Promise<void> => {
  const payload = {
    action,
    ...data,
    created_at: new Date().toISOString(),
    device: getDeviceType(),
  };

  const { error } = await supabase.from("action_logs").insert([payload]);
  if (error) {
    console.error("🔥 アクションログ保存失敗:", error.message);
  }
};