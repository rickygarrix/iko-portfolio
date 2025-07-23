import type { Post } from "@/types/post";

export type RawPost = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  store?: { id: string; name: string } | { id: string; name: string }[] | null;
  user_profiles?: {
    id?: string;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
  post_likes?: { user_id: string }[];
  post_tag_values?: {
    tag_value?: {
      id?: string;
      name_ja?: string;
      tag_category?: {
        id?: string;
        name_ja?: string;
      } | null;
    } | null;
  }[];
};

export const normalizePost = (p: RawPost): Post => ({
  id: p.id,
  body: p.body,
  created_at: p.created_at,
  user_id: p.user_id,
  image_url: p.image_url ?? null,
  store: Array.isArray(p.store) ? p.store[0] : p.store ?? undefined,
  user:
    typeof p.user_profiles?.id === "string"
      ? {
          id: p.user_profiles.id,
          name: p.user_profiles.name ?? "匿名",
          avatar_url: p.user_profiles.avatar_url ?? "/setting.svg",
        }
      : {
          id: p.user_id,
          name: "匿名",
          avatar_url: "/setting.svg",
        },
  post_likes: p.post_likes ?? [],
  post_tag_values: (p.post_tag_values ?? [])
    .filter((tag) => tag.tag_value?.tag_category)
    .map((tag) => ({
      id: String(tag.tag_value?.id ?? ""),
      value: String(tag.tag_value?.name_ja ?? ""),
      tag_category: {
        id: tag.tag_value?.tag_category?.id ?? "",
        label: tag.tag_value?.tag_category?.name_ja ?? "",
      },
    })),
});