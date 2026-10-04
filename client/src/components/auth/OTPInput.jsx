import { useRef } from "react";

export default function OTPInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const setAt = (i, ch) => {
    const arr = digits.slice();
    arr[i] = ch;
    onChange(arr.join(""));
  };
  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    setAt(i, ch);
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (text) { e.preventDefault(); onChange(text); refs.current[Math.min(text.length, length - 1)]?.focus(); }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i} ref={(el) => (refs.current[i] = el)} value={d} inputMode="numeric" maxLength={1}
          onChange={(e) => handleChange(i, e)} onKeyDown={(e) => handleKey(i, e)}
          className="w-11 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-brand outline-none py-2"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
