import { forwardRef, useState } from "react";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "../Icons.jsx";

const TextField = forwardRef(function TextField(
  { id, label, icon: Icon, error, hint, type = "text", revealable = false, ...inputProps },
  ref
) {
  const [revealed, setRevealed] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field ${error ? "field-invalid" : ""}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-control">
        {Icon && <Icon className="field-icon" size={18} />}
        <input
          ref={ref}
          id={id}
          type={revealable ? (revealed ? "text" : "password") : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`field-input ${Icon ? "has-icon" : ""} ${revealable ? "has-action" : ""}`}
          {...inputProps}
        />
        {revealable && (
          <button
            type="button"
            className="field-action"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            aria-controls={id}
          >
            {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="field-error">
          <AlertCircleIcon size={14} />
          {error}
        </p>
      )}
      {hint && <div id={hintId}>{hint}</div>}
    </div>
  );
});

export default TextField;
