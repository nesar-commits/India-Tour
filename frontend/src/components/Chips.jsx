export default function Chips({ options, value, onChange, allLabel = "All" }) {
  return (
    <div className="chips" role="group">
      {[{ value: "", label: allLabel }, ...options.map((o) => ({ value: o, label: o }))].map(
        (o) => (
          <button
            key={o.value || "all"}
            type="button"
            className={`chip ${value === o.value ? "active" : ""}`}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      )}
    </div>
  );
}
