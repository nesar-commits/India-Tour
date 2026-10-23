import { PASSWORD_RULES, passwordStrength } from "../../auth/validation.js";
import { CheckIcon } from "../Icons.jsx";

export default function PasswordStrength({ password }) {
  const { score, label } = passwordStrength(password);

  return (
    <div className="strength">
      <div className="strength-meter" data-score={score} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= score ? "on" : ""} />
        ))}
      </div>
      <p className="strength-label" aria-live="polite">
        {password ? (
          <>
            Password strength: <strong>{label}</strong>
          </>
        ) : (
          "Use 8+ characters with a mix of letters and numbers."
        )}
      </p>
      <ul className="strength-rules">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.id} className={met ? "met" : ""}>
              <CheckIcon size={13} strokeWidth={3} />
              {rule.label}
              <span className="visually-hidden">{met ? " (done)" : " (not yet)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
