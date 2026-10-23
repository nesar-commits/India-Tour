const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "letter", label: "One letter", test: (p) => /[a-zA-Z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /\d/.test(p) },
];

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

// Score 0–4. Never above "Weak" until the minimum rules are met.
export function passwordStrength(password) {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  if (!PASSWORD_RULES.every((r) => r.test(password))) score = Math.min(score, 1);
  return { score, label: STRENGTH_LABELS[score] };
}

function validateEmail(email) {
  const value = email.trim();
  if (!value) return "Please enter your email address.";
  if (!EMAIL_RE.test(value)) return "That doesn't look like a valid email. Try name@example.com.";
  return null;
}

// Validators return errors keyed by field, in on-screen order (used to focus the first one).
export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = "Please enter your password.";
  return errors;
}

export function validateSignup({ name, email, password, confirmPassword, terms }) {
  const errors = {};
  const trimmed = name.trim();
  if (!trimmed) errors.name = "Please tell us your name.";
  else if (trimmed.length < 2) errors.name = "Your name should be at least 2 characters.";
  else if (trimmed.length > 80) errors.name = "Please keep your name under 80 characters.";

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) errors.password = "Please create a password.";
  else if (password.length > 128) errors.password = "Passwords can be at most 128 characters.";
  else {
    const missing = PASSWORD_RULES.filter((r) => !r.test(password));
    if (missing.length) {
      errors.password = `Your password needs ${missing.map((r) => r.label.toLowerCase()).join(", ")}.`;
    }
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match yet.";

  if (!terms) errors.terms = "Please accept the Terms and Privacy Policy to continue.";
  return errors;
}
