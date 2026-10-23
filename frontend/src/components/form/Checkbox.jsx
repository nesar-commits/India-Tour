import { forwardRef } from "react";
import { AlertCircleIcon, CheckIcon } from "../Icons.jsx";

const Checkbox = forwardRef(function Checkbox({ id, children, error, ...inputProps }, ref) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={`checkbox-field ${error ? "field-invalid" : ""}`}>
      <label className="checkbox" htmlFor={id}>
        <span className="checkbox-box">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            {...inputProps}
          />
          <CheckIcon size={14} strokeWidth={3} className="checkbox-mark" />
        </span>
        <span className="checkbox-label">{children}</span>
      </label>
      {error && (
        <p id={errorId} className="field-error">
          <AlertCircleIcon size={14} />
          {error}
        </p>
      )}
    </div>
  );
});

export default Checkbox;
