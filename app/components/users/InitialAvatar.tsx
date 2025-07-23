// components/users/InitialAvatar.tsx
type InitialAvatarProps = {
  name?: string;
  size?: number;
};

const colors = [
  "bg-blue-500", "bg-red-500", "bg-green-600",
  "bg-yellow-500", "bg-purple-500", "bg-pink-500",
];

export default function InitialAvatar({ name = "？", size = 96 }: InitialAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`flex items-center justify-center text-white font-bold rounded-full ${color}`}
      style={{
        width: size,
        height: size,
        fontSize: size / 2,
      }}
    >
      {initial}
    </div>
  );
}