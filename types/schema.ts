// types/schema.ts

// 店舗情報
export type Store = {
  id: string;
  name: string;
  genre_ids: string[];
  area_id:string;
  area: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  payment_methods: string[];
  payment_method_ids: string;
  address: string;
  phone: string;
  website?: string;
  description: string;
  access: string;
  map_embed?: string;
  map_link?: string;
  store_instagrams?: string | null;
  store_instagrams2?: string | null;
  store_instagrams3?: string | null;
};

// タグカテゴリ（評価軸）
export interface TagCategory {
  id: string;
  label: string; // ← name_ja を UIで label として扱う
}

// タグの選択値（UIでは使用しないが、管理画面や絞り込みで利用する可能性あり）
export type TagValue = {
  id: string;
  post_id?: string;
  tag_category_id: string;
  category_id: string; // ← ✅ nullableをやめる
  value?: number;
  name_ja?: string;
  name_en?: string;
  name_zh?: string;
  name_ko?: string;

  tag_category?: {
    key: string;
    label: string;
    min_label?: string;
    max_label?: string;
  };
};

// ユーザー情報
export type User = {
  id: string;
  name?: string;
  avatar_url?: string;
};