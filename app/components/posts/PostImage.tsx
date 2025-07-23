import { useEffect, useState } from "react";
import Image from "next/image";

type ImageSelectorProps = {
  image: File | null;
  onChange: (file: File | null) => void;
};

export function ImageSelector({ image, onChange }: ImageSelectorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // props.imageが更新されたらプレビューも更新
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  };

  return (
    <div
      className="w-full h-36 rounded border border-dashed border-zinc-300 flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={() => document.getElementById("imageInput")?.click()}
    >
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="選択画像"
          width={300}
          height={200}
          className="object-cover w-full h-full"
        />
      ) : (
        <p className="text-zinc-300 text-base font-light font-['Hiragino_Kaku_Gothic_ProN']">
          画像を選択
        </p>
      )}
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}