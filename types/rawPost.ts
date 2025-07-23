export type RawPost = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  store?: { id: string; name: string } | { id: string; name: string }[] | null;
  post_likes?: { user_id: string }[];
  user_profiles?: {
    id: string;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
  post_tag_values?: {
    value: number;
    tag_category: {
      key: string;
      label: string;
      min_label: string;
      max_label: string;
    } | null;
  }[];
};