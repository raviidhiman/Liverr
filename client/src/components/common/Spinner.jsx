export default function Spinner({ full = false }) {
  return (
    <div className={`flex justify-center items-center ${full ? "min-h-[60vh]" : "py-10"}`}>
      <div className="spinner" />
    </div>
  );
}
