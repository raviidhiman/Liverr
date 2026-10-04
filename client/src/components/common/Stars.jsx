export default function Stars({ rating = 0, count, size = 14 }) {
  const r = Number(rating) || 0;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span style={{ color: "#ffb33e", fontSize: size }}>★</span>
      <span className="font-semibold">{r > 0 ? r.toFixed(1) : "New"}</span>
      {count !== undefined && r > 0 && <span className="text-gray-400">({count})</span>}
    </span>
  );
}
