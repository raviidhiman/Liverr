import { gradientFor } from "../../utils/helpers";
export default function Avatar({ user, size = 36 }) {
  const name = user?.name || "?";
  const style = { width: size, height: size, fontSize: size * 0.42, flexShrink: 0 };
  if (user?.avatar) return <img src={user.avatar} alt={name} style={style} className="rounded-full object-cover" />;
  return (
    <span style={{ ...style, background: gradientFor(name) }} className="rounded-full text-white font-bold inline-flex items-center justify-center">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
