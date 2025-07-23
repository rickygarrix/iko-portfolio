export type Post = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  store?: {
    id: string;
    name: string;
  };
  post_likes?: {
    user_id: string;
  }[];
  post_tag_values?: {
    id: string; // ← ★ checkbox用のtag_value.id
    value: string; // tag_value.name_ja
    tag_category: {
      id: string;
      label: string; // tag_category.name_ja
    };
  }[];
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  } | null;
};

type TagValueWithCategory = {
  id: string;
  name_ja: string;
  tag_category: {
    id: string;
    name_ja: string;
  };
};

type RawTag = {
  tag_value?: TagValueWithCategory;
};