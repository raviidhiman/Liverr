export const CATEGORIES = [
  { name: "Graphics & Design", icon: "🎨" },
  { name: "Digital Marketing", icon: "📈" },
  { name: "Writing & Translation", icon: "✍️" },
  { name: "Video & Animation", icon: "🎬" },
  { name: "Music & Audio", icon: "🎵" },
  { name: "Programming & Tech", icon: "💻" },
  { name: "Business", icon: "💼" },
  { name: "Data", icon: "📊" },
  { name: "Lifestyle", icon: "🌿" },
];

export const categoryIcon = (name) => CATEGORIES.find((c) => c.name === name)?.icon || "✨";
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const errMsg = (e, fallback = "Something went wrong") => e?.response?.data?.message || e?.message || fallback;
export const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

export const STATUS = {
  awaiting_payment: { label: "Awaiting payment", cls: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In progress", cls: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", cls: "bg-purple-100 text-purple-800" },
  revision: { label: "Revision requested", cls: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
};

const GRADS = [
  ["#1dbf73", "#0e7c4a"], ["#6366f1", "#312e81"], ["#f59e0b", "#b45309"], ["#ec4899", "#9d174d"],
  ["#0ea5e9", "#1e3a8a"], ["#14b8a6", "#134e4a"], ["#f97316", "#9a3412"], ["#8b5cf6", "#4c1d95"],
];
export const gradientFor = (seed = "") => {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = GRADS[h % GRADS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
};

// Resize an image in the browser and return a compact JPEG data URL (keeps DB documents small)
export const fileToDataUrl = (file, max = 900, quality = 0.8) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
