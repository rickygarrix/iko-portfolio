"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";

// 定数
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
const GENDERS = ["男性", "女性", "その他", "回答しない"];
const OCCUPATIONS = [
  "会社員", "公務員", "自営業", "経営者・役員", "学生",
  "主婦・主夫", "無職", "定年退職", "その他"
];
const BIRTH_YEARS = Array.from({ length: 2025 - 1925 + 1 }, (_, i) => 1925 + i).reverse();

export default function SettingsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [url, setUrl] = useState("");
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [gender, setGender] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // 初期データ読み込み
  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setSessionEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: survey } = await supabase
        .from("user_survey_answers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setName(profile?.name ?? "");
      setBio(profile?.bio ?? "");
      setUrl(profile?.url ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setPrefecture(survey?.prefecture ?? "");
      setCity(survey?.city ?? "");
      setGender(survey?.gender ?? "");
      setBirthYear(survey?.birth_year ?? null);
      setOccupation(survey?.occupation ?? "");
    };
    fetch();
  }, [router]);

  // アバター画像アップロード
  const handleAvatarUpload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (error) {
      alert("アップロード失敗");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
  };

  // 更新処理
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error: profileError } = await supabase.from("user_profiles").upsert({
        id: userId,
        name,
        bio,
        url,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      const { error: surveyError } = await supabase
        .from("user_survey_answers")
        .upsert({
          user_id: userId,
          birth_year: birthYear,
          gender,
          prefecture,
          city,
          occupation,
        }, { onConflict: 'user_id' });

      if (profileError || surveyError) {
        console.error("更新エラー", profileError, surveyError);
        alert("更新に失敗しました");
        return;
      }

      alert("更新が完了しました");
      router.push("/mypage");
    } catch (e) {
      console.error("予期せぬエラー", e);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-md w-full mx-auto px-4 py-16">
        <h1 className="text-center text-lg font-semibold tracking-widest text-zinc-900 mb-10">
          ユーザー情報
        </h1>

        {/* アバターと名前 */}
        <div className="flex items-start gap-4 mb-8">
          <div
            className={`w-20 h-20 rounded-full overflow-hidden bg-zinc-200 cursor-pointer ${avatarUrl ? "relative" : "flex items-center justify-center"
              }`}
            onClick={() => document.getElementById("avatarInput")?.click()}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src="/post/picture.svg"
                alt="No Avatar"
                width={32}
                height={32}
                className="opacity-30"
              />
            )}
          </div>

          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
            className="hidden"
          />

          <div className="flex-1">
            <Field label="表示名" required publicStatus value={name} onChange={setName} />
          </div>
        </div>

        {/* フォーム */}
        <div className="flex flex-col gap-6">
          <Field label="自己紹介" required publicStatus textarea value={bio} onChange={setBio} />
          <Field label="関連URL" publicStatus value={url} onChange={setUrl} />
          <SelectField
            label="生まれた年"
            required
            privateStatus
            options={BIRTH_YEARS.map((y) => `${y}年`)}
            value={birthYear ? `${birthYear}年` : ""}
            onChange={(v) => setBirthYear(Number(v.replace("年", "")))}
          />
          <SelectField
            label="性別"
            required
            privateStatus
            options={GENDERS}
            value={gender}
            onChange={setGender}
          />
          <div className="flex gap-2">
            <SelectField
              label="都道府県"
              required
              privateStatus
              options={PREFECTURES}
              value={prefecture}
              onChange={setPrefecture}
              className="flex-1"
            />
            <Field label="市区町村" value={city} onChange={setCity} className="flex-1" />
          </div>
          <SelectField
            label="職業"
            required
            privateStatus
            options={OCCUPATIONS}
            value={occupation}
            onChange={setOccupation}
          />
          <Field
            label="メールアドレス（変更不可）"
            required
            privateStatus
            value={sessionEmail}
            onChange={() => { }} // 空関数でOK
            readOnly
          />
        </div>

        {/* ボタン */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleUpdate}
            className="w-full h-12 bg-zinc-900 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "更新中..." : "更新"}
          </button>
          <button
            onClick={() => router.push("/change-password")}
            className="w-full h-12 border border-zinc-900 text-zinc-900 rounded-lg"
          >
            パスワード変更
          </button>
          <button
            onClick={() => router.push("/withdrawal/auth")}
            className="w-full h-12 border border-rose-700 text-rose-700 rounded-lg"
          >
            退会
          </button>
        </div>
      </main>
      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}